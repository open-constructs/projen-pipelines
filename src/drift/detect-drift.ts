#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

interface DriftDetectionOptions {
  region: string;
  stackNames?: string[];
  timeout?: number;
  failOnDrift?: boolean;
}

interface DriftResult {
  stackName: string;
  driftStatus: 'IN_SYNC' | 'DRIFTED' | 'UNKNOWN' | 'NOT_CHECKED';
  driftedResources?: DriftedResource[];
  error?: string;
  knownErrorsHandled?: KnownErrorResult[];
}

interface KnownErrorResult {
  readonly resourceId: string;
  readonly errorType: string;
  readonly originalError: any;
  readonly handled: boolean;
  readonly message?: string;
}

interface DriftedResource {
  readonly logicalResourceId: string;
  readonly resourceType: string;
  readonly stackResourceDriftStatus: string;
  readonly propertyDifferences?: PropertyDifference[];
}

interface PropertyDifference {
  readonly propertyPath: string;
  readonly expectedValue: string;
  readonly actualValue: string;
  readonly differenceType: string;
}

class DriftDetector {
  private readonly options: DriftDetectionOptions;
  private readonly results: DriftResult[] = [];

  constructor(options: DriftDetectionOptions) {
    this.options = {
      timeout: 30,
      failOnDrift: true,
      ...options,
    };
  }

  public async run(): Promise<void> {
    console.log(`Starting drift detection in region ${this.options.region}`);

    try {
      const stacks = await this.getStacksToCheck();

      for (const stackName of stacks) {
        await this.checkStackDrift(stackName);
      }

      this.printSummary();
      this.saveResults();

      if (this.shouldFail()) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Fatal error during drift detection:', error);
      process.exit(2);
    }
  }

  private async getStacksToCheck(): Promise<string[]> {
    if (this.options.stackNames && this.options.stackNames.length > 0) {
      return this.options.stackNames;
    }

    console.log('Getting all stacks in the region...');
    const output = execSync(
      `aws cloudformation list-stacks --region ${this.options.region} --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query 'StackSummaries[].StackName' --output json`,
      { encoding: 'utf8' },
    );

    return JSON.parse(output);
  }

  private async checkStackDrift(stackName: string): Promise<void> {
    console.log(`\nChecking drift for stack: ${stackName}`);

    const result: DriftResult = {
      stackName,
      driftStatus: 'NOT_CHECKED',
    };

    try {
      // Start drift detection
      const driftId = await this.startDriftDetection(stackName);
      console.log(`Started drift detection with ID: ${driftId}`);

      // Wait for completion
      const driftStatus = await this.waitForDriftDetection(driftId);
      result.driftStatus = driftStatus;

      if (driftStatus === 'DRIFTED') {
        result.driftedResources = await this.getDriftedResources(stackName);
        console.log(`DRIFT DETECTED in stack ${stackName}!`);

        // Handle known drift errors
        result.knownErrorsHandled = await this.handleKnownDriftErrors(result.driftedResources);

        // Print drift details
        this.printDriftDetails(result);
      } else if (driftStatus === 'IN_SYNC') {
        console.log(`Stack ${stackName} is in sync`);
      }
    } catch (error: any) {
      console.error(`Error checking drift for stack ${stackName}:`, error.message);
      result.error = error.message;
    }

    this.results.push(result);
  }

  private async startDriftDetection(stackName: string): Promise<string> {
    const output = execSync(
      `aws cloudformation detect-stack-drift --stack-name ${stackName} --region ${this.options.region} --query 'StackDriftDetectionId' --output text`,
      { encoding: 'utf8' },
    );

    return output.trim();
  }

