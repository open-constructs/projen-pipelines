import { awscdk } from 'projen';
import { GitHub, GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';
import { CdkDiffType, CDKPipeline, CDKPipelineOptions, DeploymentStage, IndependentStage, NamedStageOptions } from './base';
import { GithubResourceCountPRWorkflow } from './github-resource-count-pr-workflow';
import { PipelineEngine } from '../engine';
import { mergeJobPermissions } from '../engines';
import { AwsAssumeRoleStep, PipelineStep, ProjenScriptStep, SimpleCommandStep } from '../steps';
import { DownloadArtifactStep, UploadArtifactStep } from '../steps/artifact-steps';
import { CdkOutputsSummaryStep } from '../steps/github-summary.step';
import { GithubPackagesLoginStep } from '../steps/registries';

const DEFAULT_RUNNER_TAGS = ['ubuntu-latest'];
const WORKFLOW_DIR = '.github/workflows';


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
  /** The GitHub component used for adding workflows. */
  private readonly gh: GitHub;

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

    // For subprojects, use the root project's GitHub component since
    // GitHub Actions only discovers workflows in the repo-root .github/workflows/
    const gh = this.workingDirectory ? GitHub.of(this.app.root) : this.app.github;
    if (!gh) {
      throw new Error('GitHub component not found. For subprojects, ensure the root project has a GitHub component.');
    }
    this.gh = gh;

    // Initialize the deployment workflow on GitHub.
    this.deploymentWorkflow = this.gh.addWorkflow(`${this.namePrefix}deploy`);
    this.deploymentWorkflow.on({
      push: {
        branches: [this.branchName],
        ...this.baseOptions.paths && { paths: this.pathsWithWorkflowFile('deploy') },
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
        this.createAssetUpload(stage.name, stage.githubEnvironment);
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

    // Create a separate PR workflow for resource counting if enabled
    if (this.baseOptions.enableResourceCounting !== false) {
      new GithubResourceCountPRWorkflow(app, {
        branchName: this.branchName,
        runnerTags: options.runnerTags,
        nodeVersion: this.minNodeVersion,
        resourceCountWarningThreshold: options.resourceCountWarningThreshold,
        resourceCountLimit: options.resourceCountLimit,
        paths: this.baseOptions.paths,
        workingDirectory: this.workingDirectory,
        cdkoutDir: this.app.cdkConfig.cdkout,
        pipelineName: options.pipelineName ?? (app.parent ? app.name : undefined),
        preInstallCommands: options.preInstallCommands,
        preInstallSteps: options.preInstallSteps,
        preSynthCommands: options.preSynthCommands,
        preSynthSteps: options.preSynthSteps,
        postSynthCommands: options.postSynthCommands,
        postSynthSteps: options.postSynthSteps,
        preBuildCommand: options.preBuildCommand,
        synthRoleArn: options.iamRoleArns?.synth,
        synthJumpRoleArn: options.iamRoleArns?.jump?.synth,
      });
    }
  }

  /** the type of engine this implementation of CDKPipeline is for */
  public engineType(): PipelineEngine {
    return PipelineEngine.GITHUB;
  }

  /**
   * Returns the paths filter array with the workflow file itself included.
   * This ensures that changes to the workflow file also trigger the pipeline.
   * @param workflowName - The name of the workflow (used to derive the file path).
   */
  private pathsWithWorkflowFile(workflowName: string): string[] {
    const workflowFilePath = `${WORKFLOW_DIR}/${this.namePrefix}${workflowName}.yml`;
    return [...this.baseOptions.paths!, workflowFilePath];
  }

  /**
   * Returns the artifact path prefixed with workingDirectory if set.
   * Artifact upload/download paths resolve against GITHUB_WORKSPACE,
   * not the job working-directory, so they must be prefixed explicitly.
   */
  private artifactPath(relativePath: string): string {
    if (this.workingDirectory) {
      return `${this.workingDirectory}/${relativePath}`;
    }
    return relativePath;
  }

  /**
   * Returns job defaults for working directory when set.
   */
  private jobDefaults(): object | undefined {
    if (this.workingDirectory) {
      return {
        run: {
          'working-directory': this.workingDirectory,
        },
      };
    }
    return undefined;
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
    const workflow = this.gh.addWorkflow(`${this.namePrefix}deploy-feature`);

    workflow.on({
      pullRequestTarget: {
        types: ['synchronize', 'labeled', 'opened', 'reopened'],
        ...this.baseOptions.paths && { paths: this.pathsWithWorkflowFile('deploy-feature') },
      },
      workflowDispatch: {},
    });

    const steps = [
      this.provideInstallStep(),
      this.provideSynthStep(),
      this.provideDeployStep({ name: 'feature', env: this.baseOptions.featureStages!.env }),
      new CdkOutputsSummaryStep(this.project, { stageName: 'feature' }),
      new UploadArtifactStep(this.project, {
        name: `${this.namePrefix}cdk-outputs-feature`,
        path: this.artifactPath(`${this.namePrefix}cdk-outputs-feature.json`),
      }),
    ].map(s => s.toGithub());

    workflow.addJob('synth-and-deploy', {
      name: 'Synth and deploy CDK application to feature stage',
      if: "contains(join(github.event.pull_request.labels.*.name, ','), 'feature-deployment')",
      needs: [],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      ...this.jobDefaults() && { defaults: this.jobDefaults() },
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      concurrency: {
        'group': `${this.namePrefix}deploy-feature-\${{ github.event.pull_request.number }}`,
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
          uses: 'actions/checkout@v6',
        },
        ...steps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a workflow for destroying feature branches when PRs are closed or unlabeled.
   */
  private createFeatureDestroyWorkflow(): void {
    const workflow = this.gh.addWorkflow(`${this.namePrefix}destroy-feature`);

    workflow.on({
      pullRequestTarget: {
        types: ['closed', 'unlabeled'],
        ...this.baseOptions.paths && { paths: this.pathsWithWorkflowFile('destroy-feature') },
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
      ...this.jobDefaults() && { defaults: this.jobDefaults() },
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        idToken: JobPermission.WRITE,
      }, ...(steps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      concurrency: {
        'group': `${this.namePrefix}destroy-feature-\${{ github.event.pull_request.number }}`,
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
          uses: 'actions/checkout@v6',
        },
        ...steps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Creates a synthesis job for the pipeline using GitHub Actions.
   */
  private createSynth(): void {
    const enableResourceCounting = this.options.enableResourceCounting !== false;

    const steps: PipelineStep[] = [];
    steps.push(this.provideInstallStep());
    steps.push(this.provideSynthStep());

    if (enableResourceCounting) {
      steps.push(this.provideResourceCountStep());
    }

    steps.push(new UploadArtifactStep(this.project, {
      name: `${this.namePrefix}cloud-assembly`,
      path: this.artifactPath(`${this.app.cdkConfig.cdkout}/`),
    }));

    const githubSteps = steps.map(s => s.toGithub());

    this.deploymentWorkflow.addJob('synth', {
      name: 'Synth CDK application',
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      ...this.jobDefaults() && { defaults: this.jobDefaults() },
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
          uses: 'actions/checkout@v6',
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
  public createAssetUpload(stageName?: string, githubEnvironment?: string): void {
    const steps = [
      new SimpleCommandStep(this.project, ['git config --global user.name "github-actions" && git config --global user.email "github-actions@github.com"']),
      new DownloadArtifactStep(this.project, {
        name: `${this.namePrefix}cloud-assembly`,
        path: this.artifactPath(`${this.app.cdkConfig.cdkout}/`),
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
      ...this.jobDefaults() && { defaults: this.jobDefaults() },
      ...(this.options.useGithubEnvironmentsForAssetUpload && stageName && { environment: githubEnvironment ?? stageName }),
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
          uses: 'actions/checkout@v6',
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
        new CdkOutputsSummaryStep(this.project, { stageName: stage.name }),
        new UploadArtifactStep(this.project, {
          name: `${this.namePrefix}cdk-outputs-${stage.name}`,
          path: this.artifactPath(`cdk-outputs-${stage.name}.json`),
        }),
      ].map(s => s.toGithub());

      // Create new workflow for deployment
      const stageWorkflow = this.gh.addWorkflow(`${this.namePrefix}release-${stage.name}`);
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
        ...this.jobDefaults() && { defaults: this.jobDefaults() },
        ...this.options.useGithubEnvironments && {
          environment: stage.githubEnvironment ?? stage.name,
        },
        concurrency: {
          'group': `${this.namePrefix}deploy-${stage.name}`,
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
            uses: 'actions/checkout@v6',
          },
          ...steps.flatMap(s => s.steps),
        ],
      });

    } else {
      this.createDeployJob(this.deploymentWorkflow, [...(this.deploymentStages.length > 0 ? [`deploy-${this.deploymentStages.at(-1)!}`] : [])], stage, useGithubEnvironmentsForAssetUpload);
      this.deploymentStages.push(stage.name);
    }
  }

  private createDeployJob(
    workflow: GithubWorkflow,
    jobDependencies: string[],
    stage: NamedStageOptions,
    useGithubEnvironmentsForAssetUpload?: boolean,
  ) {
    const steps = [
      new DownloadArtifactStep(this.project, {
        name: `${this.namePrefix}cloud-assembly`,
        path: this.artifactPath(`${this.app.cdkConfig.cdkout}/`),
      }),
      this.provideInstallStep(),
      this.provideDeployStep(stage),
      new CdkOutputsSummaryStep(this.project, { stageName: stage.name }),
      new UploadArtifactStep(this.project, {
        name: `${this.namePrefix}cdk-outputs-${stage.name}`,
        path: this.artifactPath(`cdk-outputs-${stage.name}.json`),
      }),
    ].map(s => s.toGithub());

    // Add deployment to CI/CD workflow
    workflow.addJob(`deploy-${stage.name}`, {
      name: `Deploy stage ${stage.name} to AWS`,
      ...this.options.useGithubEnvironments && {
        environment: stage.githubEnvironment ?? stage.name,
      },
      ...this.jobDefaults() && { defaults: this.jobDefaults() },
      concurrency: {
        'group': `${this.namePrefix}deploy-${stage.name}`,
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
          uses: 'actions/checkout@v6',
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
        new CdkOutputsSummaryStep(this.project, { stageName: stage.name }),
        new UploadArtifactStep(this.project, {
          name: `${this.namePrefix}cdk-outputs-${stage.name}`,
          path: this.artifactPath(`cdk-outputs-${stage.name}.json`),
        }),
      ].map(s => s.toGithub());

      // Create new workflow for deployment
      const stageWorkflow = this.gh.addWorkflow(`${this.namePrefix}deploy-${stage.name}`);
      stageWorkflow.on({
        workflowDispatch: {},
      });
      stageWorkflow.addJob('deploy', {
        name: `Release stage ${stage.name} to AWS`,
        needs: steps.flatMap(s => s.needs),
        runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
        ...this.jobDefaults() && { defaults: this.jobDefaults() },
        concurrency: {
          'group': `${this.namePrefix}deploy-${stage.name}`,
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
            uses: 'actions/checkout@v6',
          },
          ...steps.flatMap(s => s.steps),
        ],
      });

    }
  }

}
