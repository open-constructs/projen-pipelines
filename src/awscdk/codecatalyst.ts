import { WorkflowBuilder } from '@amazon-codecatalyst/blueprint-component.workflows';
import { YamlFile, awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from './base';

import { Blueprint } from './codecatalyst/blueprint';
import { PipelineEngine } from '../engine';

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
- account target
- manual approval for stages -- DONE
- IAM role per stage, synth, asset
- independend stages (all parallel to each other) after synth&assets
- environments support
- steps per stage - preInstall, preSynth, ...

example: https://github.com/aws-community-dach/event-system-backend

test docgen: https://github.com/open-constructs/aws-cdk-library


*/

export interface CodeCatalystIamRoleConfig {
  readonly default?: string;
  readonly synth?: string;
  readonly assetPublishing?: string;
  readonly deployment?: { [stage: string]: string };
}

export interface CodeCatalystCDKPipelineOptions extends CDKPipelineOptions {
  readonly iamRoleArns: CodeCatalystIamRoleConfig;
}

export class CodeCatalystCDKPipeline extends CDKPipeline {

  public readonly needsVersionedArtifacts: boolean;

  private deploymentWorkflowBuilder: WorkflowBuilder;
  private deploymentStages: string[] = [];

  private readonly bp: Blueprint;

  constructor(app: awscdk.AwsCdkTypeScriptApp, private options: CodeCatalystCDKPipelineOptions) {
    super(app, options);
    // see https://github.com/aws/codecatalyst-blueprints/issues/477
    process.env.CONTEXT_ENVIRONMENTID='prod';

    this.bp = new Blueprint({ outdir: '.codecatalyst/workflows' });
    this.deploymentWorkflowBuilder = new WorkflowBuilder(this.bp);

    this.deploymentWorkflowBuilder.setName('deploy');
    this.deploymentWorkflowBuilder.addBranchTrigger(['main']);

    this.needsVersionedArtifacts = this.options.stages.find(s => s.manualApproval === true) !== undefined;

    this.createSynth();
    this.createAssetUpload();

    for (const stage of options.stages) {
      this.createDeployment(stage);
    }

    const yml = new YamlFile(this, '.codecatalyst/workflows/deploy.yaml', {
      obj: this.deploymentWorkflowBuilder.getDefinition(),

    });
    yml.synthesize();
  }

  /** the type of engine this implementation of CDKPipeline is for */
  public engineType(): PipelineEngine {
    return PipelineEngine.CODE_CATALYST;
  }

  private createSynth(): void {

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
        cmds,
      // FIXME is there is an environment, connect it to the workflow
      // needs to react on this.options.iamRoleArns?.synth
      //environment: environment && convertToWorkflowEnvironment(environment),

      // FIXME what about the permissions?
      // permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },

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
        dependsOn: [`deploy_${this.deploymentStages.at(-1)!}`],
        Configuration: {
          ApprovalsRequired: 1,
        },
      });
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
    });

    this.deploymentStages.push(stage.name);
  }

}
