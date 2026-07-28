import { Component, Project } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';
import { PipelineStep, PnpmSetupStep, CorepackSetupStep } from '../steps';

/**
 * Action to perform during garbage collection.
 */
export enum GcAction {
  /** Print assets that would be garbage collected without taking action */
  PRINT = 'print',
  /** Tag assets for deletion without actually deleting them */
  TAG = 'tag',
  /** Delete previously tagged assets */
  DELETE_TAGGED = 'delete-tagged',
  /** Perform full garbage collection (tag and delete in one pass) */
  FULL = 'full',
}

/**
 * Type of assets to garbage collect.
 */
export enum GcAssetType {
  /** Only garbage collect S3 assets */
  S3 = 's3',
  /** Only garbage collect ECR images */
  ECR = 'ecr',
  /** Garbage collect both S3 and ECR assets */
  ALL = 'all',
}

/**
 * Options for the CDK garbage collection command.
 */
export interface GcOptions {
  /**
   * Action to perform during garbage collection.
   * @default GcAction.FULL
   */
  readonly action?: GcAction;

  /**
   * Type of assets to garbage collect.
   * @default GcAssetType.ALL
   */
  readonly type?: GcAssetType;

  /**
   * Number of days to keep assets that are referenced by rolled-back stacks.
   * @default 30
   */
  readonly rollbackBufferDays?: number;

  /**
   * Number of days to keep assets based on their creation date.
   * @default 1
   */
  readonly createdBufferDays?: number;

  /**
   * Name of the CDK bootstrap stack.
   * @default - uses CDK default (CDKToolkit)
   */
  readonly bootstrapStackName?: string;
}

/**
 * AWS environment configuration with account and region.
 */
export interface AwsEnvironment {
  /** AWS account ID */
  readonly account: string;
  /** AWS region */
  readonly region: string;
}

/**
 * Configuration for a garbage collection stage.
 */
export interface GcStageOptions {
  /**
   * Name of the stage.
   */
  readonly name: string;

  /**
   * AWS environment for this stage (account and region).
   */
  readonly env: AwsEnvironment;

  /**
   * Role ARN to assume for garbage collection.
   */
  readonly roleArn?: string;

  /**
   * Jump role to assume before the main role.
   */
  readonly jumpRoleArn?: string;

  /**
   * Per-stage garbage collection options (shallow-merged over workflow-level gcOptions).
   */
  readonly gcOptions?: GcOptions;

  /**
   * Environment variables for this stage.
   */
  readonly environment?: Record<string, string>;

  /**
   * Timeout in minutes for the garbage collection job.
   */
  readonly timeoutMinutes?: number;
}

/**
 * Options for the garbage collection workflow.
 */
export interface GarbageCollectionWorkflowOptions {
  /**
   * A unique name for this pipeline, used as a prefix for workflow files
   * and artifact names to prevent collisions in monorepos.
   *
   * @default - no prefix
   */
  readonly pipelineName?: string;

  /**
   * Cron schedule for garbage collection.
   * @default "0 3 * * 0" (weekly, Sunday 03:00 UTC)
   */
  readonly schedule?: string;

  /**
   * Default garbage collection options applied to all stages.
   * Per-stage gcOptions are shallow-merged over these defaults.
   */
  readonly gcOptions?: GcOptions;

  /**
   * Stages to run garbage collection against.
   */
  readonly stages: GcStageOptions[];

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
}

/**
 * Abstract base class for CDK garbage collection workflows.
 *
 * Generates scheduled jobs that run `cdk gc` against each configured stage
 * to clean up unused S3 and ECR assets from the CDK bootstrap resources.
 */
export abstract class GarbageCollectionWorkflow extends Component {
  /** Cron schedule for the workflow. */
  public readonly schedule: string;

  /** Configured stages for garbage collection. */
  protected readonly stages: GcStageOptions[];

  /** Workflow-level garbage collection options. */
  protected readonly gcOptions: GcOptions;

  /** Steps to run before installing dependencies. */
  protected readonly preInstallSteps: PipelineStep[];

  /** Prefix for workflow files and artifact names to prevent collisions in monorepos. */
  protected readonly namePrefix: string;

  constructor(project: Project, options: GarbageCollectionWorkflowOptions) {
    super(project);

    this.namePrefix = options.pipelineName ? `${options.pipelineName}-` : '';
    this.schedule = options.schedule ?? '0 3 * * 0';
    this.stages = options.stages;
    this.gcOptions = options.gcOptions ?? {};
    this.preInstallSteps = [
      ...(options.preInstallSteps ?? []),
      ...this.detectPackageManagerSteps(project),
    ];
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
