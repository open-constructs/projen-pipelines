#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Actions that classifyDrift can assign to a drifted resource.
 * - 'revert': eligible for REVERT_DRIFT change set
 * - 'skip': excluded by filter or unsupported (deletion drift)
 * - 'gate': would normally auto-revert but hits an exclude rule — downgrade to manual
 */
export type DriftResourceAction = 'revert' | 'skip' | 'gate';

export interface ClassifiedResource {
  readonly logicalResourceId: string;
  readonly resourceType: string;
  readonly stackResourceDriftStatus: string;
  readonly action: DriftResourceAction;
  readonly reason?: string;
}

export interface ClassifyDriftOptions {
  readonly includeResourceTypes?: string[];
  readonly excludeResourceTypes?: string[];
}

export interface RevertDriftOptions {
  region: string;
  stackNames?: string[];
  includeResourceTypes?: string[];
  excludeResourceTypes?: string[];
  detectionResultsFile?: string;
  yes?: boolean;
}

export interface RevertResult {
  stackName: string;
  changeSetName?: string;
  status: 'reverted' | 'skipped' | 'failed' | 'no-changes' | 'gated';
  revertedResourceCount: number;
  skippedResourceCount: number;
  gatedResourceCount: number;
  error?: string;
  classifiedResources?: ClassifiedResource[];
}

export interface RemediationReport {
  stageName: string;
  results: RevertResult[];
  summary: {
    totalStacks: number;
    revertedStacks: number;
    skippedStacks: number;
    failedStacks: number;
    gatedStacks: number;
    totalRevertedResources: number;
    totalSkippedResources: number;
    totalGatedResources: number;
  };
}

/**
 * Matches a CFN resource type against a glob pattern.
 * Supports trailing wildcard only: 'AWS::S3::*' matches 'AWS::S3::Bucket'.
 */
export function matchesResourceTypeGlob(resourceType: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('::*')) {
    const prefix = pattern.slice(0, -1); // 'AWS::S3::'
    return resourceType.startsWith(prefix);
  }
  if (pattern.endsWith(':*')) {
    const prefix = pattern.slice(0, -1); // e.g. 'AWS::S3:'
    return resourceType.startsWith(prefix);
  }
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return resourceType.startsWith(prefix);
  }
  return resourceType === pattern;
}

/**
 * Classifies each drifted resource into an action based on include/exclude
 * filters and drift status.
 *
 * Rules:
 * 1. DELETED resources are always 'skip' (REVERT_DRIFT cannot recreate).
 * 2. If excludeResourceTypes matches, action is 'gate' (downgrades auto→manual).
 * 3. If includeResourceTypes is set, only matching types get 'revert'; others 'skip'.
 * 4. Otherwise, 'revert'.
 */
export function classifyDrift(
  driftedResources: Array<{ logicalResourceId: string; resourceType: string; stackResourceDriftStatus: string }>,
  options: ClassifyDriftOptions = {},
): ClassifiedResource[] {
  const { includeResourceTypes, excludeResourceTypes } = options;

  return driftedResources.map(resource => {
    // Rule 1: Deleted resources cannot be reverted
    if (resource.stackResourceDriftStatus === 'DELETED') {
      return {
        ...resource,
        action: 'skip' as DriftResourceAction,
        reason: 'REVERT_DRIFT cannot recreate deleted resources',
      };
    }

    // Rule 2: Excluded resource types trigger a gate (auto→manual downgrade)
    if (excludeResourceTypes && excludeResourceTypes.some(p => matchesResourceTypeGlob(resource.resourceType, p))) {
      return {
        ...resource,
        action: 'gate' as DriftResourceAction,
        reason: `Resource type ${resource.resourceType} is in excludeResourceTypes`,
      };
    }

    // Rule 3: If includeResourceTypes is set, only matching types are eligible
    if (includeResourceTypes && includeResourceTypes.length > 0) {
      const included = includeResourceTypes.some(p => matchesResourceTypeGlob(resource.resourceType, p));
      if (!included) {
        return {
          ...resource,
          action: 'skip' as DriftResourceAction,
          reason: `Resource type ${resource.resourceType} not in includeResourceTypes`,
        };
      }
    }

    // Rule 4: Default — eligible for revert
    return {
      ...resource,
      action: 'revert' as DriftResourceAction,
    };
  });
}

