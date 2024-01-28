import { WorkflowBuilder } from '@amazon-codecatalyst/blueprint-component.workflows';
import { YamlFile, awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from './base';

import { Blueprint } from './codecatalyst/blueprint';


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
  private bp: Blueprint = new Blueprint({ outdir: '.codecatalyst/workflows' });

  constructor(app: awscdk.AwsCdkTypeScriptApp, private options: CodeCatalystCDKPipelineOptions) {
    super(app, options);

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

  private createSynth(): void {

    const cmds: string[] = [];
    cmds.push(...this.renderSynthCommands());
    this.deploymentWorkflowBuilder.addBuildAction({
      actionName: 'Synth CDK application',
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
    cmds.push(...this.getAssetUploadCommands(this.needsVersionedArtifacts));
    this.deploymentWorkflowBuilder.addBuildAction({
      actionName: 'Publish assets to AWS',
      dependsOn: ['Synth CDK application'],
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
        actionName: `deploy-${stage.name}`,
        // needs: this.deploymentStages.length > 0 ? ['assetUpload', `deploy-${this.deploymentStages.at(-1)!}`] : ['assetUpload'],
        dependsOn: ['Synth CDK application'],
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

    /*
    if (stage.manualApproval === true) {
      // Create new workflow for deployment
      const stageWorkflow = this.app.github!.addWorkflow(`release-${stage.name}-codecatalyst`);
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
        runsOn: ['ubuntu-latest'],
        env: {
          CI: 'true',
        },
        permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
        steps: [{
          name: 'Checkout',
          uses: 'actions/checkout@v3',
        }, {
          name: 'AWS Credentials',
          uses: 'aws-actions/configure-aws-credentials@master',
          with: {
            'role-to-assume': this.options.iamRoleArns?.deployment?.[stage.name] ?? this.options.iamRoleArns?.default,
            'role-session-name': 'GitHubAction',
            'aws-region': stage.env.region,
          },
        },
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
        }))],
      });

    } else {
      // Add deployment to CI/CD workflow
      this.deploymentWorkflow.addJob(`deploy-${stage.name}`, {
        name: `Deploy stage ${stage.name} to AWS`,
        needs: this.deploymentStages.length > 0 ? ['assetUpload', `deploy-${this.deploymentStages.at(-1)!}`] : ['assetUpload'],
        runsOn: ['ubuntu-latest'],
        env: {
          CI: 'true',
        },
        permissions: { idToken: JobPermission.WRITE, contents: JobPermission.READ },
        steps: [{
          name: 'Checkout',
          uses: 'actions/checkout@v3',
        }, {
          name: 'AWS Credentials',
          uses: 'aws-actions/configure-aws-credentials@master',
          with: {
            'role-to-assume': this.options.iamRoleArns?.deployment?.[stage.name] ?? this.options.iamRoleArns?.default,
            'role-session-name': 'GitHubAction',
            'aws-region': stage.env.region,
          },
        }, {
          uses: 'actions/download-artifact@v3',
          with: {
            name: 'cloud-assembly',
            path: `${this.app.cdkConfig.cdkout}/`,
          },
        },
        ...this.renderInstallCommands().map(cmd => ({
          run: cmd,
        })),
        ...this.renderDeployCommands(stage.name).map(cmd => ({
          run: cmd,
        }))],
      });
      this.deploymentStages.push(stage.name);
    }*/
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
      actionName: `deploy-${stage.name}`,
      // needs: this.deploymentStages.length > 0 ? ['assetUpload', `deploy-${this.deploymentStages.at(-1)!}`] : ['assetUpload'],
      dependsOn: ['Synth CDK application'],
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
