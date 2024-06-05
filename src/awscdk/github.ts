import { awscdk } from 'projen';
import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobStep } from 'projen/lib/github/workflows-model';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from './base';
import { PipelineEngine } from '../engine';

const DEFAULT_RUNNER_TAGS = ['ubuntu-latest'];

/**
 * Configuration interface for GitHub-specific IAM roles used in the CDK pipeline.
 */
export interface GithubIamRoleConfig {

  /** Default IAM role ARN used if no specific role is provided. */
  readonly default?: string;
  /** IAM role ARN for the synthesis step. */
  readonly synth?: string;
  /** IAM role ARN for the asset publishing step. */
  readonly assetPublishing?: string;
  /** IAM role ARNs for different deployment stages. */
  readonly deployment?: { [stage: string]: string };
}

/**
 * Extension of the base CDKPipeline options including specific configurations for GitHub.
 */
export interface GithubCDKPipelineOptions extends CDKPipelineOptions {

  /** IAM config for GitHub Actions */
  readonly iamRoleArns: GithubIamRoleConfig;

  /**
   * runner tags to use to select runners
   *
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

  /** use GitHub Packages to store vesioned artifacts of cloud assembly; also needed for manual approvals */
  readonly useGithubPackagesForAssembly?: boolean;
}


/**
 * Implements a CDK Pipeline configured specifically for GitHub workflows.
 */
export class GithubCDKPipeline extends CDKPipeline {

  /** Indicates if versioned artifacts are needed based on manual approval requirements. */
  public readonly needsVersionedArtifacts: boolean;

  /** The GitHub workflow associated with the pipeline. */
  private deploymentWorkflow: GithubWorkflow;
  /** List of deployment stages for the pipeline. */
  private deploymentStages: string[] = [];

  protected useGithubPackages: boolean;

  /**
   * Constructs a new GithubCDKPipeline instance.
   * @param app - The CDK app associated with this pipeline.
   * @param options - Configuration options for the pipeline.
   */
  constructor(app: awscdk.AwsCdkTypeScriptApp, private options: GithubCDKPipelineOptions) {
    super(app, {
      ...options,
      ...options.useGithubPackagesForAssembly && {
        preInstallCommands: [
          'echo "GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}" >> $GITHUB_ENV',
          ...(options.preInstallCommands ?? []),
        ],
      },
    });

    // Initialize the deployment workflow on GitHub.
    this.deploymentWorkflow = this.app.github!.addWorkflow('deploy');
    this.deploymentWorkflow.on({
      push: {
        branches: [this.branchName],
      },
      workflowDispatch: {},
    });

    // Determine if versioned artifacts are necessary.
    this.needsVersionedArtifacts = options.stages.find(s => s.manualApproval === true) !== undefined;;
    this.useGithubPackages = this.needsVersionedArtifacts && (options.useGithubPackagesForAssembly ?? false);

    if (this.useGithubPackages) {
      app.npmrc.addRegistry('https://npm.pkg.github.com', this.options.pkgNamespace);
      app.npmrc.addConfig('//npm.pkg.github.com/:_authToken', '${GITHUB_TOKEN}');
      app.npmrc.addConfig('//npm.pkg.github.com/:always-auth', 'true');
    }

    // Create jobs for synthesizing, asset uploading, and deployment.
    this.createSynth();

    this.createAssetUpload();

    for (const stage of options.stages) {
      this.createDeployment(stage);
    }
  }

  /** the type of engine this implementation of CDKPipeline is for */
  public engineType(): PipelineEngine {
    return PipelineEngine.GITHUB;
  }

