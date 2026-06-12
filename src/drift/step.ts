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

/**
 * Props for the DriftRemediationStep.
 */
export interface DriftRemediationStepProps {
  /**
   * Name of the stage
   */
  readonly stageName: string;

  /**
   * AWS region
   */
  readonly region: string;

  /**
   * Role ARN for the revert operation (typically deployRoleArn)
   */
  readonly roleArn?: string;

  /**
   * Jump role for role chaining
   */
  readonly jumpRoleArn?: string;

  /**
   * Stack names to revert (if not specified, reverts all drifted stacks from detection)
   */
  readonly stackNames?: string[];

  /**
   * Resolved remediation options
   */
  readonly remediation: DriftRemediationOptions;

  /**
   * Environment variables
   */
  readonly environment?: Record<string, string>;
}

/**
 * Step that executes drift remediation (REVERT_DRIFT change set) for a stage.
 */
export class DriftRemediationStep extends StepSequence {
  private static generateCommand(props: DriftRemediationStepProps): string {
    const args: string[] = [
      'revert-drift',
      '--region', props.region,
      '--detection-results', `drift-results-${props.stageName}.json`,
    ];

    if (props.stackNames && props.stackNames.length > 0) {
      args.push('--stacks', props.stackNames.join(','));
    }

    if (props.remediation.includeResourceTypes && props.remediation.includeResourceTypes.length > 0) {
      args.push('--include-resource-types', props.remediation.includeResourceTypes.join(','));
    }

    if (props.remediation.excludeResourceTypes && props.remediation.excludeResourceTypes.length > 0) {
      args.push('--exclude-resource-types', props.remediation.excludeResourceTypes.join(','));
    }

    // Auto mode always passes --yes
    if (props.remediation.policy === 'auto') {
      args.push('--yes');
    }

    return args.join(' ');
  }

  constructor(project: Project, props: DriftRemediationStepProps) {
    const steps: PipelineStep[] = [];

    // Use deployRoleArn for the revert (more privileged than detection role)
    const roleArn = props.remediation.deployRoleArn ?? props.roleArn;
    if (roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn,
        region: props.region,
        jumpRoleArn: props.jumpRoleArn,
      }));
    }

    // Add command step to run revert
    const command = DriftRemediationStep.generateCommand(props);
    steps.push(new SimpleCommandStep(project, [command], {
      AWS_DEFAULT_REGION: props.region,
      AWS_REGION: props.region,
      DRIFT_REMEDIATION_OUTPUT: `drift-remediation-${props.stageName}.json`,
      DRIFT_DETECTION_INPUT: `drift-results-${props.stageName}.json`,
      STAGE_NAME: props.stageName,
      ...props.environment,
    }));

    super(project, steps);
  }
}

/**
 * Props for the DriftVerificationStep — re-runs detection after remediation.
 */
export interface DriftVerificationStepProps {
  /**
   * Name of the stage
   */
  readonly stageName: string;

  /**
   * AWS region
   */
  readonly region: string;

  /**
   * Role ARN for re-detection (detection role, read-only)
   */
  readonly roleArn?: string;

  /**
   * Jump role for role chaining
   */
  readonly jumpRoleArn?: string;

  /**
   * Stack names to verify
   */
  readonly stackNames?: string[];

  /**
   * Environment variables
   */
  readonly environment?: Record<string, string>;
}

/**
 * Step that re-runs drift detection after remediation to verify IN_SYNC status.
 * Always fails on drift (the whole point is to confirm revert succeeded).
 */
export class DriftVerificationStep extends StepSequence {
  private static generateCommand(props: DriftVerificationStepProps): string {
    const args: string[] = [
      'detect-drift',
      '--region', props.region,
    ];

    if (props.stackNames && props.stackNames.length > 0) {
      args.push('--stacks', props.stackNames.join(','));
    }

    // Verification always fails on drift
    return args.join(' ');
  }

  constructor(project: Project, props: DriftVerificationStepProps) {
    const steps: PipelineStep[] = [];

    if (props.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: props.roleArn,
        region: props.region,
        jumpRoleArn: props.jumpRoleArn,
      }));
    }

    const command = DriftVerificationStep.generateCommand(props);
    steps.push(new SimpleCommandStep(project, [command], {
      AWS_DEFAULT_REGION: props.region,
      AWS_REGION: props.region,
      DRIFT_DETECTION_OUTPUT: `drift-verify-${props.stageName}.json`,
      STAGE_NAME: props.stageName,
      ...props.environment,
    }));

    super(project, steps);
  }
}