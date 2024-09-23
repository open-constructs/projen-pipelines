import { Environment } from '@amazon-codecatalyst/blueprint-component.environments';
import { convertToWorkflowEnvironment, WorkflowBuilder } from '@amazon-codecatalyst/blueprint-component.workflows';
import { YamlFile, awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from './base';

import { PipelineEngine } from '../engine';
import { PipelineStep, SimpleCommandStep, UploadArtifactStep } from '../steps';
import { Blueprint } from './codecatalyst/blueprint';

/*
Needs to create:
- build.yml (creates and mutates pipeline by executing projen build) - comes from projen
- deploy.yaml (build + deploy to dev)
- pull-request-lint.yml (executes amannn/action-semantic-pull-request@v5.0.2) - comes from projen
- release-prod.yaml (deploy to prod - not required, move over to "manual approvals" in deplo)
- upgrade.yaml (upgrade dependencies)  - comes from projen

* synth -> create artifacts
* upload cdk assets ->  save assets in s3 (lambda), build container images (push to ECR) -- everything in AWS
* deploy for each stage that is non-production
* deploy to prod (manual approval)

TODO:
- account target -- NOT POSSIBLE as we cannot create environments/accounts/targets
- manual approval for stages -- DONE
- IAM role per stage, synth, asset - NOT POSSIBLE as we cannot create environments
- independend stages (all parallel to each other) after synth&assets -- DONE
- environments support - DONE
- steps per stage - preInstall, preSynth, ... - DONE

example: https://github.com/aws-community-dach/event-system-backend

test docgen: https://github.com/open-constructs/aws-cdk-library


*/

export interface CodeCatalystIamRoleConfig {
  /** Default IAM role ARN used if no specific role is provided. */
  readonly default?: string;
  /** IAM role ARN for the synthesis step. */
  readonly synth?: string;
  /** IAM role ARN for the asset publishing step. */
  readonly assetPublishing?: string;
  /** IAM role ARN for the asset publishing step for a specific stage. */
  readonly assetPublishingPerStage?: { [stage: string]: string };
  /** IAM role ARNs for different deployment stages. */
  readonly deployment?: { [stage: string]: string };
}

export interface CodeCatalystCDKPipelineOptions extends CDKPipelineOptions {
  readonly iamRoleArns: CodeCatalystIamRoleConfig;
}

export class CodeCatalystCDKPipeline extends CDKPipeline {

  public readonly needsVersionedArtifacts: boolean;

  private deploymentWorkflowBuilder: WorkflowBuilder;
  private environments: Map<String, Environment> = new Map();
  private deploymentStages: string[] = [];

  private readonly bp: Blueprint;

  constructor(app: awscdk.AwsCdkTypeScriptApp, private options: CodeCatalystCDKPipelineOptions) {
    super(app, options);
    // see https://github.com/aws/codecatalyst-blueprints/issues/477
    process.env.CONTEXT_ENVIRONMENTID = 'prod';

    this.bp = new Blueprint({ outdir: '.codecatalyst/workflows' });

    if (this.options.iamRoleArns) {
      this.createEnvironments();
    }

    this.deploymentWorkflowBuilder = new WorkflowBuilder(this.bp);

    this.deploymentWorkflowBuilder.setName('deploy');
    this.deploymentWorkflowBuilder.addBranchTrigger(['main']);

    this.needsVersionedArtifacts = this.options.stages.find(s => s.manualApproval === true) !== undefined;

    this.createSynth();
    this.createAssetUpload();

    for (const stage of options.stages) {
      this.createDeployment(stage);
    }

    for (const stage of (options.independentStages ?? [])) {
      this.createIndependentDeployment(stage);
    }

    new YamlFile(this, '.codecatalyst/workflows/deploy.yaml', {
      obj: () => this.deploymentWorkflowBuilder.getDefinition(),
    });
  }

  public createEnvironments() {
    if (this.options.iamRoleArns.default) {
      this.environments.set('default',
        new Environment(this.bp, {
          environmentType: 'DEVELOPMENT',
          name: 'default',
          description: 'default deployment environment',
          awsAccount: {
            id: 'default',
            name: 'awsAccount',
            awsAccount: { name: 'default-role', arn: this.options.iamRoleArns.default },
          },
        }));
    }

    if (this.options.iamRoleArns.synth) {
      this.environments.set('synth',
        new Environment(this.bp, {
          environmentType: 'DEVELOPMENT',
          name: 'synth',
          description: 'synth deployment environment',
          awsAccount: {
            id: 'synth',
            name: 'awsAccount',
            awsAccount: { name: 'synth-role', arn: this.options.iamRoleArns.synth },
          },
        }));
    }

    if (this.options.iamRoleArns.assetPublishing) {
      this.environments.set('assetPublishing',
        new Environment(this.bp, {
          environmentType: 'DEVELOPMENT',
          name: 'assetPublishing',
          description: 'asset publishing deployment environment',
          awsAccount: {
            id: 'assetPublishing',
            name: 'awsAccount',
            awsAccount: { name: 'assetPublishing-role', arn: this.options.iamRoleArns.assetPublishing },
          },
        }));
    }

    if (this.options.iamRoleArns.assetPublishingPerStage) {
      for (const [stage, arn] of Object.entries(this.options.iamRoleArns.assetPublishingPerStage)) {
        this.environments.set(`${stage}AssetPublishing`,
          new Environment(this.bp, {
            environmentType: 'DEVELOPMENT',
            name: `${stage}AssetPublishingPerStage`,
            description: `${stage} asset publishing deployment environment`,
            awsAccount: {
              id: `${stage}AssetPublishingPerStage`,
              name: 'awsAccount',
              awsAccount: { name: `${stage}-role`, arn: arn },
            },
          }));
      }
    }

    if (this.options.iamRoleArns.deployment) {
      for (const [stage, arn] of Object.entries(this.options.iamRoleArns.deployment)) {
        this.environments.set(stage,
          new Environment(this.bp, {
            environmentType: 'DEVELOPMENT',
            name: stage,
            description: `${stage} deployment environment`,
            awsAccount: {
              id: stage,
              name: 'awsAccount',
              awsAccount: { name: `${stage}-role`, arn: arn },
            },
          }));
      }
    }
  }

  /** the type of engine this implementation of CDKPipeline is for */
  public engineType(): PipelineEngine {
    return PipelineEngine.CODE_CATALYST;
  }

  private createSynth(): void {
    const steps: PipelineStep[] = [];

    steps.push(...this.baseOptions.preInstallSteps ?? []);
    steps.push(new SimpleCommandStep(this.project, this.renderInstallCommands()));

    steps.push(...this.baseOptions.preSynthSteps ?? []);
    steps.push(new SimpleCommandStep(this.project, this.renderSynthCommands()));
    steps.push(...this.baseOptions.postSynthSteps ?? []);

    steps.push(new UploadArtifactStep(this.project, {
      name: 'cloud-assembly',
      path: `${this.app.cdkConfig.cdkout}/`,
    }));

    const codeCatalystSteps = steps.map(s => s.toCodeCatalyst());

    const cmds: string[] = [];
    cmds.push(...this.renderInstallCommands());
    cmds.push(...this.renderSynthCommands());
    this.deploymentWorkflowBuilder.addBuildAction({
      actionName: 'SynthCDKApplication',
      input: {
        Sources: ['WorkflowSource'],
        Variables: {
          CI: 'true',
        },
      },
      steps:
        [...codeCatalystSteps.flatMap(s => s.commands)],
      // FIXME is there is an environment, connect it to the workflow
      // needs to react on this.options.iamRoleArns?.synth
      //environment: environment && convertToWorkflowEnvironment(environment),

      // FIXME what about the permissions?
      // permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
      environment: convertToWorkflowEnvironment(this.environments.get('default')),
      output: {},
    });

    /*
not required because codecatalyst automatically uploads artifacts
FIXME or do we need to create "artifacts" here and upload?
steps.push({
      uses: 'actions/upload-artifact@v3',
      with: {
        name: 'cloud-assembly',
        path: `${this.app.cdkConfig.cdkout}/`,
      },
    });
    */
  }

  public createAssetUpload(): void {

    const cmds: string[] = [];
    cmds.push(...this.renderAssetUploadCommands());
    this.deploymentWorkflowBuilder.addBuildAction({
      actionName: 'PublishAssetsToAWS',
      dependsOn: ['SynthCDKApplication'],
      input: {
        Sources: ['WorkflowSource'],
        Variables: {
          CI: 'true',
        },
      },
      steps:
        cmds,
      // FIXME is there is an environment, connect it to the workflow
      // needs to react on this.options.iamRoleArns?.synth
      //environment: environment && convertToWorkflowEnvironment(environment),

      // FIXME what about the permissions?
      // permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },

      output: {},
    });
  }

  public createDeployment(stage: DeploymentStage): void {
    let dependsOn = `deploy_${this.deploymentStages.at(-1)!}`;
    if (stage.manualApproval === true) {
      this.deploymentWorkflowBuilder.addGenericAction({
        Identifier: 'aws/approval@v1',
        actionName: `approve_${stage.name}`,
        DependsOn: [dependsOn],
        Configuration: {
          ApprovalsRequired: 1,
        },
      });
      dependsOn = `approve_${stage.name}`;
    }
    // Add deployment to existing workflow
    const cmds: string[] = [];
    cmds.push(...this.renderInstallCommands());
    cmds.push(...this.renderDeployCommands(stage.name));
    this.deploymentWorkflowBuilder.addBuildAction({
      actionName: `deploy_${stage.name}`,
      dependsOn: this.deploymentStages.length > 0 ? ['PublishAssetsToAWS', dependsOn] : ['PublishAssetsToAWS'],
      input: {
        Sources: ['WorkflowSource'],
        Variables: {
          CI: 'true',
        },
      },
      steps:
        cmds,
      // FIXME is there is an environment, connect it to the workflow
      // needs to react on this.options.iamRoleArns?.synth
      //environment: environment && convertToWorkflowEnvironment(environment),

      // FIXME what about the permissions?
      // permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },

      output: {},
      environment: convertToWorkflowEnvironment(this.environments.get(stage.name)),
    });

    this.deploymentStages.push(stage.name);
  }

  public createIndependentDeployment(stage: DeploymentStage): void {
    let dependsOn = 'PublishAssetsToAWS';
    if (stage.manualApproval === true) {
      this.deploymentWorkflowBuilder.addGenericAction({
        Identifier: 'aws/approval@v1',
        actionName: `approve_${stage.name}`,
        DependsOn: [dependsOn],
        Configuration: {
          ApprovalsRequired: 1,
        },
      });
      dependsOn = `approve_${stage.name}`;
    }
    // Add deployment to existing workflow
    const cmds: string[] = [];
    cmds.push(...this.renderInstallCommands());
    cmds.push(...this.renderDeployCommands(stage.name));
    this.deploymentWorkflowBuilder.addBuildAction({
      actionName: `indeploy_${stage.name}`,
      dependsOn: [dependsOn],
      input: {
        Sources: ['WorkflowSource'],
        Variables: {
          CI: 'true',
        },
      },
      steps:
        cmds,
      // FIXME is there is an environment, connect it to the workflow
      // needs to react on this.options.iamRoleArns?.synth
      //environment: environment && convertToWorkflowEnvironment(environment),

      // FIXME what about the permissions?
      // permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },

      output: {},
    });
  }

}
