import { Component, Project } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';
import { PipelineStep, PnpmSetupStep, CorepackSetupStep } from '../steps';

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
   * Remediation policy for this stage, overriding the workflow default.
   *
   * - `off`: only detect drift, never revert (default)
   * - `manual`: revert is gated behind a manual approval
   * - `auto`: revert runs automatically when drift is detected
   *
   * @default - the workflow's `defaultRemediation`
   */
  readonly remediation?: RemediationPolicy;
}

/**
 * Policy controlling whether (and how) drifted stacks are reverted to their
 * deployed template.
 */
export type RemediationPolicy = 'off' | 'manual' | 'auto';

/**
 * Options controlling drift remediation (reverting drifted CloudFormation
 * stacks back to their deployed-template state via a `REVERT_DRIFT`
 * change-set).
 */
export interface DriftRemediationOptions {
  /**
   * Resource types (glob patterns) that are always allowed to be reverted.
   * When set, only matching resource types are considered for remediation.
   *
   * @default - all resource types except those in `excludeResourceTypes`
   */
  readonly includeResourceTypes?: string[];

  /**
   * Resource types (glob patterns) that must never be reverted automatically.
   * If a stage with an `auto` policy has drift in any excluded resource type,
   * that stage's remediation is downgraded to `manual` (gated).
   *
   * @default ['AWS::RDS::*', 'AWS::DynamoDB::Table']
   */
  readonly excludeResourceTypes?: string[];
}

/**
 * The default `excludeResourceTypes` used when remediation is enabled but no
 * explicit exclusions are provided. Sensitive, stateful resources are denied
 * by default.
 */
export const DEFAULT_EXCLUDE_RESOURCE_TYPES: string[] = ['AWS::RDS::*', 'AWS::DynamoDB::Table'];

/**
 * Resolve the effective remediation policy for a stage, given the workflow
 * default and the stage-level override.
 */
export function resolveRemediation(
  stage: DriftDetectionStageOptions,
  defaultRemediation: RemediationPolicy,
): RemediationPolicy {
  return stage.remediation ?? defaultRemediation;
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
   * Additional steps to execute before installing dependencies.
   * These steps are executed before the package manager setup and install command.
   *
   * Note: Package manager setup (e.g., PnpmSetupStep for pnpm or CorepackSetupStep
   * for Yarn Berry) is automatically detected from the project and always included.
   * Use this option for any additional pre-install steps you need.
   *
   * @default - no additional pre-install steps
   */
  readonly preInstallSteps?: PipelineStep[];

  /**
   * Default remediation policy applied to every stage that does not override
   * it. Remediation reverts drifted stacks to their deployed template using a
   * CloudFormation `REVERT_DRIFT` change-set.
   *
   * @default 'off'
   */
  readonly defaultRemediation?: RemediationPolicy;

  /**
   * Options controlling which resource types may be reverted. Only relevant
   * when remediation is enabled for at least one stage.
   */
  readonly remediationOptions?: DriftRemediationOptions;
}

export abstract class DriftDetectionWorkflow extends Component {
  public readonly name: string;
  public readonly schedule: string;
  protected readonly stages: DriftDetectionStageOptions[];
  protected readonly preInstallSteps: PipelineStep[];

  /** Prefix for workflow files and artifact names to prevent collisions in monorepos. */
  protected readonly namePrefix: string;

  /** Default remediation policy for stages that do not override it. */
  protected readonly defaultRemediation: RemediationPolicy;

  /** Options controlling which resource types may be reverted. */
  protected readonly remediationOptions: DriftRemediationOptions;

  constructor(project: Project, options: DriftDetectionWorkflowOptions) {
    super(project);

    this.namePrefix = options.pipelineName ? `${options.pipelineName}-` : '';
    this.name = options.name ?? 'drift-detection';
    this.schedule = options.schedule ?? '0 0 * * *';
    this.stages = options.stages;
    this.defaultRemediation = options.defaultRemediation ?? 'off';
    this.remediationOptions = options.remediationOptions ?? {};
    this.preInstallSteps = [
      ...(options.preInstallSteps ?? []),
      ...this.detectPackageManagerSteps(project),
    ];
  }

  /**
   * Resolve the effective remediation policy for a stage.
   */
  protected remediationFor(stage: DriftDetectionStageOptions): RemediationPolicy {
    return resolveRemediation(stage, this.defaultRemediation);
  }

  /** Whether any stage has remediation enabled. */
  protected get hasRemediation(): boolean {
    return this.stages.some(s => this.remediationFor(s) !== 'off');
  }

  /**
   * Detects the package manager from the project and returns appropriate setup steps.
   * If the project is a NodeProject (has a `package` property), it inspects the
   * packageManager to determine if pnpm or Yarn Berry setup is needed.
   */
  private detectPackageManagerSteps(project: Project): PipelineStep[] {
    const pkg = (project as any).package;
    if (!pkg || !pkg.packageManager) {
      return [];
    }

    const steps: PipelineStep[] = [];

    if (pkg.packageManager === NodePackageManager.PNPM) {
      steps.push(new PnpmSetupStep(project, {
        version: pkg.pnpmVersion,
      }));
    } else if (pkg.packageManager === NodePackageManager.YARN_BERRY) {
      steps.push(new CorepackSetupStep(project));
    }

    return steps;
  }

}
