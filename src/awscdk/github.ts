import { awscdk } from 'projen';
import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';
import { CdkDiffType, CDKPipeline, CDKPipelineOptions, DeploymentStage, IndependentStage, NamedStageOptions } from './base';
import { PipelineEngine } from '../engine';
import { mergeJobPermissions } from '../engines';
import { AwsAssumeRoleStep, PipelineStep, ProjenScriptStep, SimpleCommandStep } from '../steps';
import { DownloadArtifactStep, UploadArtifactStep } from '../steps/artifact-steps';
import { GithubPackagesLoginStep } from '../steps/registries';

const DEFAULT_RUNNER_TAGS = ['ubuntu-latest'];


/**
 * Extension of the base CDKPipeline options including specific configurations for GitHub.
 */
export interface GithubCDKPipelineOptions extends CDKPipelineOptions {

  /**
   * runner tags to use to select runners
   *
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

  /** use GitHub Packages to store vesioned artifacts of cloud assembly; also needed for manual approvals */
  readonly useGithubPackagesForAssembly?: boolean;

  /**
   * whether to use GitHub environments for deployment stages
   *
   * INFO: When using environments consider protection rules instead of using the manual option of projen-pipelines for stages
   *
   * @default false
   */
  readonly useGithubEnvironments?: boolean;

  /**
   * whether to use GitHub environments for asset upload step
   * Create separate, parallel jobs for asset upload since GitHub Environments
   * require unique environment names per job
   * 
   * WARNING: this parameter requires rebuilding the container assets for each stage and they will not 
   * be the "same binary", so there is a (small) chance that it could produce different binaries per stage
   * 
   * @default false
   */
  readonly useGithubEnvironmentsForAssetUpload?: boolean;
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
  protected minNodeVersion: string | undefined;

