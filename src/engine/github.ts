import { awscdk } from 'projen';
import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobStep } from 'projen/lib/github/workflows-model';
import { AssetUploadStageOptions, BaseEngine, DeployStageOptions, SynthStageOptions } from './base';
import { CDKPipeline, CDKPipelineOptions } from '../pipeline';

export interface GithubEngineConfig {
  readonly defaultAwsRoleArn?: string;
  readonly awsRoleArnForSynth?: string;
  readonly awsRoleArnForAssetPublishing?: string;
  readonly awsRoleArnForDeployment?: { [stage: string]: string };
}

export class GitHubEngine extends BaseEngine {

  public readonly needsVersionedArtifacts: boolean;

  private deploymentWorkflow: GithubWorkflow;
  private deploymentStages: string[] = [];

  constructor(app: awscdk.AwsCdkTypeScriptApp, props: CDKPipelineOptions, pipeline: CDKPipeline) {
    super(app, props, pipeline);

    this.deploymentWorkflow = this.app.github!.addWorkflow('deploy');
    this.deploymentWorkflow.on({
      push: {
        branches: ['main'], // TODO use defaultReleaseBranch
      },
      workflowDispatch: {},
    });

    this.needsVersionedArtifacts = this.props.stages.find(s => s.manualApproval === true) !== undefined;
  }

  public createSynth(options: SynthStageOptions): void {
    const steps: JobStep[] = [{
      name: 'Checkout',
      uses: 'actions/checkout@v2',
    }];

    if (this.props.githubConfig?.awsRoleArnForSynth) {
      steps.push({
        name: 'AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@master',
        with: {
          'role-to-assume': this.props.githubConfig.awsRoleArnForSynth,
          'role-session-name': 'GitHubAction',
          'aws-region': 'us-east-1',
        },
      });
    }

    steps.push(...options.commands.map(cmd => ({
      run: cmd,
    })));

    steps.push({
      uses: 'actions/upload-artifact@v2',
      with: {
        name: 'cloud-assembly',
        path: `${this.app.cdkConfig.cdkout}/`,
      },
    });

    this.deploymentWorkflow.addJob('synth', {
      name: 'Synth CDK application',
      runsOn: ['ubuntu-latest'],
      env: {
        CI: 'true',
      },
      permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
      steps,
    });
  }

  public createAssetUpload(options: AssetUploadStageOptions): void {
    this.deploymentWorkflow.addJob('assetUpload', {
      name: 'Publish assets to AWS',
      needs: ['synth'],
      runsOn: ['ubuntu-latest'],
      env: {
        CI: 'true',
      },
      permissions: { idToken: JobPermission.WRITE, contents: this.needsVersionedArtifacts ? JobPermission.WRITE : JobPermission.READ },
      steps: [{
        name: 'Checkout',
        uses: 'actions/checkout@v2',
      }, {
        name: 'AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@master',
        with: {
          'role-to-assume': this.props.githubConfig?.awsRoleArnForAssetPublishing ?? this.props.githubConfig?.defaultAwsRoleArn,
          'role-session-name': 'GitHubAction',
          'aws-region': 'us-east-1',
        },
      }, {
        uses: 'actions/download-artifact@v2',
        with: {
          name: 'cloud-assembly',
          path: `${this.app.cdkConfig.cdkout}/`,
        },
      },
      ...options.commands.map(cmd => ({
        run: cmd,
      }))],
    });
  }

  public createDeployment(options: DeployStageOptions): void {
    if (options.config.manualApproval === true) {
      // Create new workflow for deployment
      const stageWorkflow = this.app.github!.addWorkflow(`release-${options.config.name}`);
      stageWorkflow.on({
        workflowDispatch: {},
      });
      stageWorkflow.addJob('deploy', {
        name: `Release stage ${options.config.name} to AWS`,
        runsOn: ['ubuntu-latest'],
        env: {
          CI: 'true',
        },
        permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
        steps: [{
          name: 'Checkout',
          uses: 'actions/checkout@v2',
        }, {
          name: 'AWS Credentials',
          uses: 'aws-actions/configure-aws-credentials@master',
          with: {
            'role-to-assume': this.props.githubConfig?.awsRoleArnForDeployment?.[options.config.name] ?? this.props.githubConfig?.defaultAwsRoleArn,
            'role-session-name': 'GitHubAction',
            'aws-region': options.config.env.region,
          },
        },
        ...options.installCommands.map(cmd => ({
          run: cmd,
        })),
        {
          run: `yarn add ${this.props.pkgNamespace}/${this.app.name} && mv ./node_modules/${this.props.pkgNamespace}/${this.app.name} ${this.app.cdkConfig.cdkout}`,
        },
        ...options.deployCommands.map(cmd => ({
          run: cmd,
        }))],
      });

    } else {
      // Add deployment to CI/CD workflow
      this.deploymentWorkflow.addJob(`deploy-${options.config.name}`, {
        name: `Deploy stage ${options.config.name} to AWS`,
        needs: this.deploymentStages.length > 0 ? ['assetUpload', `deploy-${this.deploymentStages.at(-1)!}`] : ['assetUpload'],
        runsOn: ['ubuntu-latest'],
        env: {
          CI: 'true',
        },
        permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
        steps: [{
          name: 'Checkout',
          uses: 'actions/checkout@v2',
        }, {
          name: 'AWS Credentials',
          uses: 'aws-actions/configure-aws-credentials@master',
          with: {
            'role-to-assume': this.props.githubConfig?.awsRoleArnForDeployment?.[options.config.name] ?? this.props.githubConfig?.defaultAwsRoleArn,
            'role-session-name': 'GitHubAction',
            'aws-region': options.config.env.region,
          },
        }, {
          uses: 'actions/download-artifact@v2',
          with: {
            name: 'cloud-assembly',
            path: `${this.app.cdkConfig.cdkout}/`,
          },
        },
        ...options.installCommands.map(cmd => ({
          run: cmd,
        })),
        ...options.deployCommands.map(cmd => ({
          run: cmd,
        }))],
      });
      this.deploymentStages.push(options.config.name);
    }
  }
}