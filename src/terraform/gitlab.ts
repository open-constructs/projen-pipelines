// src/terraform/gitlab.ts
import { gitlab, Project } from 'projen';
import { PipelineEngine } from '../engine';
import { TerraformPipeline, TerraformPipelineOptions } from './base';
import { PipelineStep } from '../steps';

export interface GitlabTerraformPipelineOptions extends TerraformPipelineOptions {
  /**
   * runner tags to use to select runners
   */
  readonly runnerTags?: string[];

  /** The Docker image to use for running the pipeline jobs. */
  readonly image?: string;
}

export class GitlabTerraformPipeline extends TerraformPipeline {

  /** The Docker image used for pipeline jobs. Defaults to a specified image or a default value. */
  public readonly jobImage: string;

  /** GitLab CI/CD configuration object. */
  public readonly config: gitlab.GitlabConfiguration;

  constructor(project: Project, private options: GitlabTerraformPipelineOptions) {
    super(project, options);

    // Create the GitLab CI file
    this.config = new gitlab.GitlabConfiguration(project, {
      stages: [],
      jobs: {},
    });

    this.jobImage = options.image || `hashicorp/terraform:${options.terraformVersion || 'latest'}`;

    this.createPlan();
    this.createDeployment();
  }

  public engineType(): PipelineEngine {
    return PipelineEngine.GITLAB;
  }

  public createPlan(): void {
    const steps: PipelineStep[] = [
      this.providePlanStep(),
    ];

    const gitlabSteps = steps.map(s => s.toGitlab());

    const jobName = this.baseOptions.name ? `plan-${this.baseOptions.name}` :'plan';

    this.config.addStages('plan');
    this.config.addJobs({
      [jobName]: {
        extends: [...gitlabSteps.flatMap(s => s.extensions)],
        needs: gitlabSteps.flatMap(s => s.needs),
        stage: 'plan',
        tags: this.options.runnerTags,
        script: gitlabSteps.flatMap(s => s.commands),
        variables: gitlabSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        only: {
          refs: [this.branchName],
        },
      },
    });
  }

  public createDeployment(): void {
    const steps: PipelineStep[] = [
      this.provideDeployStep(),
    ];

    const gitlabSteps = steps.map(s => s.toGitlab());

    const jobName = this.baseOptions.name ? `apply-${this.baseOptions.name}` :'apply';

    this.config.addStages('apply');
    this.config.addJobs({
      [jobName]: {
        extends: [...gitlabSteps.flatMap(s => s.extensions)],
        needs: gitlabSteps.flatMap(s => s.needs),
        stage: 'apply',
        tags: this.options.runnerTags,
        script: gitlabSteps.flatMap(s => s.commands),
        variables: gitlabSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        only: {
          refs: [this.branchName],
        },
      },
    });
  }

}
