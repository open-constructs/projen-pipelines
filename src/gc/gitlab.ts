import { gitlab, Project } from 'projen';
import { GarbageCollectionWorkflow, GarbageCollectionWorkflowOptions } from './base';
import { GarbageCollectionStep } from './step';

/**
 * Options for the GitLab garbage collection workflow.
 */
export interface GitLabGarbageCollectionWorkflowOptions extends GarbageCollectionWorkflowOptions {
  /**
   * GitLab runner tags.
   */
  readonly runnerTags?: string[];

  /**
   * Docker image to use for garbage collection jobs.
   * @default "node:20"
   */
  readonly image?: string;
}

/**
 * Creates a GitLab CI configuration that runs CDK garbage collection
 * on a schedule for each configured stage.
 */
export class GitLabGarbageCollectionWorkflow extends GarbageCollectionWorkflow {
  private readonly runnerTags: string[];
  private readonly image: string;
  private readonly config: gitlab.GitlabConfiguration;

  constructor(project: Project, options: GitLabGarbageCollectionWorkflowOptions) {
    super(project, options);
    this.runnerTags = options.runnerTags ?? [];
    this.image = options.image ?? 'node:20';
    this.config = new gitlab.GitlabConfiguration(project, {
      stages: [],
      jobs: {},
    });

    this.config.addStages('gc');

    this.config.addJobs({
      [`.${this.namePrefix}cdk-gc`]: {
        stage: 'gc',
        tags: this.runnerTags,
        image: { name: this.image },
        idTokens: {
          AWS_TOKEN: {
            aud: 'https://sts.amazonaws.com',
          },
        },
        only: {
          refs: ['schedules'],
          variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$CDK_GC == "true"'],
        },
        beforeScript: [
          'apt-get update && apt-get install -y python3 python3-pip',
          'pip3 install awscli',
          ...this.preInstallSteps.flatMap(step => step.toGitlab().commands),
          `${this.project.projenCommand} install:ci`,
        ],
      },
    });

    // Add job for each stage
    for (const stage of this.stages) {
      const jobName = `${this.namePrefix}gc:${stage.name}`;

      const gcStep = new GarbageCollectionStep(this.project, {
        stage,
        workflowGcOptions: this.gcOptions,
      });
      const stepConfig = gcStep.toGitlab();

      this.config.addJobs({
        [jobName]: {
          extends: [`.${this.namePrefix}cdk-gc`],
          variables: {
            ...stepConfig.env,
          },
          script: stepConfig.commands,
        },
      });
    }
  }
}
