import { Project } from 'projen';
import { SimpleCommandStep, StepSequence } from '../steps';

/**
 * Options for the ResourceCountStep.
 */
export interface ResourceCountStepOptions {
  /**
   * Path to the cloud assembly directory.
   * @default 'cdk.out'
   */
  readonly cloudAssemblyDir?: string;

  /**
   * Warning threshold for resource count.
   * @default 450
   */
  readonly warningThreshold?: number;

  /**
   * Hard resource limit.
   * @default 500
   */
  readonly resourceLimit?: number;

  /**
   * Output file path for results JSON.
   * @default 'resource-count-results.json'
   */
  readonly outputFile?: string;

  /**
   * Whether to write a GitHub Actions summary.
   * @default false
   */
  readonly githubSummary?: boolean;
}

/**
 * A pipeline step that runs the count-resources CLI to count CloudFormation
 * resources in the synthesized cloud assembly.
 */
export class ResourceCountStep extends StepSequence {
  constructor(project: Project, options?: ResourceCountStepOptions) {
    const args: string[] = [];

    if (options?.cloudAssemblyDir) {
      args.push('--cloud-assembly-dir', options.cloudAssemblyDir);
    }
    if (options?.warningThreshold !== undefined) {
      args.push('--warning-threshold', String(options.warningThreshold));
    }
    if (options?.resourceLimit !== undefined) {
      args.push('--resource-limit', String(options.resourceLimit));
    }
    if (options?.outputFile) {
      args.push('--output-file', options.outputFile);
    }
    if (options?.githubSummary) {
      args.push('--github-summary');
    }

    const command = `count-resources ${args.join(' ')}`.trim();

    super(project, [
      new SimpleCommandStep(project, [command]),
    ]);
  }
}