  private async waitForDriftDetection(driftId: string): Promise<'IN_SYNC' | 'DRIFTED' | 'UNKNOWN' | 'NOT_CHECKED'> {
    const timeout = this.options.timeout! * 60; // Convert to seconds
    const startTime = Date.now();

    while (true) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      if (elapsed > timeout) {
        throw new Error(`Drift detection timed out after ${this.options.timeout} minutes`);
      }

      const output = execSync(
        `aws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id ${driftId} --region ${this.options.region} --output json`,
        { encoding: 'utf8' },
      );

      const status = JSON.parse(output);
      console.log(`Drift detection status: ${status.DetectionStatus} (${elapsed}s elapsed)`);

      if (status.DetectionStatus === 'DETECTION_COMPLETE') {
        return status.StackDriftStatus as 'IN_SYNC' | 'DRIFTED' | 'UNKNOWN' | 'NOT_CHECKED';
      } else if (status.DetectionStatus === 'DETECTION_FAILED') {
        throw new Error(`Drift detection failed: ${status.DetectionStatusReason}`);
      }

      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  private async getDriftedResources(stackName: string): Promise<DriftedResource[]> {
    const output = execSync(
      `aws cloudformation describe-stack-resource-drifts --stack-name ${stackName} --region ${this.options.region} --stack-resource-drift-status-filters MODIFIED DELETED --output json`,
      { encoding: 'utf8' },
    );

    const response = JSON.parse(output);
    return response.StackResourceDrifts.map((drift: any) => ({
      logicalResourceId: drift.LogicalResourceId,
      resourceType: drift.ResourceType,
      stackResourceDriftStatus: drift.StackResourceDriftStatus,
      propertyDifferences: drift.PropertyDifferences?.map((diff: any) => ({
        propertyPath: diff.PropertyPath,
        expectedValue: diff.ExpectedValue,
        actualValue: diff.ActualValue,
        differenceType: diff.DifferenceType,
      })),
    }));
  }

  /**
   * Handle known drift errors for specific resources
   * This method can be extended later to implement custom logic for known issues
   */
  private async handleKnownDriftErrors(driftedResources?: DriftedResource[]): Promise<KnownErrorResult[]> {
    const knownErrors: KnownErrorResult[] = [];

    if (!driftedResources) {
      return knownErrors;
    }

    for (const _resource of driftedResources) {

      // TODO: Implement custom logic here for known drift errors
      // Example structure for handling known errors:

      // Check for Lambda runtime drift (common issue)
      // if (resource.resourceType === 'AWS::Lambda::Function' && resource.propertyDifferences) {
      //   const runtimeDrift = resource.propertyDifferences.find(diff =>
      //     diff.propertyPath === '/Runtime' || diff.propertyPath === 'Runtime',
      //   );

      //   if (runtimeDrift) {
      //     knownErrors.push({
      //       resourceId: resource.logicalResourceId,
      //       errorType: 'lambda-runtime-drift',
      //       originalError: runtimeDrift,
      //       handled: false, // Will be implemented later
      //       message: 'Lambda runtime drift detected - manual implementation needed',
      //     });
      //   }
      // }

      // // Check for auto-scaling related drift
      // if (resource.resourceType.includes('AutoScaling') && resource.propertyDifferences) {
      //   knownErrors.push({
      //     resourceId: resource.logicalResourceId,
      //     errorType: 'autoscaling-drift',
      //     originalError: resource.propertyDifferences,
      //     handled: false, // Will be implemented later
      //     message: 'Auto-scaling drift detected - manual implementation needed',
      //   });
      // }

      // Add more patterns here as needed
    }

    return knownErrors;
  }

  private printDriftDetails(result: DriftResult): void {
    if (!result.driftedResources || result.driftedResources.length === 0) {
      return;
    }

    console.log('\nDrifted resources:');
    console.log('=================');

    for (const resource of result.driftedResources) {
      console.log(`\n- ${resource.logicalResourceId} (${resource.resourceType})`);
      console.log(`  Status: ${resource.stackResourceDriftStatus}`);

      if (resource.propertyDifferences) {
        console.log('  Property differences:');
        for (const diff of resource.propertyDifferences) {
          console.log(`    ${diff.propertyPath}:`);
          console.log(`      Expected: ${diff.expectedValue}`);
          console.log(`      Actual: ${diff.actualValue}`);
          console.log(`      Type: ${diff.differenceType}`);
        }
      }
    }
  }

  private printSummary(): void {
    console.log('\n========== DRIFT DETECTION SUMMARY ==========');

    const driftedStacks = this.results.filter(r => r.driftStatus === 'DRIFTED');
    const syncedStacks = this.results.filter(r => r.driftStatus === 'IN_SYNC');
    const errorStacks = this.results.filter(r => r.error);

    console.log(`Total stacks checked: ${this.results.length}`);
    console.log(`In sync: ${syncedStacks.length}`);
    console.log(`Drifted: ${driftedStacks.length}`);
    console.log(`Errors: ${errorStacks.length}`);

    if (driftedStacks.length > 0) {
      console.log('\nDrifted stacks:');
      for (const stack of driftedStacks) {
        const resourceCount = stack.driftedResources?.length || 0;
        console.log(`  - ${stack.stackName} (${resourceCount} resources)`);
      }
    }

    if (errorStacks.length > 0) {
      console.log('\nStacks with errors:');
      for (const stack of errorStacks) {
        console.log(`  - ${stack.stackName}: ${stack.error}`);
      }
    }
  }

  private saveResults(): void {
    const outputFile = process.env.DRIFT_DETECTION_OUTPUT || 'drift-detection-results.json';
    writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
    console.log(`\nResults saved to: ${outputFile}`);
  }

  private shouldFail(): boolean {
    if (!this.options.failOnDrift) {
      return false;
    }

    return this.results.some(r => r.driftStatus === 'DRIFTED');
  }
}

// Parse command line arguments
function parseArgs(): DriftDetectionOptions {
  const args = process.argv.slice(2);
  const options: DriftDetectionOptions = {
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
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--no-fail-on-drift':
        options.failOnDrift = false;
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
Usage: detect-drift.ts [options]

Options:
  --region <region>           AWS region (default: us-east-1 or AWS_REGION env var)
  --stacks <stack1,stack2>    Comma-separated list of stack names (default: all stacks)
  --timeout <minutes>         Timeout in minutes (default: 30)
  --no-fail-on-drift         Don't exit with error code if drift is detected

Environment variables:
  AWS_REGION                  Default AWS region
  DRIFT_DETECTION_OUTPUT      Output file path (default: drift-detection-results.json)
`);
}

// Main entry point
if (require.main === module) {
  const options = parseArgs();
  const detector = new DriftDetector(options);
  detector.run().catch(console.error);
}

export { DriftDetector, DriftDetectionOptions, DriftResult, KnownErrorResult, DriftedResource };