import { awscdk } from 'projen';
import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobStep } from 'projen/lib/github/workflows-model';
import { AssetUploadStageOptions, BaseEngine, DeployStageOptions, SynthStageOptions } from './base';
import { CDKPipeline, CDKPipelineOptions } from '../pipeline';

export interface RoleMap {
  readonly feature?: string;
  readonly dev?: string;
  readonly prod?: string;
}

export interface GithubEngineConfig {
  readonly defaultAwsRoleArn?: string;
  readonly awsRoleArnForSynth?: string;
  readonly awsRoleArnForAssetPublishing?: string;
  readonly awsRoleArnForDeployment?: RoleMap;
}

export class GitHubEngine extends BaseEngine {

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
  }

  public createSynth(options: SynthStageOptions): void {
    const steps: JobStep[] = [{
      name: 'Checkout',
      uses: 'actions/checkout@v2',
      env: {
        CI: 'true',
      },
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
        path: 'cdk.out/',
      },
    });

    this.deploymentWorkflow.addJob('synth', {
      name: 'Synth CDK application',
      runsOn: ['ubuntu-latest'],
      permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
      steps,
    });
  }

  public createAssetUpload(options: AssetUploadStageOptions): void {
    this.deploymentWorkflow.addJob('assetUpload', {
      name: 'Publish assets to AWS',
      needs: ['synth'],
      runsOn: ['ubuntu-latest'],
      permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
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
          path: 'cdk.out/',
        },
      },
      ...options.commands.map(cmd => ({
        run: cmd,
      }))],
    });
  }

  public createDeployment(options: DeployStageOptions): void {
    this.deploymentWorkflow.addJob(`deploy-${options.stageName}`, {
      name: `Deploy stage ${options.stageName} to AWS`,
      needs: this.deploymentStages.length > 0 ? ['assetUpload', `deploy-${this.deploymentStages.at(-1)!}`] : ['assetUpload'],
      runsOn: ['ubuntu-latest'],
      permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
      steps: [{
        name: 'Checkout',
        uses: 'actions/checkout@v2',
      }, {
        name: 'AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@master',
        with: {
          'role-to-assume': this.props.githubConfig?.awsRoleArnForDeployment?.[options.stageName as keyof RoleMap] ?? this.props.githubConfig?.defaultAwsRoleArn,
          'role-session-name': 'GitHubAction',
          'aws-region': options.env.region,
        },
      }, {
        uses: 'actions/download-artifact@v2',
        with: {
          name: 'cloud-assembly',
          path: 'cdk.out/',
        },
      },
      ...options.commands.map(cmd => ({
        run: cmd,
      }))],
    });
    this.deploymentStages.push(options.stageName);
  }
}