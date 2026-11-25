import { Project, Task } from 'projen';
import { StepSequence, PipelineStep, AwsAssumeRoleStep, ProjenScriptStep } from '../steps';
import { GcOptions, GcStageOptions } from './base';

/**
 * Properties for creating a GarbageCollectionStep.
 */
export interface GarbageCollectionStepProps {
  /**
   * Stage configuration for garbage collection.
   */
  readonly stage: GcStageOptions;

  /**
   * Workflow-level garbage collection options.
   * Per-stage options are shallow-merged over these.
   */
  readonly workflowGcOptions?: GcOptions;
}

/**
 * A step sequence that assumes a role and runs the CDK garbage collection command.
 *
 * Registers a projen task `gc:<stage.name>` on the project so the same command
 * can be run locally with `npx projen gc:<stage>`.
 */
export class GarbageCollectionStep extends StepSequence {
  /**
   * Builds the `cdk gc` command string from merged options.
   */
  private static buildCommand(stage: GcStageOptions, workflowGcOptions?: GcOptions): string {
    // Shallow merge: stage gcOptions override workflow-level gcOptions
    const merged: GcOptions = {
      ...workflowGcOptions,
      ...stage.gcOptions,
    };

    const env = `aws://${stage.env.account}/${stage.env.region}`;

    const args: string[] = [
      'npx cdk gc',
      env,
      '--unstable=gc',
      '--confirm=false',
    ];

    if (merged.type) {
      args.push(`--type=${merged.type}`);
    }

    if (merged.action) {
      args.push(`--action=${merged.action}`);
    }

    if (merged.rollbackBufferDays !== undefined) {
      args.push(`--rollback-buffer-days=${merged.rollbackBufferDays}`);
    }

    if (merged.createdBufferDays !== undefined) {
      args.push(`--created-buffer-days=${merged.createdBufferDays}`);
    }

    if (merged.bootstrapStackName) {
      args.push(`--bootstrap-stack-name=${merged.bootstrapStackName}`);
    }

    return args.join(' ');
  }

  /** The projen task registered for this stage. */
  public readonly task: Task;

  constructor(project: Project, props: GarbageCollectionStepProps) {
    const { stage, workflowGcOptions } = props;
    const steps: PipelineStep[] = [];

    // Add AWS assume role step if roleArn is provided
    if (stage.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: stage.roleArn,
        region: stage.env.region,
        jumpRoleArn: stage.jumpRoleArn,
      }));
    }

    // Build the cdk gc command
    const command = GarbageCollectionStep.buildCommand(stage, workflowGcOptions);

    // Register the projen task (or reuse if already registered)
    const taskName = `gc:${stage.name}`;
    const task = project.tasks.tryFind(taskName) ?? project.addTask(taskName, {
      description: `Run CDK garbage collection for stage ${stage.name}`,
      exec: command,
    });

    // Add the projen script step to run the task in CI
    steps.push(new ProjenScriptStep(project, taskName, undefined));

    super(project, steps);
    this.task = task;
  }
}