  /**
   * Creates a synthesis job for the pipeline using GitHub Actions.
   */
  private createSynth(): void {
    const steps: JobStep[] = [{
      name: 'Checkout',
      uses: 'actions/checkout@v4',
    }];

    if (this.options.iamRoleArns?.synth) {
      steps.push({
        name: 'AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@master',
        with: {
          'role-to-assume': this.options.iamRoleArns.synth,
          'role-session-name': 'GitHubAction',
          'aws-region': 'us-east-1',
        },
      });
    }
    const preInstallSteps = (this.options.preInstallSteps ?? []).map(s => s.toGithub());
    const preSynthSteps = (this.options.preSynthSteps ?? []).map(s => s.toGithub());
    const postSynthSteps = (this.options.postSynthSteps ?? []).map(s => s.toGithub());

    steps.push(...preInstallSteps.flatMap(s => s.steps));
    steps.push(...this.renderInstallCommands().map(cmd => ({
      run: cmd,
    })));

    steps.push(...preSynthSteps.flatMap(s => s.steps));
    steps.push(...this.renderSynthCommands().map(cmd => ({
      run: cmd,
    })));
    steps.push(...postSynthSteps.flatMap(s => s.steps));

    steps.push({
      uses: 'actions/upload-artifact@v4',
      with: {
        name: 'cloud-assembly',
        path: `${this.app.cdkConfig.cdkout}/`,
      },
    });

    this.deploymentWorkflow.addJob('synth', {
      name: 'Synth CDK application',
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      env: {
        CI: 'true',
        ...preInstallSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        ...preSynthSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        ...postSynthSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      needs: [...preInstallSteps.flatMap(s => s.needs), ...preSynthSteps.flatMap(s => s.needs), ...postSynthSteps.flatMap(s => s.needs)],
      permissions: {
        idToken: JobPermission.WRITE,
        contents: JobPermission.READ,
        ...this.useGithubPackages && {
          packages: JobPermission.READ,
        },
      },
      steps,
    });
  }

  /**
   * Creates a job to upload assets to AWS as part of the pipeline.
   */
  public createAssetUpload(): void {
    const preInstallSteps = (this.options.preInstallSteps ?? []).map(s => s.toGithub());

    this.deploymentWorkflow.addJob('assetUpload', {
      name: 'Publish assets to AWS',
      needs: ['synth', ...preInstallSteps.flatMap(s => s.needs)],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      env: {
        CI: 'true',
        ...preInstallSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      permissions: {
        idToken: JobPermission.WRITE,
        contents: this.needsVersionedArtifacts ? JobPermission.WRITE : JobPermission.READ,
        ...this.useGithubPackages && {
          packages: JobPermission.WRITE,
        },
      },
      steps: [{
        name: 'Checkout',
        uses: 'actions/checkout@v4',
        with: {
          'fetch-depth': 0,
        },
      }, {
        name: 'Setup GIT identity',
        run: 'git config --global user.name "github-actions" && git config --global user.email "github-actions@github.com"',
      }, {
        name: 'AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@master',
        with: {
          'role-to-assume': this.options.iamRoleArns?.assetPublishing ?? this.options.iamRoleArns?.default,
          'role-session-name': 'GitHubAction',
          'aws-region': 'us-east-1',
        },
      }, {
        uses: 'actions/download-artifact@v4',
        with: {
          name: 'cloud-assembly',
          path: `${this.app.cdkConfig.cdkout}/`,
        },
      },
      ...preInstallSteps.flatMap(s => s.steps),
      ...this.renderInstallCommands().map(cmd => ({
        run: cmd,
      })),
      ...this.getAssetUploadCommands(this.needsVersionedArtifacts).map(cmd => ({
        run: cmd,
      }))],
    });
  }

  /**
   * Creates a job to deploy the CDK application to AWS.
   * @param stage - The deployment stage to create.
   */
  public createDeployment(stage: DeploymentStage): void {
    const preInstallSteps = (this.options.preInstallSteps ?? []).map(s => s.toGithub());

    if (stage.manualApproval === true) {
      // Create new workflow for deployment
      const stageWorkflow = this.app.github!.addWorkflow(`release-${stage.name}`);
      stageWorkflow.on({
        workflowDispatch: {
          inputs: {
            version: {
              description: 'Package version',
              required: true,
            },
          },
        },
      });
      stageWorkflow.addJob('deploy', {
        name: `Release stage ${stage.name} to AWS`,
        needs: preInstallSteps.flatMap(s => s.needs),
        runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
        env: {
          CI: 'true',
          ...preInstallSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        },
        permissions: {
          idToken: JobPermission.WRITE,
          contents: JobPermission.READ,
          ...this.useGithubPackages && {
            packages: JobPermission.READ,
          },
        },
        steps: [{
          name: 'Checkout',
          uses: 'actions/checkout@v4',
        }, {
          name: 'AWS Credentials',
          uses: 'aws-actions/configure-aws-credentials@master',
          with: {
            'role-to-assume': this.options.iamRoleArns?.deployment?.[stage.name] ?? this.options.iamRoleArns?.default,
            'role-session-name': 'GitHubAction',
            'aws-region': stage.env.region,
          },
        },
        ...preInstallSteps.flatMap(s => s.steps),
        ...this.renderInstallCommands().map(cmd => ({
          run: cmd,
        })),
        ...this.renderInstallPackageCommands(`${this.options.pkgNamespace}/${this.app.name}@\${{github.event.inputs.version}}`).map(cmd => ({
          run: cmd,
        })),
        {
          run: `mv ./node_modules/${this.options.pkgNamespace}/${this.app.name} ${this.app.cdkConfig.cdkout}`,
        },
        ...this.renderDeployCommands(stage.name).map(cmd => ({
          run: cmd,
        })),
        {
          uses: 'actions/upload-artifact@v3',
          with: {
            name: `cdk-outputs-${stage.name}`,
            path: `cdk-outputs-${stage.name}.json`,
          },
        }],
      });

    } else {
      // Add deployment to CI/CD workflow
      this.deploymentWorkflow.addJob(`deploy-${stage.name}`, {
        name: `Deploy stage ${stage.name} to AWS`,
        needs: ['assetUpload', ...preInstallSteps.flatMap(s => s.needs), ...(this.deploymentStages.length > 0 ? [`deploy-${this.deploymentStages.at(-1)!}`] : [])],
        runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
        env: {
          CI: 'true',
          ...preInstallSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        },
        permissions: {
          idToken: JobPermission.WRITE,
          contents: JobPermission.READ,
          ...this.useGithubPackages && {
            packages: JobPermission.READ,
          },
        },
        steps: [{
          name: 'Checkout',
          uses: 'actions/checkout@v4',
        }, {
          name: 'AWS Credentials',
          uses: 'aws-actions/configure-aws-credentials@master',
          with: {
            'role-to-assume': this.options.iamRoleArns?.deployment?.[stage.name] ?? this.options.iamRoleArns?.default,
            'role-session-name': 'GitHubAction',
            'aws-region': stage.env.region,
          },
        }, {
          uses: 'actions/download-artifact@v4',
          with: {
            name: 'cloud-assembly',
            path: `${this.app.cdkConfig.cdkout}/`,
          },
        },
        ...preInstallSteps.flatMap(s => s.steps),
        ...this.renderInstallCommands().map(cmd => ({
          run: cmd,
        })),
        ...this.renderDeployCommands(stage.name).map(cmd => ({
          run: cmd,
        })),
        {
          uses: 'actions/upload-artifact@v3',
          with: {
            name: `cdk-outputs-${stage.name}`,
            path: `cdk-outputs-${stage.name}.json`,
          },
        }],
      });
      this.deploymentStages.push(stage.name);
    }
  }
}
