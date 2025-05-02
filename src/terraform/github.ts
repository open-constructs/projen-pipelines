import { GitHubProject, GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { PipelineEngine } from '../engine';
import { TerraformPipeline, TerraformPipelineOptions } from './base';
import { PipelineStep } from '../steps';

export interface GithubTerraformPipelineOptions extends TerraformPipelineOptions {
  /**
   * runner tags to use to select runners
   *
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];
}

export class GithubTerraformPipeline extends TerraformPipeline {

  private readonly deployWorkflow: GithubWorkflow;

  constructor(project: GitHubProject, private options: GithubTerraformPipelineOptions) {
    super(project, options);

    // Create the main deployment workflow
    this.deployWorkflow = (this.project as GitHubProject).github!.addWorkflow(this.baseOptions.name ? `deploy-${this.baseOptions.name}` :'deploy');
    this.deployWorkflow.on({
      push: {
        branches: [this.branchName],
      },
      workflowDispatch: {},
    });

    this.createPlan();
    this.createDeployment();
  }

  public engineType(): PipelineEngine {
    return PipelineEngine.GITHUB;
  }

  public createPlan(): void {
    const steps: PipelineStep[] = [];
    steps.push(this.providePlanStep());

    const githubSteps = steps.map(s => s.toGithub());

    this.deployWorkflow.addJob('plan', {
      name: 'Plan Terraform changes',
      runsOn: this.options.runnerTags ?? ['ubuntu-latest'],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      env: {
        CI: 'true',
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v4',
        },
        // Setup Terraform
        {
          name: 'Setup Terraform',
          uses: 'hashicorp/setup-terraform@v2',
          with: {
            terraform_version: this.options.terraformVersion ?? 'latest',
          },
        },
        ...githubSteps.flatMap(s => s.steps),
      ],
    });
  }

  public createDeployment(): void {
    const needsJobs = [];

    const steps: PipelineStep[] = [];
    steps.push(this.provideDeployStep());
    const githubSteps = steps.map(s => s.toGithub());

    // If this is the first stage, it depends on the plan job
    needsJobs.push('plan');

    this.deployWorkflow.addJob('apply', {
      name: 'Apply',
      needs: needsJobs,
      runsOn: this.options.runnerTags ?? ['ubuntu-latest'],
      permissions: {
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      },
      env: {
        CI: 'true',
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v4',
        },
        // Setup Terraform
        {
          name: 'Setup Terraform',
          uses: 'hashicorp/setup-terraform@v2',
          with: {
            terraform_version: this.options.terraformVersion ?? 'latest',
          },
        },
        ...githubSteps.flatMap(s => s.steps),
      ],
    });
  }

}
