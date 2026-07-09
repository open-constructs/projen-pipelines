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
   * Steps to execute before installing dependencies.
   * Use this to add additional package manager setup steps or pre-install commands.
   *
   * Note: If the project is a NodeProject using pnpm or Yarn Berry,
   * the appropriate setup steps (PnpmSetupStep or CorepackSetupStep)
   * are automatically added. Use this option only for additional steps
   * beyond the auto-detected ones.
   *
   * @default - automatically detected from project package manager
   */
  readonly preInstallSteps?: PipelineStep[];
}

export abstract class DriftDetectionWorkflow extends Component {
  public readonly name: string;
  public readonly schedule: string;
  protected readonly stages: DriftDetectionStageOptions[];
  protected readonly preInstallSteps: PipelineStep[];

  /** Prefix for workflow files and artifact names to prevent collisions in monorepos. */
  protected readonly namePrefix: string;

  constructor(project: Project, options: DriftDetectionWorkflowOptions) {
    super(project);

    this.namePrefix = options.pipelineName ? `${options.pipelineName}-` : '';
    this.name = options.name ?? 'drift-detection';
    this.schedule = options.schedule ?? '0 0 * * *';
    this.stages = options.stages;
    this.preInstallSteps = options.preInstallSteps ?? this.detectPackageManagerSteps(project);
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
