import { Project } from 'projen';
import { GitHubProject, GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { GarbageCollectionWorkflow, GarbageCollectionWorkflowOptions } from './base';
import { GarbageCollectionStep } from './step';

/**
 * Options for the GitHub garbage collection workflow.
 */
export interface GitHubGarbageCollectionWorkflowOptions extends GarbageCollectionWorkflowOptions {
  /**
   * Additional permissions for the GitHub workflow jobs.
   */
  readonly permissions?: Record<string, string>;
}

/**
 * Creates a GitHub Actions workflow that runs CDK garbage collection
 * on a schedule for each configured stage.
 *
 * Stages sharing the same account/region pair are deduplicated to avoid
 * running garbage collection twice on the same bootstrap resources.
 */
export class GitHubGarbageCollectionWorkflow extends GarbageCollectionWorkflow {
  private readonly permissions?: Record<string, string>;
  private readonly workflow: GithubWorkflow;

  constructor(project: Project, options: GitHubGarbageCollectionWorkflowOptions) {
    super(project, options);
    this.permissions = options.permissions;

    this.workflow = (this.project as GitHubProject).github!.addWorkflow(`${this.namePrefix}cdk-gc`);
    this.workflow.on({
      schedule: [{
        cron: this.schedule,
      }],
      workflowDispatch: {},
    });

    // Deduplicate stages sharing the same account/region pair
    const seen = new Set<string>();
    const deduplicatedStages = this.stages.filter(stage => {
      const key = `${stage.env.account}/${stage.env.region}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Add job for each deduplicated stage
    for (const stage of deduplicatedStages) {
      const jobId = `gc-${stage.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const gcStep = new GarbageCollectionStep(this.project, {
        stage,
        workflowGcOptions: this.gcOptions,
      });
      const githubConfig = gcStep.toGithub();

      this.workflow.addJob(jobId, {
        name: `GC - ${stage.name}`,
        runsOn: ['ubuntu-latest'],
        ...(stage.timeoutMinutes ? { timeoutMinutes: stage.timeoutMinutes } : {}),
        concurrency: {
          group: `${this.namePrefix}cdk-gc-${stage.name}`,
          cancelInProgress: false,
        },
        env: githubConfig.env,
        permissions: {
          contents: JobPermission.READ,
          ...(githubConfig.permissions ?? {}),
          ...this.permissions,
        },
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': '20',
            },
          },
          ...this.preInstallSteps.flatMap(step => step.toGithub().steps),
          {
            name: 'Install dependencies',
            run: `${this.project.projenCommand} install:ci`,
          },
          ...githubConfig.steps,
        ],
      });
    }
  }
}
