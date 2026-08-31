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

    // Deduplicate stages sharing the same account/region pair.
    // Since CDK bootstrap resources are per-account-per-region, only the first
    // stage for each account/region is kept. If later stages have differing
    // gcOptions, those overrides are silently dropped.
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

      // Merge stage environment variables into job env
      const jobEnv: Record<string, string> = {
        ...githubConfig.env,
        ...(stage.environment ?? {}),
      };

      this.workflow.addJob(jobId, {
        name: `GC - ${stage.name}`,
        runsOn: ['ubuntu-latest'],
        ...(stage.timeoutMinutes ? { timeoutMinutes: stage.timeoutMinutes } : {}),
        concurrency: {
          group: `${this.namePrefix}cdk-gc-${stage.name}`,
          cancelInProgress: false,
        },
        env: jobEnv,
        permissions: {
          contents: JobPermission.READ,
          ...(githubConfig.permissions ?? {}),
          ...this.permissions,
        },
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v6',
          },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v6',
            with: {
              'node-version': '20',
            },
          },
          ...this.preInstallSteps.flatMap(step => step.toGithub().steps),
          {
            name: 'Install dependencies',
            run: `${this.project.projenCommand} install:ci`,
          },
          ...githubConfig.steps.map(step => ({
            ...step,
            run: step.run ? `${step.run} 2>&1 | tee cdk-gc-output.txt` : step.run,
          })),
          {
            name: 'Write to job summary',
            if: 'always()',
            run: [
              'if [ -f cdk-gc-output.txt ]; then',
              `  echo "## CDK Garbage Collection - ${stage.name}" >> $GITHUB_STEP_SUMMARY`,
              '  echo "" >> $GITHUB_STEP_SUMMARY',
              '  echo "\\`\\`\\`" >> $GITHUB_STEP_SUMMARY',
              '  cat cdk-gc-output.txt >> $GITHUB_STEP_SUMMARY',
              '  echo "\\`\\`\\`" >> $GITHUB_STEP_SUMMARY',
              'fi',
            ].join('\n'),
          },
        ],
      });
    }
  }
}