  /**
   * Constructs a new GithubCDKPipeline instance.
   * @param app - The CDK app associated with this pipeline.
   * @param options - Configuration options for the pipeline.
   */
  constructor(app: awscdk.AwsCdkTypeScriptApp, private options: GithubCDKPipelineOptions) {
    super(app, {
      ...options,
      ...options.useGithubPackagesForAssembly && {
        preInstallSteps: [
          new GithubPackagesLoginStep(app, { write: false }),
          ...options.preInstallSteps ?? [],
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
    this.needsVersionedArtifacts = options.stages.find(s => s.manualApproval === true) !== undefined;
    if (this.needsVersionedArtifacts && !options.pkgNamespace) {
      throw new Error('pkgNamespace is required when using versioned artifacts (e.g. manual approvals)');
    }
    this.useGithubPackages = this.needsVersionedArtifacts && (options.useGithubPackagesForAssembly ?? false);
    this.minNodeVersion = app.minNodeVersion;

    if (this.useGithubPackages) {
      app.npmrc.addRegistry('https://npm.pkg.github.com', this.baseOptions.pkgNamespace);
      app.npmrc.addConfig('//npm.pkg.github.com/:_authToken', '${GITHUB_TOKEN}');
      app.npmrc.addConfig('//npm.pkg.github.com/:always-auth', 'true');
    }

    // Create jobs for synthesizing, asset uploading, and deployment.
    this.createSynth();

    if (options.useGithubEnvironmentsForAssetUpload) {
      for (const stage of options.stages) {
        this.createAssetUpload(stage.name);
      }
    } else {
      this.createAssetUpload();
    }

    for (const stage of options.stages) {
      this.createDeployment(stage, options.useGithubEnvironmentsForAssetUpload ?? false);
    }
    for (const stage of (options.independentStages ?? [])) {
      this.createIndependentDeployment(stage);
    }

    // Create feature workflows if feature stages are configured
    if (options.featureStages) {
      this.createFeatureWorkflows();
    }
  }

  /** the type of engine this implementation of CDKPipeline is for */
  public engineType(): PipelineEngine {
    return PipelineEngine.GITHUB;
  }

  /**
   * Creates feature branch workflows for deploying and destroying feature environments.
   */
  protected createFeatureWorkflows(): void {
    this.createFeatureDeployWorkflow();
    this.createFeatureDestroyWorkflow();
  }

  /**
   * Creates a workflow for deploying feature branches when PRs are labeled with 'feature-deployment'.
   */
  private createFeatureDeployWorkflow(): void {
    const workflow = this.app.github!.addWorkflow('deploy-feature');

    workflow.on({
      pullRequestTarget: {
        types: ['synchronize', 'labeled', 'opened', 'reopened'],
      },
      workflowDispatch: {},
    });

    const steps = [
      this.provideInstallStep(),
      this.provideSynthStep(),
      this.provideDeployStep({ name: 'feature', env: this.baseOptions.featureStages!.env }),
      new UploadArtifactStep(this.project, {
        name: 'cdk-outputs-feature',
        path: 'cdk-outputs-feature.json',
      }),
    ].map(s => s.toGithub());

    workflow.addJob('synth-and-deploy', {
      name: 'Synth and deploy CDK application to feature stage',
      if: "contains(join(github.event.pull_request.labels.*.name, ','), 'feature-deployment')",
      needs: [],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      concurrency: {
        'group': 'deploy-feature-${{ github.event.pull_request.number }}',
        'cancel-in-progress': false,
      },
      env: {
        CI: 'true',
        BRANCH: '${{ github.head_ref }}',
        ...steps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      tools: {
        node: {
          version: this.minNodeVersion ?? '20',
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
        },
        ...steps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a workflow for destroying feature branches when PRs are closed or unlabeled.
   */
  private createFeatureDestroyWorkflow(): void {
    const workflow = this.app.github!.addWorkflow('destroy-feature');

    workflow.on({
      pullRequestTarget: {
        types: ['closed', 'unlabeled'],
      },
      workflowDispatch: {},
    });

    const steps = [
      this.provideInstallStep(),
      this.provideSynthStep(),
      new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns?.deployment?.feature ?? this.baseOptions.iamRoleArns?.default!,
        region: this.baseOptions.featureStages!.env.region,
        jumpRoleArn: this.baseOptions.iamRoleArns.jump?.feature,
      }),
      new ProjenScriptStep(this.project, 'destroy:feature'),
    ].map(s => s.toGithub());

    workflow.addJob('destroy-feature', {
      name: 'Destroy CDK feature stage',
      if: "github.event.action == 'closed' || (github.event.action == 'unlabeled' && github.event.label.name == 'feature-deployment')",
      needs: [],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      concurrency: {
        'group': 'destroy-feature-${{ github.event.pull_request.number }}',
        'cancel-in-progress': false,
      },
      env: {
        CI: 'true',
        BRANCH: '${{ github.head_ref }}',
        ...steps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      tools: {
        node: {
          version: this.minNodeVersion ?? '20',
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
        },
        ...steps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a synthesis job for the pipeline using GitHub Actions.
   */
  private createSynth(): void {
    const steps: PipelineStep[] = [];
    steps.push(this.provideInstallStep());
    steps.push(this.provideSynthStep());

    steps.push(new UploadArtifactStep(this.project, {
      name: 'cloud-assembly',
      path: `${this.app.cdkConfig.cdkout}/`,
    }));

    const githubSteps = steps.map(s => s.toGithub());

    this.deploymentWorkflow.addJob('synth', {
      name: 'Synth CDK application',
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      env: {
        CI: 'true',
        ...githubSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      needs: [...githubSteps.flatMap(s => s.needs)],
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
      }, ...(githubSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      tools: {
        node: {
          version: this.minNodeVersion ?? '20',
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
          with: {
            'fetch-depth': 0,
          },
        },
        ...githubSteps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a job to upload assets to AWS as part of the pipeline.
   */
  public createAssetUpload(stageName?: string): void {
    const steps = [
      new SimpleCommandStep(this.project, ['git config --global user.name "github-actions" && git config --global user.email "github-actions@github.com"']),
      new DownloadArtifactStep(this.project, {
        name: 'cloud-assembly',
        path: `${this.app.cdkConfig.cdkout}/`,
      }),
      this.provideInstallStep(),
      this.provideAssetUploadStep(stageName),
    ];

    if (this.needsVersionedArtifacts) {
      steps.push(this.provideAssemblyUploadStep());
    }

    const ghSteps = steps.map(s => s.toGithub());

    this.deploymentWorkflow.addJob(`assetUpload${stageName ? `-${stageName}` : ''}`, {
      name: `Publish assets to AWS${stageName ? ` for stage ${stageName}` : ''}`,
      needs: ['synth', ...ghSteps.flatMap(s => s.needs)],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      ...(this.options.useGithubEnvironmentsForAssetUpload && stageName && { environment: stageName }),
      env: {
        CI: 'true',
        ...ghSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      permissions: mergeJobPermissions({
        idToken: JobPermission.WRITE,
        contents: this.needsVersionedArtifacts ? JobPermission.WRITE : JobPermission.READ,
        ...this.useGithubPackages && {
          packages: JobPermission.WRITE,
        },
      }, ...(ghSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      tools: {
        node: {
          version: this.minNodeVersion ?? '20',
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
          with: {
            'fetch-depth': 0,
          },
        },
        ...ghSteps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a job to deploy the CDK application to AWS.
   * @param stage - The deployment stage to create.
   */
  public createDeployment(stage: DeploymentStage, useGithubEnvironmentsForAssetUpload?: boolean): void {
    if (stage.manualApproval === true) {
      const steps = [
        this.provideInstallStep(),
        new SimpleCommandStep(this.project, this.renderInstallPackageCommands(`${this.baseOptions.pkgNamespace}/${this.app.name}@\${{github.event.inputs.version}}`)),
        new SimpleCommandStep(this.project, [`mv ./node_modules/${this.baseOptions.pkgNamespace}/${this.app.name} ${this.app.cdkConfig.cdkout}`]),
        this.provideDeployStep(stage),
        new UploadArtifactStep(this.project, {
          name: `cdk-outputs-${stage.name}`,
          path: `cdk-outputs-${stage.name}.json`,
        }),
      ].map(s => s.toGithub());

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
        needs: steps.flatMap(s => s.needs),
        runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
        ...this.options.useGithubEnvironments && {
          environment: stage.name,
        },
        concurrency: {
          'group': `deploy-${stage.name}`,
          'cancel-in-progress': false,
        },
        env: {
          CI: 'true',
          ...steps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        },
        permissions: mergeJobPermissions({
          contents: JobPermission.READ,
        }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
        tools: {
          node: {
            version: this.minNodeVersion ?? '20',
          },
        },
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v5',
          },
          ...steps.flatMap(s => s.steps),
        ],
      });

    } else {
      this.createDeployJob(this.deploymentWorkflow, [...(this.deploymentStages.length > 0 ? [`deploy-${this.deploymentStages.at(-1)!}`] : [])], stage, useGithubEnvironmentsForAssetUpload);
      this.deploymentStages.push(stage.name);
    }
  }

  private createDeployJob(workflow: GithubWorkflow, jobDependencies: string[], stage: NamedStageOptions, useGithubEnvironmentsForAssetUpload?: boolean) {
    const steps = [
      new DownloadArtifactStep(this.project, {
        name: 'cloud-assembly',
        path: `${this.app.cdkConfig.cdkout}/`,
      }),
      this.provideInstallStep(),
      this.provideDeployStep(stage),
      new UploadArtifactStep(this.project, {
        name: `cdk-outputs-${stage.name}`,
        path: `cdk-outputs-${stage.name}.json`,
      }),
    ].map(s => s.toGithub());

    // Add deployment to CI/CD workflow
    workflow.addJob(`deploy-${stage.name}`, {
      name: `Deploy stage ${stage.name} to AWS`,
      ...this.options.useGithubEnvironments && {
        environment: stage.name,
      },
      concurrency: {
        'group': `deploy-${stage.name}`,
        'cancel-in-progress': false,
      },
      needs: [`assetUpload${useGithubEnvironmentsForAssetUpload ? `-${stage.name}` : ''}`, ...steps.flatMap(s => s.needs), ...jobDependencies],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      env: {
        CI: 'true',
        ...steps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
      }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      tools: {
        node: {
          version: this.minNodeVersion ?? '20',
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v5',
        },
        ...steps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a job to deploy the CDK application to AWS.
   * @param stage - The independent stage to create.
   */
  public createIndependentDeployment(stage: IndependentStage): void {
    if (stage.deployOnPush || this.options.useGithubEnvironments) {
      this.createDeployJob(this.deploymentWorkflow, [], stage);
    } else {
      const steps = [
        this.provideInstallStep(),
        this.provideSynthStep(),
        ...((stage.diffType !== CdkDiffType.NONE) ? [this.provideDiffStep(stage, stage.diffType === CdkDiffType.FAST)] : []),
        this.provideDeployStep(stage),

        new UploadArtifactStep(this.project, {
          name: `cdk-outputs-${stage.name}`,
          path: `cdk-outputs-${stage.name}.json`,
        }),
      ].map(s => s.toGithub());

      // Create new workflow for deployment
      const stageWorkflow = this.app.github!.addWorkflow(`deploy-${stage.name}`);
      stageWorkflow.on({
        workflowDispatch: {},
      });
      stageWorkflow.addJob('deploy', {
        name: `Release stage ${stage.name} to AWS`,
        needs: steps.flatMap(s => s.needs),
        runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
        concurrency: {
          'group': `deploy-${stage.name}`,
          'cancel-in-progress': false,
        },
        env: {
          CI: 'true',
          ...steps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        },
        permissions: mergeJobPermissions({
          contents: JobPermission.READ,
        }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
        tools: {
          node: {
            version: this.minNodeVersion ?? '20',
          },
        },
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v5',
          },
          ...steps.flatMap(s => s.steps),
        ],
      });

    }
  }
}
