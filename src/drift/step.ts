import { Project } from 'projen';
import { StepSequence, PipelineStep, AwsAssumeRoleStep, SimpleCommandStep } from '../steps';
import { DriftDetectionStageOptions, DriftRemediationOptions } from './base';

export interface DriftDetectionStepProps extends DriftDetectionStageOptions {
  /**
   * Timeout in minutes for drift detection
   * @default 30
   */
  readonly timeout?: number;
}

export class DriftDetectionStep extends StepSequence {
  public static generateCommand(props: DriftDetectionStepProps): string {
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

export interface DriftRemediationStepProps extends DriftDetectionStageOptions, DriftRemediationOptions {}

/**
 * Reverts drifted stacks for a stage using the `revert-drift` CLI. Consumes the
 * drift-results file produced by {@link DriftDetectionStep}.
 */
export class DriftRemediationStep extends StepSequence {
  private static generateCommand(props: DriftRemediationStepProps): string {
    const args: string[] = [
      'revert-drift',
      '--region', props.region,
      '--results', `drift-results-${props.name}.json`,
      '--yes',
    ];

    if (props.stackNames && props.stackNames.length > 0) {
      args.push('--stacks', props.stackNames.join(','));
    }
    if (props.includeResourceTypes && props.includeResourceTypes.length > 0) {
      args.push('--include-resource-types', props.includeResourceTypes.join(','));
    }
    if (props.excludeResourceTypes && props.excludeResourceTypes.length > 0) {
      args.push('--exclude-resource-types', props.excludeResourceTypes.join(','));
    }

    return args.join(' ');
  }

  constructor(project: Project, props: DriftRemediationStepProps) {
    const steps: PipelineStep[] = [];

    if (props.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: props.roleArn,
        region: props.region,
        jumpRoleArn: props.jumpRoleArn,
      }));
    }

    const command = DriftRemediationStep.generateCommand(props);
    steps.push(new SimpleCommandStep(project, [command], {
      AWS_DEFAULT_REGION: props.region,
      AWS_REGION: props.region,
      STAGE_NAME: props.name,
      ...props.environment,
    }));

    super(project, steps);
  }
}

/**
 * Re-runs drift detection after remediation to confirm the stacks are back in
 * sync.
 */
export class DriftVerificationStep extends StepSequence {
  constructor(project: Project, props: DriftDetectionStepProps) {
    const steps: PipelineStep[] = [];

    if (props.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: props.roleArn,
        region: props.region,
        jumpRoleArn: props.jumpRoleArn,
      }));
    }

    const command = DriftDetectionStep.generateCommand({ ...props });
    steps.push(new SimpleCommandStep(project, [command], {
      AWS_DEFAULT_REGION: props.region,
      DRIFT_DETECTION_OUTPUT: `drift-verify-${props.name}.json`,
      AWS_REGION: props.region,
      STAGE_NAME: props.name,
      ...props.environment,
    }));

    super(project, steps);
  }
}