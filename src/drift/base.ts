import { Component, Project } from 'projen';

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
}

export abstract class DriftDetectionWorkflow extends Component {
  public readonly name: string;
  public readonly schedule: string;
  protected readonly stages: DriftDetectionStageOptions[];

  constructor(project: Project, options: DriftDetectionWorkflowOptions) {
    super(project);

    this.name = options.name ?? 'drift-detection';
    this.schedule = options.schedule ?? '0 0 * * *';
    this.stages = options.stages;
  }

}