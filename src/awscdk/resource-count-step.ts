import { Project } from 'projen';
import { StepSequence, PipelineStep, SimpleCommandStep } from '../steps';

export interface ResourceCountStepProps {
  /**
   * Path to the cloud assembly directory
   * @default 'cdk.out'
   */
  readonly cloudAssemblyDir?: string;

  /**
   * Warning threshold for resource count
   * @default 450
   */
  readonly warningThreshold?: number;

  /**
   * Output file for results
   * @default 'resource-count-results.json'
   */
  readonly outputFile?: string;

  /**
   * Whether to write results to GitHub step summary
   * @default true
   */
  readonly githubSummary?: boolean;
}

export class ResourceCountStep extends StepSequence {
  private static generateCommand(props: ResourceCountStepProps): string {
    const args: string[] = [
      'count-resources',
      '--cloud-assembly-dir', props.cloudAssemblyDir ?? 'cdk.out',
    ];

    if (props.warningThreshold !== undefined) {
      args.push('--warning-threshold', props.warningThreshold.toString());
    }

    if (props.outputFile) {
      args.push('--output-file', props.outputFile);
    }

    if (props.githubSummary !== false) {
      args.push('--github-summary');
    }

    return args.join(' ');
  }

  constructor(project: Project, props: ResourceCountStepProps = {}) {
    const steps: PipelineStep[] = [];

    // Add command step to run resource counting
    const command = ResourceCountStep.generateCommand(props);
    steps.push(new SimpleCommandStep(project, [command], {
      CLOUD_ASSEMBLY_DIR: props.cloudAssemblyDir ?? 'cdk.out',
    }));

    super(project, steps);
  }
}
