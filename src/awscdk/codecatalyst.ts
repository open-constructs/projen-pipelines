import { WorkflowBuilder } from '@amazon-codecatalyst/blueprint-component.workflows';
import { YamlFile, awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from './base';

import { Blueprint } from './codecatalyst/blueprint';
import { PipelineEngine } from '../engine';

/*
Needs to create:
- build.yml (creates and mutates pipeline by executing projen build)
- deploy.yaml (build + deploy to dev)
- pull-request-lint.yml (executes amannn/action-semantic-pull-request@v5.0.2)
- release-prod.yaml (deploy to prod)
- upgrade.yaml (upgrade dependencies)
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
    if (stage.manualApproval === true) {
      // Create new deployment workflow for stage
      this.createWorkflowForStage(stage);
    } else {
      // Add deployment to existing workflow
      const cmds: string[] = [];
      cmds.push(...this.renderInstallCommands());
      cmds.push(...this.renderDeployCommands(stage.name));
      this.deploymentWorkflowBuilder.addBuildAction({
        actionName: `deploy_${stage.name}`,
        dependsOn: this.deploymentStages.length > 0 ? ['PublishAssetsToAWS', `deploy_${this.deploymentStages.at(-1)!}`] : ['PublishAssetsToAWS'],
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

  createWorkflowForStage(stage: DeploymentStage) {
    console.log(stage);
    const deploymentStageWorkflowBuilder = new WorkflowBuilder(this.bp);

    deploymentStageWorkflowBuilder.setName(`release-${stage.name}`);

    // Add deployment to new workflow
    const cmds: string[] = [];
    cmds.push(...this.renderInstallCommands());
    cmds.push(...this.renderInstallPackageCommands(`${this.options.pkgNamespace}/${this.app.name}@\${{github.event.inputs.version}}`));
    cmds.push(`mv ./node_modules/${this.options.pkgNamespace}/${this.app.name} ${this.app.cdkConfig.cdkout}`);
    cmds.push(...this.renderDeployCommands(stage.name));
    deploymentStageWorkflowBuilder.addBuildAction({
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
    deploymentStageWorkflowBuilder.addBuildAction({
      actionName: `deploy_${stage.name}`,
      // needs: this.deploymentStages.length > 0 ? ['assetUpload', `deploy_${this.deploymentStages.at(-1)!}`] : ['assetUpload'],
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

    const yml = new YamlFile(this, `.codecatalyst/workflows/release-${stage.name}.yaml`, {
      obj: deploymentStageWorkflowBuilder.getDefinition(),

    });
    yml.synthesize();
  }

}