class DriftReverter {
  private readonly options: RevertDriftOptions;
  private readonly results: RevertResult[] = [];

  constructor(options: RevertDriftOptions) {
    this.options = options;
  }

  public async run(): Promise<void> {
    console.log(`Starting drift remediation in region ${this.options.region}`);

    try {
      const detectionResults = this.loadDetectionResults();

      if (!detectionResults || detectionResults.length === 0) {
        console.log('No detection results found. Nothing to remediate.');
        this.saveResults();
        return;
      }

      // Filter to only drifted stacks
      const driftedStacks = detectionResults.filter(
        (r: any) => r.driftStatus === 'DRIFTED' && r.driftedResources && r.driftedResources.length > 0,
      );

      if (driftedStacks.length === 0) {
        console.log('No drifted stacks found. Nothing to remediate.');
        this.saveResults();
        return;
      }

      // Optionally filter by stack names
      const targetStacks = this.options.stackNames && this.options.stackNames.length > 0
        ? driftedStacks.filter((s: any) => this.options.stackNames!.includes(s.stackName))
        : driftedStacks;

      for (const stack of targetStacks) {
        await this.processStack(stack);
      }

      this.printSummary();
      this.saveResults();

      // Exit with error if any stack failed
      if (this.results.some(r => r.status === 'failed')) {
        process.exit(1);
      }

      // Exit with code 2 if any stack was gated (auto→manual downgrade)
      if (this.results.some(r => r.status === 'gated')) {
        process.exit(2);
      }
    } catch (error) {
      console.error('Fatal error during drift remediation:', error);
      process.exit(3);
    }
  }

  private loadDetectionResults(): any[] {
    const inputFile = this.options.detectionResultsFile
      || process.env.DRIFT_DETECTION_INPUT
      || 'drift-detection-results.json';

    try {
      const content = readFileSync(inputFile, 'utf8');
      return JSON.parse(content);
    } catch (error: any) {
      console.error(`Failed to read detection results from ${inputFile}: ${error.message}`);
      return [];
    }
  }

