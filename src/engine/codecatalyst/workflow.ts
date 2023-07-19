import { snake } from 'case';
import { resolve } from 'projen/lib/_resolve';
import { Component } from 'projen/lib/component';
import { GitHubActionsProvider } from 'projen/lib/github/actions-provider';
import { GithubCredentials } from 'projen/lib/github/github-credentials';
import * as workflows from 'projen/lib/github/workflows-model';
import { kebabCaseKeys } from 'projen/lib/util';
import { YamlFile } from 'projen/lib/yaml';
import { CodeCatalyst } from './codecatalyst';

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
export class CodeCatalystWorkflow extends Component {
  /**
    * The name of the workflow.
    */
  public readonly name: string;

  /**
    * Concurrency ensures that only a single job or workflow using the same concurrency group will run at a time.
    *
    * @default disabled
    * @experimental
    */
  public readonly concurrency?: string;

  /**
    * The workflow YAML file. May not exist if `workflowsEnabled` is false on `GitHub`.
    */
  public readonly file: YamlFile | undefined;

  /**
    * GitHub API authentication method used by projen workflows.
    */
  public readonly projenCredentials: GithubCredentials;

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
  public runName?: string;

  private actions: GitHubActionsProvider;
  private events: workflows.Triggers = {};
  private jobs: Record<
  string,
  workflows.Job | workflows.JobCallingReusableWorkflow
  > = {};

  constructor(
    codecatalyst: CodeCatalyst,
    name: string,
    options: CodeCatalystWorkflowOptions = {},
  ) {
    super(codecatalyst.project);

    this.name = name;
    this.concurrency = options.concurrency;
    this.projenCredentials = codecatalyst.projenCredentials;
    this.actions = codecatalyst.actions;

    const workflowsEnabled = codecatalyst.workflowsEnabled || options.force;
    if (workflowsEnabled) {
      this.file = new YamlFile(
        this.project,
        `.codecatalyts/workflows/${name.toLocaleLowerCase()}.yml`,
        {
          obj: () => this.renderWorkflow(),
          // GitHub needs to read the file from the repository in order to work.
          committed: true,
        },
      );
    }
  }

  /**
    * Add events to triggers the workflow.
    *
    * @param events The event(s) to trigger the workflow.
    */
  public on(events: workflows.Triggers) {
    this.events = {
      ...this.events,
      ...events,
    };
  }

  /**
    * Adds a single job to the workflow.
    * @param id The job name (unique within the workflow)
    * @param job The job specification
    */
  public addJob(
    id: string,
    job: workflows.Job | workflows.JobCallingReusableWorkflow,
  ): void {
    this.addJobs({ [id]: job });
  }

  /**
    * Add jobs to the workflow.
    *
    * @param jobs Jobs to add.
    */
  public addJobs(
    jobs: Record<string, workflows.Job | workflows.JobCallingReusableWorkflow>,
  ) {
    verifyJobConstraints(jobs);

    this.jobs = {
      ...this.jobs,
      ...jobs,
    };
  }

  /**
    * Get a single job from the workflow.
    * @param id The job name (unique within the workflow)
    */
  public getJob(
    id: string,
  ): workflows.Job | workflows.JobCallingReusableWorkflow {
    return this.jobs[id];
  }

  /**
    * Updates a single job to the workflow.
    * @param id The job name (unique within the workflow)
    */
  public updateJob(
    id: string,
    job: workflows.Job | workflows.JobCallingReusableWorkflow,
  ) {
    this.updateJobs({ [id]: job });
  }

  /**
    * Updates jobs for this worklow
    * Does a complete replace, it does not try to merge the jobs
    *
    * @param jobs Jobs to update.
    */
  public updateJobs(
    jobs: Record<string, workflows.Job | workflows.JobCallingReusableWorkflow>,
  ) {
    verifyJobConstraints(jobs);

    const newJobIds = Object.keys(jobs);
    const updatedJobs = Object.entries(this.jobs).map(([jobId, job]) => {
      if (newJobIds.includes(jobId)) {
        return [jobId, jobs[jobId]];
      }
      return [jobId, job];
    });
    this.jobs = {
      ...Object.fromEntries(updatedJobs),
    };
  }

  /**
    * Removes a single job to the workflow.
    * @param id The job name (unique within the workflow)
    */
  public removeJob(id: string) {
    const updatedJobs = Object.entries(this.jobs).filter(
      ([jobId]) => jobId !== id,
    );
    this.jobs = {
      ...Object.fromEntries(updatedJobs),
    };
  }

  private renderWorkflow() {
    return {
      'name': this.name,
      'run-name': this.runName,
      'on': snakeCaseKeys(this.events),
      'concurrency': this.concurrency,
      'jobs': renderJobs(this.jobs, this.actions),
    };
  }
}

function snakeCaseKeys<T = unknown>(obj: T): T {
  if (typeof obj !== 'object' || obj == null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys) as any;
  }

  const result: Record<string, unknown> = {};
  for (let [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v != null) {
      v = snakeCaseKeys(v);
    }
    result[snake(k)] = v;
  }
  return result as any;
}

