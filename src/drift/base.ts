import { Component, Project } from 'projen';

/**
 * Remediation policy for a drift detection stage.
 * - 'off':    detect only (current behaviour). DEFAULT.
 * - 'manual': detection runs unattended; the revert job is created but gated
 *             behind an approval (GH environment protection / GL when:manual /
 *             Bash confirmation prompt).
 * - 'auto':   revert runs automatically when drift is detected.
 */
export type RemediationPolicy = 'off' | 'manual' | 'auto';

/**
 * Configuration for drift reconciliation (revert) on a per-stage basis.
 */
export interface DriftRemediationOptions {
  /**
   * Remediation behaviour for this stage.
   * - 'off':    detect only (current behaviour). DEFAULT.
   * - 'manual': detection runs unattended; the revert job is created but gated
   *             behind an approval (GH environment protection / GL when:manual /
   *             Bash confirmation prompt).
   * - 'auto':   revert runs automatically when drift is detected.
   * @default 'off'
   */
  readonly policy?: RemediationPolicy;

  /**
   * Resource types eligible for revert (glob on CFN type, e.g. 'AWS::S3::*').
   * If set, only matching drifted resources trigger/permit a revert.
   * @default - all supported types
   */
  readonly includeResourceTypes?: string[];

  /**
   * Resource types that must NEVER be auto-reverted (takes precedence over
   * includeResourceTypes). Drift in these still reports; with policy 'auto'
   * the stage is downgraded to 'manual' for that run.
   * @default ['AWS::RDS::*', 'AWS::DynamoDB::Table']
   */
  readonly excludeResourceTypes?: string[];

  /**
   * IAM role to assume for the revert (CFN change-set execute permissions).
   * Falls back to the stage's detection roleArn if omitted — but a separate,
   * more-privileged role is recommended (detection is read-only).
   * @default - stage.roleArn
   */
  readonly deployRoleArn?: string;

  /**
   * For mode 'manual' on GitHub: the protected environment name whose reviewers
   * gate the revert job. Ignored for other engines.
   */
  readonly approvalEnvironment?: string;
}

export interface DriftDetectionStageOptions {
  /**
   * Name of the stage
   */
  readonly name: string;

  /**
   * AWS region for this stage
   */
  readonly region: string;

  /**
   * Role to assume for drift detection
   */
  readonly roleArn?: string;

  /**
   * Jump role to assume before the main role
   */
  readonly jumpRoleArn?: string;

  /**
   * Stack names to check in this stage
   */
  readonly stackNames?: string[];

  /**
   * Whether to fail if drift is detected
   * @default true
   */
  readonly failOnDrift?: boolean;

  /**
   * Environment variables for this stage
   */
  readonly environment?: Record<string, string>;

  /**
   * Drift reconciliation (revert) configuration for this stage.
   * @default { policy: 'off' }
   */
  readonly remediation?: DriftRemediationOptions;
}

export interface DriftErrorHandler {
  /**
   * Pattern to match stack names
   */
  readonly pattern: string;

  /**
   * Action to take when pattern matches
   */
  readonly action: 'ignore' | 'warn' | 'fail';

  /**
   * Optional message to display
   */
  readonly message?: string;
}

export interface DriftDetectionWorkflowOptions {
  /**
   * A unique name for this pipeline, used as a prefix for workflow files
   * and artifact names to prevent collisions in monorepos.
   *
   * @default - no prefix
   */
  readonly pipelineName?: string;

  /**
   * Name of the workflow
   * @default "drift-detection"
   */
  readonly name?: string;

  /**
   * Cron schedule for drift detection
   * @default "0 0 * * *" (daily at midnight)
   */
  readonly schedule?: string;

  /**
   * Drift detection configurations for different environments
   */
  readonly stages: DriftDetectionStageOptions[];

  /**
   * Default remediation options merged into every stage that does not specify
   * its own. Stage-level values win.
   * @default { policy: 'off' }
   */
  readonly defaultRemediation?: DriftRemediationOptions;
}

export abstract class DriftDetectionWorkflow extends Component {
  public readonly name: string;
  public readonly schedule: string;
  protected readonly stages: DriftDetectionStageOptions[];
  protected readonly defaultRemediation: DriftRemediationOptions;

  /** Prefix for workflow files and artifact names to prevent collisions in monorepos. */
  protected readonly namePrefix: string;

  constructor(project: Project, options: DriftDetectionWorkflowOptions) {
    super(project);

    this.namePrefix = options.pipelineName ? `${options.pipelineName}-` : '';
    this.name = options.name ?? 'drift-detection';
    this.schedule = options.schedule ?? '0 0 * * *';
    this.stages = options.stages;
    this.defaultRemediation = options.defaultRemediation ?? { policy: 'off' };
  }

  /**
   * Resolves the effective remediation options for a stage, merging defaults
   * with stage-level overrides (stage wins).
   */
  protected resolveRemediation(stage: DriftDetectionStageOptions): DriftRemediationOptions {
    const stageOpts = stage.remediation ?? {};
    return {
      policy: stageOpts.policy ?? this.defaultRemediation.policy ?? 'off',
      includeResourceTypes: stageOpts.includeResourceTypes ?? this.defaultRemediation.includeResourceTypes,
      excludeResourceTypes: stageOpts.excludeResourceTypes ?? this.defaultRemediation.excludeResourceTypes ?? ['AWS::RDS::*', 'AWS::DynamoDB::Table'],
      deployRoleArn: stageOpts.deployRoleArn ?? this.defaultRemediation.deployRoleArn ?? stage.roleArn,
      approvalEnvironment: stageOpts.approvalEnvironment ?? this.defaultRemediation.approvalEnvironment,
    };
  }

}