  private async processStack(stack: any): Promise<void> {
    const stackName: string = stack.stackName;
    console.log(`\nProcessing stack: ${stackName}`);

    const classified = classifyDrift(stack.driftedResources, {
      includeResourceTypes: this.options.includeResourceTypes,
      excludeResourceTypes: this.options.excludeResourceTypes,
    });

    const revertable = classified.filter(r => r.action === 'revert');
    const skipped = classified.filter(r => r.action === 'skip');
    const gated = classified.filter(r => r.action === 'gate');

    console.log(`  Revertable: ${revertable.length}, Skipped: ${skipped.length}, Gated: ${gated.length}`);

    // If any resources are gated, the whole stack is gated (auto→manual downgrade)
    if (gated.length > 0) {
      console.log(`  Stack ${stackName} has gated resources — requires manual approval`);
      for (const r of gated) {
        console.log(`    - ${r.logicalResourceId} (${r.resourceType}): ${r.reason}`);
      }
      this.results.push({
        stackName,
        status: 'gated',
        revertedResourceCount: 0,
        skippedResourceCount: skipped.length,
        gatedResourceCount: gated.length,
        classifiedResources: classified,
      });
      return;
    }

    // If nothing is revertable, skip
    if (revertable.length === 0) {
      console.log(`  No revertable resources in stack ${stackName}. Skipping.`);
      this.results.push({
        stackName,
        status: 'skipped',
        revertedResourceCount: 0,
        skippedResourceCount: skipped.length,
        gatedResourceCount: 0,
        classifiedResources: classified,
      });
      return;
    }

    // Execute the REVERT_DRIFT change set
    try {
      const changeSetName = `drift-revert-${Date.now()}`;
      console.log(`  Creating REVERT_DRIFT change set: ${changeSetName}`);

      // Create change set with REVERT_DRIFT deployment mode
      execSync(
        'aws cloudformation create-change-set ' +
        `--stack-name "${stackName}" ` +
        `--change-set-name "${changeSetName}" ` +
        '--change-set-type UPDATE ' +
        '--use-previous-template ' +
        '--deployment-mode REVERT_DRIFT ' +
        `--region ${this.options.region}`,
        { encoding: 'utf8', stdio: 'pipe' },
      );

      // Wait for change set to be created
      console.log('  Waiting for change set creation...');
      try {
        execSync(
          'aws cloudformation wait change-set-create-complete ' +
          `--stack-name "${stackName}" ` +
          `--change-set-name "${changeSetName}" ` +
          `--region ${this.options.region}`,
          { encoding: 'utf8', stdio: 'pipe' },
        );
      } catch (waitError: any) {
        // Check if the change set has no changes
        const describeOutput = execSync(
          'aws cloudformation describe-change-set ' +
          `--stack-name "${stackName}" ` +
          `--change-set-name "${changeSetName}" ` +
          `--region ${this.options.region} ` +
          '--output json',
          { encoding: 'utf8', stdio: 'pipe' },
        );
        const changeSetInfo = JSON.parse(describeOutput);

        if (changeSetInfo.StatusReason?.includes('didn\'t contain changes')) {
          console.log('  Change set contains no changes. Deleting and skipping.');
          execSync(
            'aws cloudformation delete-change-set ' +
            `--stack-name "${stackName}" ` +
            `--change-set-name "${changeSetName}" ` +
            `--region ${this.options.region}`,
            { encoding: 'utf8', stdio: 'pipe' },
          );
          this.results.push({
            stackName,
            changeSetName,
            status: 'no-changes',
            revertedResourceCount: 0,
            skippedResourceCount: skipped.length,
            gatedResourceCount: 0,
            classifiedResources: classified,
          });
          return;
        }
        throw waitError;
      }

      // Execute the change set
      console.log('  Executing change set...');
      execSync(
        'aws cloudformation execute-change-set ' +
        `--stack-name "${stackName}" ` +
        `--change-set-name "${changeSetName}" ` +
        `--region ${this.options.region}`,
        { encoding: 'utf8', stdio: 'pipe' },
      );

      // Wait for stack update to complete
      console.log('  Waiting for stack update to complete...');
      execSync(
        'aws cloudformation wait stack-update-complete ' +
        `--stack-name "${stackName}" ` +
        `--region ${this.options.region}`,
        { encoding: 'utf8', stdio: 'pipe' },
      );

      console.log(`  Successfully reverted drift in stack ${stackName}`);
      this.results.push({
        stackName,
        changeSetName,
        status: 'reverted',
        revertedResourceCount: revertable.length,
        skippedResourceCount: skipped.length,
        gatedResourceCount: 0,
        classifiedResources: classified,
      });
    } catch (error: any) {
      console.error(`  Failed to revert drift in stack ${stackName}: ${error.message}`);
      this.results.push({
        stackName,
        status: 'failed',
        revertedResourceCount: 0,
        skippedResourceCount: skipped.length,
        gatedResourceCount: 0,
        error: error.message,
        classifiedResources: classified,
      });
    }
  }

