// import { GitHub } from 'projen/lib/github';
// import { GithubCredentials } from "./github-credentials";
import * as workflows from 'projen/lib/github/workflows-model';
import { CodeCatalyst } from './codecatalyst';
//import { YamlFile } from 'projen/lib/github/yaml';

/**
 * Options for `CodeCatalystWorkflow`.
 */
export interface CodeCatalystWorkflowOptions {
  /**
     * Force the creation of the workflow even if `workflows` is disabled in `GitHub`.
     *
     * @default false
     */
  readonly force?: boolean;
  /**
     * Concurrency ensures that only a single job or workflow using the same concurrency group will run at a time. Currently in beta.
     *
     * @default - disabled
     * @see https://docs.aws.amazon.com/codecatalyst/latest/userguide/workflows-configure-runs.html
     */
  readonly concurrency?: string;
}
/**
 * Workflow for CodeCatalyst.
 *
 * A workflow is a configurable automated process made up of one or more jobs.
 *
 * @see https://docs.aws.amazon.com/codecatalyst/latest/userguide/workflow-reference.html
 */
export declare class CodeCatalystWorkflow {
  /**
     * The name of the workflow.
     */
  readonly name: string;
  /**
     * Concurrency ensures that only a single job or workflow using the same concurrency group will run at a time.
     *
     * @default disabled
     * @experimental
     */
  readonly concurrency?: string;
  /**
     * The workflow YAML file. May not exist if `workflowsEnabled` is false on `GitHub`.
     */
  // readonly file: YamlFile | undefined;
  /**
     * GitHub API authentication method used by projen workflows.
     */
  // readonly projenCredentials: GithubCredentials;
  /**
     * The name for workflow runs generated from the workflow. GitHub displays the
     * workflow run name in the list of workflow runs on your repository's
     * "Actions" tab. If `run-name` is omitted or is only whitespace, then the run
     * name is set to event-specific information for the workflow run. For
     * example, for a workflow triggered by a `push` or `pull_request` event, it
     * is set as the commit message.
     *
     * This value can include expressions and can reference `github` and `inputs`
     * contexts.
     */
  runName?: string;
  private actions;
  private events;
  private jobs;
  constructor(codecatalyst: CodeCatalyst, name: string, options?: CodeCatalystWorkflowOptions);
  /**
     * Add events to triggers the workflow.
     *
     * @param events The event(s) to trigger the workflow.
     */
  on(events: workflows.Triggers): void;
  /**
     * Adds a single job to the workflow.
     * @param id The job name (unique within the workflow)
     * @param job The job specification
     */
  addJob(id: string, job: workflows.Job | workflows.JobCallingReusableWorkflow): void;
  /**
     * Add jobs to the workflow.
     *
     * @param jobs Jobs to add.
     */
  addJobs(jobs: Record<string, workflows.Job | workflows.JobCallingReusableWorkflow>): void;
  /**
     * Get a single job from the workflow.
     * @param id The job name (unique within the workflow)
     */
  getJob(id: string): workflows.Job | workflows.JobCallingReusableWorkflow;
  /**
     * Updates a single job to the workflow.
     * @param id The job name (unique within the workflow)
     */
  updateJob(id: string, job: workflows.Job | workflows.JobCallingReusableWorkflow): void;
  /**
     * Updates jobs for this worklow
     * Does a complete replace, it does not try to merge the jobs
     *
     * @param jobs Jobs to update.
     */
  updateJobs(jobs: Record<string, workflows.Job | workflows.JobCallingReusableWorkflow>): void;
  /**
     * Removes a single job to the workflow.
     * @param id The job name (unique within the workflow)
     */
  removeJob(id: string): void;
  private renderWorkflow;
}
