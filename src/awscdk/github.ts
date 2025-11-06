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

    this.createAssetUpload();

    for (const stage of options.stages) {
      this.createDeployment(stage);
    }
    for (const stage of (options.independentStages ?? [])) {
      this.createIndependentDeployment(stage);
    }

    // Create feature workflows if feature stages are configured
    if (options.featureStages) {
      this.createFeatureWorkflows();
    }

    // Create PR workflow for resource counting if enabled
    if (this.baseOptions.enableResourceCounting !== false) {
      this.createResourceCountPRWorkflow();
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

    // Add resource counting step if enabled
    const resourceCountStep = this.provideResourceCountStep(true);
    if (resourceCountStep) {
      steps.push(resourceCountStep);

      // Upload resource count results as artifact
      steps.push(new UploadArtifactStep(this.project, {
        name: 'resource-count-results',
        path: 'resource-count-results.json',
      }));
    }

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
  public createAssetUpload(): void {

    const steps = [
      new SimpleCommandStep(this.project, ['git config --global user.name "github-actions" && git config --global user.email "github-actions@github.com"']),
      new DownloadArtifactStep(this.project, {
        name: 'cloud-assembly',
        path: `${this.app.cdkConfig.cdkout}/`,
      }),
      this.provideInstallStep(),
      this.provideAssetUploadStep(),
    ];

    if (this.needsVersionedArtifacts) {
      steps.push(this.provideAssemblyUploadStep());
    }

    const ghSteps = steps.map(s => s.toGithub());

    this.deploymentWorkflow.addJob('assetUpload', {
      name: 'Publish assets to AWS',
      needs: ['synth', ...ghSteps.flatMap(s => s.needs)],
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
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
  public createDeployment(stage: DeploymentStage): void {

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
      this.createDeployJob(this.deploymentWorkflow, [...(this.deploymentStages.length > 0 ? [`deploy-${this.deploymentStages.at(-1)!}`] : [])], stage);
      this.deploymentStages.push(stage.name);
    }
  }

  private createDeployJob(workflow: GithubWorkflow, jobDependencies: string[], stage: NamedStageOptions) {
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
      needs: ['assetUpload', ...steps.flatMap(s => s.needs), ...jobDependencies],
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

  /**
   * Creates a workflow for commenting resource counts on pull requests.
   */
  private createResourceCountPRWorkflow(): void {
    const workflow = this.app.github!.addWorkflow('resource-count-pr');

    workflow.on({
      pullRequest: {
        types: ['opened', 'synchronize', 'reopened'],
      },
    });

    const steps: PipelineStep[] = [];
    steps.push(this.provideInstallStep());
    steps.push(this.provideSynthStep());

    const resourceCountStep = this.provideResourceCountStep(true);
    if (resourceCountStep) {
      steps.push(resourceCountStep);
    }

    const githubSteps = steps.map(s => s.toGithub());

    workflow.addJob('resource-count', {
      name: 'Count CloudFormation Resources',
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        pullRequests: JobPermission.WRITE,
      }, ...(githubSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      env: {
        CI: 'true',
        ...githubSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
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
        ...githubSteps.flatMap(s => s.steps),
        {
          name: 'Comment on PR',
          uses: 'actions/github-script@v8',
          with: {
            script: this.generatePRCommentScript(),
          },
        },
      ],
    });
  }

  /**
   * Generates the script for commenting resource counts on PRs.
   */
  private generatePRCommentScript(): string {
    const warningThreshold = this.baseOptions.resourceCountWarningThreshold ?? 450;
    return `
const fs = require('fs');
const resultsFile = 'resource-count-results.json';

if (!fs.existsSync(resultsFile)) {
  console.log('No results file found');
  return;
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const stacks = results.stacks || [];
const stacksWithWarnings = stacks.filter(s => s.resourceCount >= ${warningThreshold});

// Create comment body
let body = '## 📊 CloudFormation Resource Count\\n\\n';
body += '### Summary\\n';
body += \`- **Total stacks:** \${stacks.length}\\n\`;
body += \`- **Total resources:** \${results.totalResources}\\n\`;
body += \`- **Max resources in single stack:** \${results.maxResourcesInStack}\\n\`;
body += \`- **Warning threshold:** ${warningThreshold} resources\\n\`;
body += \`- **CloudFormation limit:** 500 resources per stack\\n\\n\`;

if (stacksWithWarnings.length > 0) {
  body += '### ⚠️ Stacks Approaching Limit\\n\\n';
  body += \`\${stacksWithWarnings.length} stack(s) have crossed the warning threshold:\\n\\n\`;

  for (const stack of stacksWithWarnings) {
    const percentage = Math.round((stack.resourceCount / 500) * 100);
    body += \`- **\${stack.stackName}**: \${stack.resourceCount} resources (\${percentage}% of limit)\\n\`;
  }

  body += '\\n**Recommendations:**\\n';
  body += '- Consider breaking large stacks into smaller, focused stacks\\n';
  body += '- Use nested stacks for reusable components\\n';
  body += '- Review resource usage and remove unnecessary resources\\n\\n';
}

body += '### Stack Details\\n\\n';
body += '| Stack | Resources | % of Limit | Status |\\n';
body += '|-------|-----------|------------|--------|\\n';

const sortedStacks = stacks.sort((a, b) => b.resourceCount - a.resourceCount);
for (const stack of sortedStacks) {
  const percentage = Math.round((stack.resourceCount / 500) * 100);
  const status = stack.resourceCount >= ${warningThreshold} ? '⚠️ Warning' : '✅ OK';
  body += \`| \${stack.stackName} | \${stack.resourceCount} | \${percentage}% | \${status} |\\n\`;
}

// Find existing comment
const comments = await github.rest.issues.listComments({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: context.issue.number,
});

const botComment = comments.data.find(comment =>
  comment.user.type === 'Bot' &&
  comment.body.includes('📊 CloudFormation Resource Count')
);

if (botComment) {
  // Update existing comment
  await github.rest.issues.updateComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: botComment.id,
    body: body,
  });
  console.log('Updated existing PR comment');
} else {
  // Create new comment
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: body,
  });
  console.log('Created new PR comment');
}
`;
  }
}