  private printSummary(): void {
    console.log('\n========== DRIFT REMEDIATION SUMMARY ==========');

    const reverted = this.results.filter(r => r.status === 'reverted');
    const skippedStacks = this.results.filter(r => r.status === 'skipped');
    const noChanges = this.results.filter(r => r.status === 'no-changes');
    const failed = this.results.filter(r => r.status === 'failed');
    const gatedStacks = this.results.filter(r => r.status === 'gated');

    console.log(`Total stacks processed: ${this.results.length}`);
    console.log(`Reverted: ${reverted.length}`);
    console.log(`Skipped: ${skippedStacks.length}`);
    console.log(`No changes: ${noChanges.length}`);
    console.log(`Gated (requires approval): ${gatedStacks.length}`);
    console.log(`Failed: ${failed.length}`);

    const totalRevertedResources = this.results.reduce((sum, r) => sum + r.revertedResourceCount, 0);
    const totalSkippedResources = this.results.reduce((sum, r) => sum + r.skippedResourceCount, 0);
    const totalGatedResources = this.results.reduce((sum, r) => sum + r.gatedResourceCount, 0);

    console.log(`\nTotal resources reverted: ${totalRevertedResources}`);
    console.log(`Total resources skipped: ${totalSkippedResources}`);
    console.log(`Total resources gated: ${totalGatedResources}`);

    if (failed.length > 0) {
      console.log('\nFailed stacks:');
      for (const stack of failed) {
        console.log(`  - ${stack.stackName}: ${stack.error}`);
      }
    }

    if (gatedStacks.length > 0) {
      console.log('\nGated stacks (auto→manual downgrade):');
      for (const stack of gatedStacks) {
        console.log(`  - ${stack.stackName} (${stack.gatedResourceCount} gated resources)`);
      }
    }
  }

  private saveResults(): void {
    const outputFile = process.env.DRIFT_REMEDIATION_OUTPUT || 'drift-remediation-results.json';

    const stageName = process.env.STAGE_NAME || 'unknown';
    const report: RemediationReport = {
      stageName,
      results: this.results,
      summary: {
        totalStacks: this.results.length,
        revertedStacks: this.results.filter(r => r.status === 'reverted').length,
        skippedStacks: this.results.filter(r => r.status === 'skipped' || r.status === 'no-changes').length,
        failedStacks: this.results.filter(r => r.status === 'failed').length,
        gatedStacks: this.results.filter(r => r.status === 'gated').length,
        totalRevertedResources: this.results.reduce((sum, r) => sum + r.revertedResourceCount, 0),
        totalSkippedResources: this.results.reduce((sum, r) => sum + r.skippedResourceCount, 0),
        totalGatedResources: this.results.reduce((sum, r) => sum + r.gatedResourceCount, 0),
      },
    };

    writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`\nRemediation results saved to: ${outputFile}`);
  }
}

// Parse command line arguments
function parseArgs(): RevertDriftOptions {
  const args = process.argv.slice(2);
  const options: RevertDriftOptions = {
    region: process.env.AWS_REGION || 'us-east-1',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--region':
        options.region = args[++i];
        break;
      case '--stacks':
        options.stackNames = args[++i].split(',');
        break;
      case '--include-resource-types':
        options.includeResourceTypes = args[++i].split(',');
        break;
      case '--exclude-resource-types':
        options.excludeResourceTypes = args[++i].split(',');
        break;
      case '--detection-results':
        options.detectionResultsFile = args[++i];
        break;
      case '--yes':
      case '-y':
        options.yes = true;
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return options;
}

function printUsage(): void {
  console.log(`
Usage: revert-drift [options]

Options:
  --region <region>                         AWS region (default: us-east-1 or AWS_REGION env var)
  --stacks <stack1,stack2>                  Comma-separated list of stack names to revert
  --include-resource-types <type1,type2>    Only revert these CFN resource types (glob patterns)
  --exclude-resource-types <type1,type2>    Never revert these CFN resource types (glob patterns)
  --detection-results <file>                Path to detection results JSON file
  --yes, -y                                 Skip confirmation prompts (for auto mode)

Environment variables:
  AWS_REGION                   Default AWS region
  DRIFT_DETECTION_INPUT        Input file path (default: drift-detection-results.json)
  DRIFT_REMEDIATION_OUTPUT     Output file path (default: drift-remediation-results.json)
  STAGE_NAME                   Name of the current stage
`);
}

// Main entry point
if (require.main === module) {
  const options = parseArgs();
  const reverter = new DriftReverter(options);
  reverter.run().catch(console.error);
}

export { DriftReverter };
