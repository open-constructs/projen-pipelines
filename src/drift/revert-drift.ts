#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const DEFAULT_EXCLUDE = ['AWS::RDS::*', 'AWS::DynamoDB::Table'];

interface DriftedResource {
  readonly logicalResourceId: string;
  readonly resourceType: string;
  readonly stackResourceDriftStatus: string;
}

interface DriftResult {
  stackName: string;
  driftStatus: 'IN_SYNC' | 'DRIFTED' | 'UNKNOWN' | 'NOT_CHECKED';
  driftedResources?: DriftedResource[];
}

export interface ClassifyOptions {
  readonly includeResourceTypes?: string[];
  readonly excludeResourceTypes?: string[];
}

export interface ClassifiedDrift {
  /** Resources that may be reverted. */
  readonly revertable: DriftedResource[];
  /** Resources matching an exclude glob (block auto-remediation). */
  readonly excluded: DriftedResource[];
  /** Deleted resources (never revertable via REVERT_DRIFT). */
  readonly deletions: DriftedResource[];
}

/**
 * Convert a resource-type glob (e.g. `AWS::RDS::*`) to a RegExp.
 */
function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function matchesAny(resourceType: string, globs: string[]): boolean {
  return globs.some(g => globToRegExp(g).test(resourceType));
}

/**
 * Classify drifted resources into revertable, excluded, and deletion buckets.
 *
 * - Deletions are never revertable (CloudFormation cannot revert a deleted
 *   resource).
 * - A resource matching `excludeResourceTypes` is excluded (blocks auto).
 * - When `includeResourceTypes` is set, only matching types are revertable.
 */
export function classifyDrift(
  resources: DriftedResource[],
  options: ClassifyOptions = {},
): ClassifiedDrift {
  const exclude = options.excludeResourceTypes ?? DEFAULT_EXCLUDE;
  const include = options.includeResourceTypes;

  const revertable: DriftedResource[] = [];
  const excluded: DriftedResource[] = [];
  const deletions: DriftedResource[] = [];

  for (const r of resources) {
    if (r.stackResourceDriftStatus === 'DELETED') {
      deletions.push(r);
      continue;
    }
    if (matchesAny(r.resourceType, exclude)) {
      excluded.push(r);
      continue;
    }
    if (include && include.length > 0 && !matchesAny(r.resourceType, include)) {
      // Not in the allow-list: skip silently (neither revertable nor excluded).
      continue;
    }
    revertable.push(r);
  }

  return { revertable, excluded, deletions };
}

export interface DriftReverterOptions {
  readonly region: string;
  readonly stackNames?: string[];
  readonly includeResourceTypes?: string[];
  readonly excludeResourceTypes?: string[];
  /** Read drift results from a prior detect-drift run instead of re-detecting. */
  readonly resultsFile?: string;
  /** Skip interactive confirmation. */
  readonly yes?: boolean;
}

/**
 * Reverts drifted CloudFormation stacks back to their deployed template using a
 * `REVERT_DRIFT` change-set. CloudFormation-only: no CDK synth is performed.
 */
export class DriftReverter {
  private readonly options: DriftReverterOptions;

  constructor(options: DriftReverterOptions) {
    this.options = options;
  }

  public async run(): Promise<void> {
    const results = this.loadResults();
    const drifted = results.filter(r => r.driftStatus === 'DRIFTED');

    if (drifted.length === 0) {
      console.log('No drifted stacks to remediate.');
      return;
    }

    let failed = false;
    for (const stack of drifted) {
      const classified = classifyDrift(stack.driftedResources ?? [], {
        includeResourceTypes: this.options.includeResourceTypes,
        excludeResourceTypes: this.options.excludeResourceTypes,
      });

      this.printClassification(stack.stackName, classified);

      if (classified.excluded.length > 0) {
        console.log(
          `Stack ${stack.stackName} has drift in excluded resource types; skipping automatic revert.`,
        );
        failed = true;
        continue;
      }

      if (classified.revertable.length === 0) {
        console.log(`Stack ${stack.stackName} has no revertable drift; skipping.`);
        continue;
      }

      try {
        this.revertStack(stack.stackName);
      } catch (err: any) {
        console.error(`Failed to revert ${stack.stackName}: ${err.message}`);
        failed = true;
      }
    }

    if (failed) {
      process.exit(1);
    }
  }

  private loadResults(): DriftResult[] {
    const file = this.options.resultsFile ?? process.env.DRIFT_DETECTION_OUTPUT;
    if (!file || !existsSync(file)) {
      throw new Error(`Drift results file not found: ${file ?? '(unset)'}`);
    }
    return JSON.parse(readFileSync(file, 'utf8'));
  }

  private printClassification(stackName: string, c: ClassifiedDrift): void {
    console.log(`\nStack ${stackName}:`);
    console.log(`  Revertable: ${c.revertable.length}`);
    console.log(`  Excluded (sensitive): ${c.excluded.length}`);
    console.log(`  Deletions (non-revertable): ${c.deletions.length}`);
  }

  private revertStack(stackName: string): void {
    const changeSetName = `revert-drift-${Date.now()}`;
    console.log(`Creating REVERT_DRIFT change-set for ${stackName}...`);
    execSync(
      [
        'aws cloudformation create-change-set',
        `--stack-name ${stackName}`,
        `--change-set-name ${changeSetName}`,
        '--use-previous-template',
        '--change-set-type UPDATE',
        '--import-existing-resources',
        `--region ${this.options.region}`,
      ].join(' '),
      { encoding: 'utf8', stdio: 'inherit' },
    );

    execSync(
      `aws cloudformation wait change-set-create-complete --stack-name ${stackName} --change-set-name ${changeSetName} --region ${this.options.region}`,
      { encoding: 'utf8', stdio: 'inherit' },
    );

    console.log(`Executing REVERT_DRIFT change-set for ${stackName}...`);
    execSync(
      `aws cloudformation execute-change-set --stack-name ${stackName} --change-set-name ${changeSetName} --deployment-mode REVERT_DRIFT --region ${this.options.region}`,
      { encoding: 'utf8', stdio: 'inherit' },
    );

    execSync(
      `aws cloudformation wait stack-update-complete --stack-name ${stackName} --region ${this.options.region}`,
      { encoding: 'utf8', stdio: 'inherit' },
    );
    console.log(`Reverted ${stackName}.`);
  }
}

function parseArgs(): DriftReverterOptions {
  const args = process.argv.slice(2);
  const options: Mutable<DriftReverterOptions> = {
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
      case '--results':
        options.resultsFile = args[++i];
        break;
      case '--include-resource-types':
        options.includeResourceTypes = args[++i].split(',');
        break;
      case '--exclude-resource-types':
        options.excludeResourceTypes = args[++i].split(',');
        break;
      case '--yes':
        options.yes = true;
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

if (require.main === module) {
  const reverter = new DriftReverter(parseArgs());
  reverter.run().catch(err => {
    console.error(err);
    process.exit(2);
  });
}