function renderJobs(
  jobs: Record<string, workflows.Job | workflows.JobCallingReusableWorkflow>,
  actions: GitHubActionsProvider,
) {
  const result: Record<string, unknown> = {};
  for (const [name, job] of Object.entries(jobs)) {
    result[name] = renderJob(job);
  }
  return result;

  /** @see https://docs.aws.amazon.com/codecatalyst/latest/userguide/workflow-reference.html */
  function renderJob(
    job: workflows.Job | workflows.JobCallingReusableWorkflow,
  ) {
    const steps = new Array<workflows.JobStep>();

    // https://docs.github.com/en/actions/using-workflows/reusing-workflows#supported-keywords-for-jobs-that-call-a-reusable-workflow
    // https://docs.aws.amazon.com/codecatalyst/latest/userguide/workflow-reference.html
    if ('uses' in job) {
      return {
        name: job.name,
        needs: arrayOrScalar(job.needs),
        if: job.if,
        permissions: kebabCaseKeys(job.permissions),
        concurrency: job.concurrency,
        uses: job.uses,
        with: job.with,
        secrets: job.secrets,
        strategy: renderJobStrategy(job.strategy),
      };
    }

    if (job.tools) {
      steps.push(...setupTools(job.tools));
    }

    const userDefinedSteps = kebabCaseKeys(resolve(job.steps), false);
    steps.push(...userDefinedSteps);

    return {
      'name': job.name,
      'needs': arrayOrScalar(job.needs),
      'runs-on': arrayOrScalar(job.runsOn),
      'permissions': kebabCaseKeys(job.permissions),
      'environment': job.environment,
      'concurrency': job.concurrency,
      'outputs': renderJobOutputs(job.outputs),
      'env': job.env,
      'defaults': kebabCaseKeys(job.defaults),
      'if': job.if,
      'steps': steps.map(renderStep),
      'timeout-minutes': job.timeoutMinutes,
      'strategy': renderJobStrategy(job.strategy),
      'continue-on-error': job.continueOnError,
      'container': job.container,
      'services': job.services,
    };
  }

  function renderJobOutputs(output: workflows.Job['outputs']) {
    if (output == null) {
      return undefined;
    }

    const rendered: Record<string, string> = {};
    for (const [name, { stepId, outputName }] of Object.entries(output)) {
      rendered[name] = `\${{ steps.${stepId}.outputs.${outputName} }}`;
    }
    return rendered;
  }

  function renderJobStrategy(strategy: workflows.Job['strategy']) {
    if (strategy == null) {
      return undefined;
    }

    const rendered: Record<string, unknown> = {
      'max-parallel': strategy.maxParallel,
      'fail-fast': strategy.failFast,
    };

    if (strategy.matrix) {
      const matrix: Record<string, unknown> = {
        include: strategy.matrix.include,
        exclude: strategy.matrix.exclude,
      };
      for (const [key, values] of Object.entries(
        strategy.matrix.domain ?? {},
      )) {
        if (key in matrix) {
          // A domain key was set to `include`, or `exclude`:
          throw new Error(`Illegal job strategy matrix key: ${key}`);
        }
        matrix[key] = values;
      }
      rendered.matrix = matrix;
    }

    return rendered;
  }

  function renderStep(step: workflows.JobStep) {
    return {
      'name': step.name,
      'id': step.id,
      'if': step.if,
      'uses': step.uses && actions.get(step.uses),
      'env': step.env,
      'run': step.run,
      'with': step.with,
      'continue-on-error': step.continueOnError,
      'timeout-minutes': step.timeoutMinutes,
      'working-directory': step.workingDirectory,
    };
  }
}

function arrayOrScalar<T>(arr: T[] | undefined): T | T[] | undefined {
  if (arr == null || arr.length === 0) {
    return arr;
  }
  if (arr.length === 1) {
    return arr[0];
  }
  return arr;
}

function setupTools(tools: workflows.Tools) {
  const steps: workflows.JobStep[] = [];

  if (tools.java) {
    steps.push({
      uses: 'actions/setup-java@v3',
      with: { 'distribution': 'temurin', 'java-version': tools.java.version },
    });
  }

  if (tools.node) {
    steps.push({
      uses: 'actions/setup-node@v3',
      with: { 'node-version': tools.node.version },
    });
  }

  if (tools.python) {
    steps.push({
      uses: 'actions/setup-python@v4',
      with: { 'python-version': tools.python.version },
    });
  }

  if (tools.go) {
    steps.push({
      uses: 'actions/setup-go@v3',
      with: { 'go-version': tools.go.version },
    });
  }

  if (tools.dotnet) {
    steps.push({
      uses: 'actions/setup-dotnet@v3',
      with: { 'dotnet-version': tools.dotnet.version },
    });
  }

  return steps;
}

function verifyJobConstraints(
  jobs: Record<string, workflows.Job | workflows.JobCallingReusableWorkflow>,
) {
  // verify that job has a "permissions" statement to ensure workflow can
  // operate in repos with default tokens set to readonly
  for (const [id, job] of Object.entries(jobs)) {
    if (!job.permissions) {
      throw new Error(
        `${id}: all workflow jobs must have a "permissions" clause to ensure workflow can operate in restricted repositories`,
      );
    }
  }

  // verify that job has a "runsOn" statement to ensure a worker can be selected appropriately
  for (const [id, job] of Object.entries(jobs)) {
    if (!('uses' in job)) {
      if ('runsOn' in job && job.runsOn.length === 0) {
        throw new Error(
          `${id}: at least one runner selector labels must be provided in "runsOn" to ensure a runner instance can be selected`,
        );
      }
    }
  }
}