#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ResourceCountOptions {
  cloudAssemblyDir: string;
  warningThreshold?: number;
  outputFile?: string;
  githubSummary?: boolean;
}

interface StackResourceCount {
  stackName: string;
  resourceCount: number;
  templateFile: string;
  warning?: string;
}

interface ResourceCountResult {
  stacks: StackResourceCount[];
  totalResources: number;
  maxResourcesInStack: number;
  timestamp: string;
}

class ResourceCounter {
  private readonly options: ResourceCountOptions;
  private readonly warningThreshold: number;
  private readonly results: StackResourceCount[] = [];

  constructor(options: ResourceCountOptions) {
    this.options = options;
    this.warningThreshold = options.warningThreshold ?? 450;
  }

  public run(): void {
    console.log(`Counting resources in cloud assembly: ${this.options.cloudAssemblyDir}`);
    console.log(`Warning threshold: ${this.warningThreshold} resources`);

    try {
      this.countResources();
      this.printSummary();
      this.saveResults();

      if (this.options.githubSummary) {
        this.writeGitHubSummary();
      }
    } catch (error) {
      console.error('Error counting resources:', error);
      process.exit(1);
    }
  }

  private countResources(): void {
    const manifestPath = join(this.options.cloudAssemblyDir, 'manifest.json');

    if (!existsSync(manifestPath)) {
      throw new Error(`Cloud assembly manifest not found at ${manifestPath}`);
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    // Find all CloudFormation stack artifacts
    const artifacts = manifest.artifacts || {};

    for (const [artifactId, artifact] of Object.entries(artifacts)) {
      if ((artifact as any).type === 'aws:cloudformation:stack') {
        const stackArtifact = artifact as any;
        const templateFile = stackArtifact.properties?.templateFile;

        if (templateFile) {
          const templatePath = join(this.options.cloudAssemblyDir, templateFile);
          const resourceCount = this.countResourcesInTemplate(templatePath);

          const stackResult: StackResourceCount = {
            stackName: artifactId,
            resourceCount,
            templateFile,
          };

          // Add warning if threshold is crossed
          if (resourceCount >= this.warningThreshold) {
            const percentOfLimit = Math.round((resourceCount / 500) * 100);
            stackResult.warning = `Stack is at ${percentOfLimit}% of CloudFormation's 500 resource limit`;
          }

          this.results.push(stackResult);
        }
      }
    }
  }

  private countResourcesInTemplate(templatePath: string): number {
    try {
      const template = JSON.parse(readFileSync(templatePath, 'utf8'));
      const resources = template.Resources || {};
      return Object.keys(resources).length;
    } catch (error) {
      console.warn(`Warning: Could not read template ${templatePath}:`, error);
      return 0;
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('Resource Count Summary');
    console.log('='.repeat(80));

    if (this.results.length === 0) {
      console.log('No stacks found in cloud assembly');
      return;
    }

    const totalResources = this.results.reduce((sum, r) => sum + r.resourceCount, 0);
    const maxResources = Math.max(...this.results.map(r => r.resourceCount));
    const stacksWithWarnings = this.results.filter(r => r.warning);

    console.log(`\nTotal stacks: ${this.results.length}`);
    console.log(`Total resources: ${totalResources}`);
    console.log(`Max resources in a single stack: ${maxResources}`);

    console.log('\nPer-stack breakdown:');
    for (const stack of this.results) {
      const percentage = Math.round((stack.resourceCount / 500) * 100);
      const statusIcon = stack.warning ? '⚠️ ' : '✓ ';
      console.log(`  ${statusIcon} ${stack.stackName}: ${stack.resourceCount} resources (${percentage}% of limit)`);

      if (stack.warning) {
        console.log(`    ⚠️  ${stack.warning}`);
      }
    }

    if (stacksWithWarnings.length > 0) {
      console.log('\n' + '!'.repeat(80));
      console.log(`WARNING: ${stacksWithWarnings.length} stack(s) approaching CloudFormation resource limit!`);
      console.log('!'.repeat(80));
      console.log('\nConsider:');
      console.log('  - Breaking large stacks into smaller, focused stacks');
      console.log('  - Using nested stacks for reusable components');
      console.log('  - Reviewing resource usage and removing unnecessary resources');
      console.log('  - CloudFormation hard limit is 500 resources per stack');
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  private writeGitHubSummary(): void {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) {
      console.log('GITHUB_STEP_SUMMARY not set, skipping GitHub summary');
      return;
    }

    const totalResources = this.results.reduce((sum, r) => sum + r.resourceCount, 0);
    const maxResources = Math.max(...this.results.map(r => r.resourceCount));
    const stacksWithWarnings = this.results.filter(r => r.warning);

    let summary = '## 📊 CloudFormation Resource Count\n\n';
    summary += '### Summary\n';
    summary += `- **Total stacks:** ${this.results.length}\n`;
    summary += `- **Total resources:** ${totalResources}\n`;
    summary += `- **Max resources in single stack:** ${maxResources}\n`;
    summary += `- **Warning threshold:** ${this.warningThreshold} resources\n`;
    summary += '- **CloudFormation limit:** 500 resources per stack\n\n';

    if (stacksWithWarnings.length > 0) {
      summary += '### ⚠️ Stacks Approaching Limit\n\n';
      summary += `${stacksWithWarnings.length} stack(s) have crossed the warning threshold:\n\n`;

      for (const stack of stacksWithWarnings) {
        const percentage = Math.round((stack.resourceCount / 500) * 100);
        summary += `- **${stack.stackName}**: ${stack.resourceCount} resources (${percentage}% of limit)\n`;
      }

      summary += '\n**Recommendations:**\n';
      summary += '- Consider breaking large stacks into smaller, focused stacks\n';
      summary += '- Use nested stacks for reusable components\n';
      summary += '- Review resource usage and remove unnecessary resources\n\n';
    }

    summary += '### Stack Details\n\n';
    summary += '| Stack | Resources | % of Limit | Status |\n';
    summary += '|-------|-----------|------------|--------|\n';

    for (const stack of this.results.sort((a, b) => b.resourceCount - a.resourceCount)) {
      const percentage = Math.round((stack.resourceCount / 500) * 100);
      const status = stack.warning ? '⚠️ Warning' : '✅ OK';
      summary += `| ${stack.stackName} | ${stack.resourceCount} | ${percentage}% | ${status} |\n`;
    }

    try {
      writeFileSync(summaryFile, summary, { flag: 'a' });
      console.log('GitHub summary written successfully');
    } catch (error) {
      console.error('Failed to write GitHub summary:', error);
    }
  }

  private saveResults(): void {
    const outputFile = this.options.outputFile || 'resource-count-results.json';

    const result: ResourceCountResult = {
      stacks: this.results,
      totalResources: this.results.reduce((sum, r) => sum + r.resourceCount, 0),
      maxResourcesInStack: Math.max(...this.results.map(r => r.resourceCount), 0),
      timestamp: new Date().toISOString(),
    };

    writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`Results saved to ${outputFile}`);
  }
}

// Parse command line arguments
function parseArgs(): ResourceCountOptions {
  const args = process.argv.slice(2);
  const options: ResourceCountOptions = {
    cloudAssemblyDir: 'cdk.out',
    warningThreshold: 450,
    githubSummary: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--cloud-assembly-dir':
      case '-d':
        options.cloudAssemblyDir = args[++i];
        break;
      case '--warning-threshold':
      case '-t':
        options.warningThreshold = parseInt(args[++i], 10);
        break;
      case '--output-file':
      case '-o':
        options.outputFile = args[++i];
        break;
      case '--github-summary':
      case '-g':
        options.githubSummary = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: count-resources.ts [options]

Options:
  -d, --cloud-assembly-dir <dir>    Cloud assembly directory (default: cdk.out)
  -t, --warning-threshold <number>  Warning threshold for resource count (default: 450)
  -o, --output-file <file>         Output file for results (default: resource-count-results.json)
  -g, --github-summary             Write results to GitHub step summary
  -h, --help                       Show this help message
`);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const counter = new ResourceCounter(options);
  counter.run();
}

export { ResourceCounter, ResourceCountOptions, ResourceCountResult, StackResourceCount };
