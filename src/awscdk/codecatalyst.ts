import { awscdk } from 'projen';
//import { GithubWorkflow } from 'projen/lib/github';
//import { JobPermission, JobStep } from 'projen/lib/github/workflows-model';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from './base';
import { Workflow, WorkflowBuilder } from '@amazon-codecatalyst/blueprint-component.workflows';
import { SourceRepository } from '@amazon-codecatalyst/blueprint-component.source-repositories';

//import { Blueprint as ParentBlueprint } from '@amazon-codecatalyst/blueprints.blueprint';
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

  private deploymentWorkflow: Workflow;
  private deploymentStages: string[] = [];
  private bp: Blueprint = new Blueprint({outdir: '../.codecatalyst/workflows'});

  constructor(app: awscdk.AwsCdkTypeScriptApp, private options: CodeCatalystCDKPipelineOptions) {
    super(app, options);

    const workflowBuilder = new WorkflowBuilder(this.bp);
    workflowBuilder.setName('deploy');
    workflowBuilder.addBranchTrigger(['main']);

    /**
     * We can use a build action to execute some arbitrary steps
     */
    workflowBuilder.addBuildAction({
      actionName: 'do-something-in-an-action',
      input: {
        Sources: ['WorkflowSource'],
      },
      steps: [
        'ls -la',
        'echo "Hello world from a workflow!"',
        'echo "If theres an account connection, I can execute in the context of that account"',
        'aws sts get-caller-identity',
      ],
      // is there is an environment, connect it to the workflow
      //environment: environment && convertToWorkflowEnvironment(environment),
      output: {},
    });

    // write a workflow to my repository
    const repository = new SourceRepository(this.bp, { title: 'test' });
    this.deploymentWorkflow = new Workflow(this.bp, repository, workflowBuilder.getDefinition());
    
    this.needsVersionedArtifacts = this.options.stages.find(s => s.manualApproval === true) !== undefined;

    this.createSynth();

    this.createAssetUpload();

    for (const stage of options.stages) {
      this.createDeployment(stage);
    }
  }

  private createSynth(): void {
    /*
    const steps: JobStep[] = [{
      name: 'Checkout',
      uses: 'actions/checkout@v3',
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

    steps.push(...this.renderSynthCommands().map(cmd => ({
      run: cmd,
    })));

    steps.push({
      uses: 'actions/upload-artifact@v3',
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
    */
  }

  public createAssetUpload(): void {
    /*
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
        uses: 'actions/checkout@v3',
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
        uses: 'actions/download-artifact@v3',
        with: {
          name: 'cloud-assembly',
          path: `${this.app.cdkConfig.cdkout}/`,
        },
      },
      ...this.getAssetUploadCommands(this.needsVersionedArtifacts).map(cmd => ({
        run: cmd,
      }))],
    });
    */
  }

  public createDeployment(stage: DeploymentStage): void {
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
}
