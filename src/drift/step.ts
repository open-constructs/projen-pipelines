import { Project } from 'projen';
import { StepSequence, PipelineStep, AwsAssumeRoleStep, SimpleCommandStep } from '../steps';
import { DriftDetectionStageOptions } from './base';

export interface DriftDetectionStepProps extends DriftDetectionStageOptions {
  /**
   * Timeout in minutes for drift detection
   * @default 30
   */
  readonly timeout?: number;
}

export class DriftDetectionStep extends StepSequence {
  private static generateCommand(props: DriftDetectionStepProps): string {
    const args: string[] = [
      'detect-drift',
      '--region', props.region,
    ];

    if (props.stackNames && props.stackNames.length > 0) {
      args.push('--stacks', props.stackNames.join(','));
    }

    if (props.timeout) {
      args.push('--timeout', props.timeout.toString());
    }

    if (props.failOnDrift === false) {
      args.push('--no-fail-on-drift');
    }

    return args.join(' ');
  }

  constructor(project: Project, props: DriftDetectionStepProps) {
    const steps: PipelineStep[] = [];

    // Add AWS assume role step if roleArn is provided
    if (props.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: props.roleArn,
        region: props.region,
        jumpRoleArn: props.jumpRoleArn,
      }));
    }

    // Add command step to run drift detection
    const command = DriftDetectionStep.generateCommand(props);
    steps.push(new SimpleCommandStep(project, [command], {
      AWS_DEFAULT_REGION: props.region,
      DRIFT_DETECTION_OUTPUT: `drift-results-${props.name}.json`,
      AWS_REGION: props.region,
      STAGE_NAME: props.name,
      ...props.environment,
    }));

    super(project, steps);
  }
}