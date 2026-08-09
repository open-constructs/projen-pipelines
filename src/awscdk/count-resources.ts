#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as path from 'path';

/**
 * Result of counting resources in a single stack.
 */
export interface StackResourceCount {
  /** The stack name (artifact ID). */
  readonly stackName: string;
  /** The number of resources in the stack. */
  readonly resourceCount: number;
  /** The configured resource limit. */
  readonly resourceLimit: number;
  /** The configured warning threshold. */
  readonly warningThreshold: number;
  /** Whether the stack exceeds the warning threshold. */
  readonly warning: boolean;
  /** Whether the stack exceeds the resource limit. */
  readonly exceeded: boolean;
  /** Percentage of the limit used. */
  readonly percentUsed: number;
}

/**
 * Full result of the resource counting operation.
 */
export interface ResourceCountResult {
  /** Individual stack results. */
  readonly stacks: StackResourceCount[];
  /** Whether any stack exceeded the warning threshold. */
  readonly hasWarnings: boolean;
  /** Whether any stack exceeded the resource limit. */
  readonly hasExceeded: boolean;
}

/**
 * Options for the ResourceCounter.
 */
export interface ResourceCounterOptions {
  /** Path to the cloud assembly directory. */
  readonly cloudAssemblyDir: string;
  /** Warning threshold for resource count. */
  readonly warningThreshold: number;
  /** Hard resource limit. */
  readonly resourceLimit: number;
  /** Output file path for results JSON. */
  readonly outputFile: string;
  /** Whether to write a GitHub Actions summary. */
  readonly githubSummary: boolean;
}

/**
 * Counts resources in CloudFormation templates from a CDK cloud assembly.
 */
export class ResourceCounter {
  private readonly options: ResourceCounterOptions;

  constructor(options: ResourceCounterOptions) {
    this.options = options;
  }

  /**
   * Run the resource counting operation.
   */
  public run(): ResourceCountResult {
    const manifestPath = path.join(this.options.cloudAssemblyDir, 'manifest.json');
    if (!existsSync(manifestPath)) {
      throw new Error(`Cloud assembly manifest not found at: ${manifestPath}`);
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const stacks: StackResourceCount[] = [];

    for (const [artifactId, artifact] of Object.entries(manifest.artifacts ?? {})) {
      const art = artifact as any;
      if (art.type !== 'aws:cloudformation:stack') {
        continue;
      }

      const templateFile = art.properties?.templateFile;
      if (!templateFile) {
        continue;
      }

      const templatePath = path.join(this.options.cloudAssemblyDir, templateFile);
      if (!existsSync(templatePath)) {
        console.warn(`Template not found for stack ${artifactId}: ${templatePath}`);
        continue;
      }

      const template = JSON.parse(readFileSync(templatePath, 'utf8'));
      const resourceCount = Object.keys(template.Resources ?? {}).length;
      const percentUsed = Math.round((resourceCount / this.options.resourceLimit) * 100);

      stacks.push({
        stackName: artifactId,
        resourceCount,
        resourceLimit: this.options.resourceLimit,
        warningThreshold: this.options.warningThreshold,
        warning: resourceCount >= this.options.warningThreshold,
        exceeded: resourceCount >= this.options.resourceLimit,
        percentUsed,
      });
    }

    const result: ResourceCountResult = {
      stacks,
      hasWarnings: stacks.some(s => s.warning),
      hasExceeded: stacks.some(s => s.exceeded),
    };

    // Write results to file
    writeFileSync(this.options.outputFile, JSON.stringify(result, null, 2));
    console.log(`Resource count results written to: ${this.options.outputFile}`);

    // Print summary to console
    this.printSummary(result);

    // Write GitHub summary if requested
    if (this.options.githubSummary && process.env.GITHUB_STEP_SUMMARY) {
      this.writeGithubSummary(result);
    }

    return result;
  }

  private printSummary(result: ResourceCountResult): void {
    console.log('\n=== CloudFormation Resource Count ===\n');
    for (const stack of result.stacks) {
      const status = stack.exceeded ? 'EXCEEDED' : stack.warning ? 'WARNING' : 'OK';
      console.log(`  ${stack.stackName}: ${stack.resourceCount}/${stack.resourceLimit} (${stack.percentUsed}%) [${status}]`);
    }
    console.log('');
    if (result.hasExceeded) {
      console.log('ERROR: One or more stacks exceed the resource limit!');
    } else if (result.hasWarnings) {
      console.log('WARNING: One or more stacks are approaching the resource limit!');
    } else {
      console.log('All stacks are within resource limits.');
    }
  }

  private writeGithubSummary(result: ResourceCountResult): void {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY!;
    const lines: string[] = [
      '## CloudFormation Resource Count',
      '',
      '| Stack | Resources | Limit | Usage | Status |',
      '| --- | --- | --- | --- | --- |',
    ];

    for (const stack of result.stacks) {
      const status = stack.exceeded ? '🔴 Exceeded' : stack.warning ? '🟡 Warning' : '🟢 OK';
      lines.push(`| ${stack.stackName} | ${stack.resourceCount} | ${stack.resourceLimit} | ${stack.percentUsed}% | ${status} |`);
    }

    writeFileSync(summaryPath, lines.join('\n') + '\n', { flag: 'a' });
  }
}

// Parse command line arguments
function parseArgs(): ResourceCounterOptions {
  const args = process.argv.slice(2);
  let cloudAssemblyDir = 'cdk.out';
  let warningThreshold = 450;
  let resourceLimit = 500;
  let outputFile = 'resource-count-results.json';
  let githubSummary = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--cloud-assembly-dir':
        cloudAssemblyDir = args[++i];
        break;
      case '--warning-threshold':
        warningThreshold = parseInt(args[++i]);
        break;
      case '--resource-limit':
        resourceLimit = parseInt(args[++i]);
        break;
      case '--output-file':
        outputFile = args[++i];
        break;
      case '--github-summary':
        githubSummary = true;
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return { cloudAssemblyDir, warningThreshold, resourceLimit, outputFile, githubSummary };
}

function printUsage(): void {
  console.log(`
Usage: count-resources [options]

Options:
  --cloud-assembly-dir <dir>    Path to cloud assembly directory (default: cdk.out)
  --warning-threshold <n>       Warning threshold for resource count (default: 450)
  --resource-limit <n>          Hard resource limit (default: 500)
  --output-file <file>          Output file for results JSON (default: resource-count-results.json)
  --github-summary              Write a summary to GitHub Actions step summary
`);
}

// Main entry point
if (require.main === module) {
  const options = parseArgs();
  const counter = new ResourceCounter(options);
  try {
    const result = counter.run();
    if (result.hasExceeded) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during resource counting:', error);
    process.exit(2);
  }
}
