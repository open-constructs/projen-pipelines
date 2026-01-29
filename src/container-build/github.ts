import { GitHubProject, GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';
import { mergeJobPermissions } from '../engines';
import {
  AwsInspectorSbomStep,
  DockerBuildStep,
  DockerHubLoginStep,
  DockerPushStep,
  DockerTagStep,
  EcrLoginStep,
  HarborLoginStep,
  PipelineStep,
  TrivyScanStep,
} from '../steps';
import { ContainerBuildPipeline, ContainerBuildPipelineOptions, ContainerBuildStage, RegistryConfig } from './base';
import { PipelineEngine } from '../engine';

const DEFAULT_RUNNER_TAGS = ['ubuntu-latest'];

/**
 * Options for GitHub container build pipeline
 */
export interface GithubContainerBuildPipelineOptions extends ContainerBuildPipelineOptions {
  /**
   * Runner tags to use for builds
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

  /**
   * Node.js version for the workflow
   * @default '20'
   */
  readonly nodeVersion?: string;
}

/**
 * GitHub implementation of container build pipeline
 */
export class GithubContainerBuildPipeline extends ContainerBuildPipeline {
  private readonly workflow: GithubWorkflow;
  private readonly runnerTags: string[];

  constructor(project: GitHubProject, options: GithubContainerBuildPipelineOptions) {
    super(project, options);

    this.runnerTags = options.runnerTags ?? DEFAULT_RUNNER_TAGS;

    // Create main workflow
    this.workflow = project.github!.addWorkflow('container-build');
    this.workflow.on({
      push: {
        branches: [this.branchName],
      },
      workflowDispatch: {},
    });

    // Create build job
    this.createBuildJob();

    // Create stage jobs
    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];
      const previousStage = i > 0 ? this.stages[i - 1].name : undefined;
      this.createStageJob(stage, previousStage);
    }

    // Create feature branch workflow if enabled
    if (options.enableFeatureBranches && options.featureBranchRegistry) {
      this.createFeatureBranchWorkflow();
    }
  }

  public engineType(): PipelineEngine {
    return PipelineEngine.GITHUB;
  }

  /**
   * Create the build job that builds the container image
   */
  private createBuildJob(): void {
    const steps: PipelineStep[] = [];

    // Add pre-build steps
    if (this.options.preBuildSteps) {
      steps.push(...this.options.preBuildSteps);
    }

    // Add Docker build step
    const tags = this.generateBuildTags();
    steps.push(new DockerBuildStep(this.project, {
      dockerfile: this.buildConfig.dockerfile,
      context: this.buildConfig.context,
      tags: tags,
      buildArgs: this.buildConfig.buildArgs,
      target: this.buildConfig.target,
      platforms: this.buildConfig.platforms,
      cache: this.buildConfig.cache,
    }));

    // Add post-build steps
    if (this.options.postBuildSteps) {
      steps.push(...this.options.postBuildSteps);
    }

    const githubSteps = steps.map(s => s.toGithub());

    this.workflow.addJob('build', {
      name: 'Build container image',
      runsOn: this.runnerTags,
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        packages: JobPermission.WRITE,
      }, ...(githubSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      env: {
        ...this.getBuildEnvVars(),
        ...githubSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v4',
          with: {
            'fetch-depth': 0,
          },
        },
        {
          name: 'Set up environment variables',
          run: this.generateEnvSetupScript(),
        },
        ...githubSteps.flatMap(s => s.steps),
        {
          name: 'Save image as tarball',
          run: `docker save ${tags[0]} | gzip > image.tar.gz`,
        },
        {
          name: 'Upload image artifact',
          uses: 'actions/upload-artifact@v4',
          with: {
            'name': 'container-image',
            'path': 'image.tar.gz',
            'retention-days': 1,
          },
        },
      ],
    });
  }

  /**
   * Create a job for a specific stage (push, scan, etc.)
   */
  private createStageJob(stage: ContainerBuildStage, previousStage?: string): void {
    const steps: PipelineStep[] = [];

    // Add registry login steps
    for (const registry of stage.registries) {
      steps.push(this.createRegistryLoginStep(registry));
    }

    // Add pre-build steps for this stage
    if (stage.preBuildSteps) {
      steps.push(...stage.preBuildSteps);
    }

    // Add tagging steps
    const tags = this.generateBuildTags();
    const primaryTag = tags[0];

    // Tag for each registry
    const allTags: string[] = [];
    for (const registry of stage.registries) {
      const registryTags = this.generateRegistryTags(registry, stage.name);
      allTags.push(...registryTags);

      if (registryTags.length > 0 && registryTags[0] !== primaryTag) {
        steps.push(new DockerTagStep(this.project, {
          sourceImage: primaryTag,
          targetTags: registryTags,
        }));
      }
    }

    // Add post-build steps for this stage
    if (stage.postBuildSteps) {
      steps.push(...stage.postBuildSteps);
    }

    // Add scanning steps
    if (stage.scan?.trivy) {
      steps.push(new TrivyScanStep(this.project, {
        image: primaryTag,
        severity: stage.scan.trivySeverity,
        exitCode: stage.scan.failOnVulnerabilities ? 1 : 0,
        format: 'sarif',
        outputFile: 'trivy-results.sarif',
      }));
    }

    if (stage.scan?.awsInspectorSbom && stage.scan.awsInspectorRegion) {
      steps.push(new AwsInspectorSbomStep(this.project, {
        image: primaryTag,
        region: stage.scan.awsInspectorRegion,
        roleArn: stage.scan.awsInspectorRoleArn,
        format: stage.scan.sbomFormat,
        outputFile: 'sbom.json',
      }));
    }

    // Add push steps
    steps.push(new DockerPushStep(this.project, {
      tags: allTags,
    }));

    // Add post-push steps
    if (stage.postPushSteps) {
      steps.push(...stage.postPushSteps);
    }

    const githubSteps = steps.map(s => s.toGithub());

    const jobNeeds = previousStage ? [`stage-${previousStage}`, 'build'] : ['build'];

    this.workflow.addJob(`stage-${stage.name}`, {
      name: `Deploy to ${stage.name}`,
      runsOn: this.runnerTags,
      needs: jobNeeds,
      ...stage.manualApproval && {
        environment: stage.name,
      },
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        packages: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      }, ...(githubSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      env: {
        ...this.getBuildEnvVars(),
        ...stage.env,
        ...githubSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v4',
        },
        {
          name: 'Set up environment variables',
          run: this.generateEnvSetupScript(),
        },
        {
          name: 'Download image artifact',
          uses: 'actions/download-artifact@v4',
          with: {
            name: 'container-image',
          },
        },
        {
          name: 'Load image from tarball',
          run: 'docker load < image.tar.gz',
        },
        ...githubSteps.flatMap(s => s.steps),
        ...(stage.scan?.trivy ? [{
          name: 'Upload Trivy scan results to GitHub Security',
          uses: 'github/codeql-action/upload-sarif@v3',
          if: 'always()',
          with: {
            sarif_file: 'trivy-results.sarif',
          },
        }] : []),
        ...(stage.scan?.awsInspectorSbom ? [{
          name: 'Upload SBOM artifact',
          uses: 'actions/upload-artifact@v4',
          with: {
            name: `sbom-${stage.name}`,
            path: 'sbom.json',
          },
        }] : []),
      ],
    });
  }

  /**
   * Create feature branch workflow
   */
  private createFeatureBranchWorkflow(): void {
    if (!this.options.featureBranchRegistry) return;

    const workflow = (this.project as GitHubProject).github!.addWorkflow('container-build-feature');
    workflow.on({
      pullRequest: {
        types: ['opened', 'synchronize', 'reopened'],
      },
      workflowDispatch: {},
    });

    const steps: PipelineStep[] = [];

    // Add pre-build steps
    if (this.options.preBuildSteps) {
      steps.push(...this.options.preBuildSteps);
    }

    // Add registry login
    steps.push(this.createRegistryLoginStep(this.options.featureBranchRegistry));

    // Add build step
    const tags = this.generateFeatureBranchTags();
    steps.push(new DockerBuildStep(this.project, {
      dockerfile: this.buildConfig.dockerfile,
      context: this.buildConfig.context,
      tags: tags,
      buildArgs: this.buildConfig.buildArgs,
      target: this.buildConfig.target,
      platforms: this.buildConfig.platforms,
      cache: this.buildConfig.cache,
    }));

    // Add push step
    steps.push(new DockerPushStep(this.project, {
      tags: tags,
    }));

    const githubSteps = steps.map(s => s.toGithub());

    workflow.addJob('build-and-push', {
      name: 'Build and push feature branch image',
      runsOn: this.runnerTags,
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        packages: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      }, ...(githubSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      env: {
        ...this.getBuildEnvVars(),
        ...githubSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v4',
        },
        {
          name: 'Set up environment variables',
          run: this.generateEnvSetupScript(true),
        },
        ...githubSteps.flatMap(s => s.steps),
      ],
    });
  }

  /**
   * Create registry login step based on registry type
   */
  private createRegistryLoginStep(registry: RegistryConfig): PipelineStep {
    switch (registry.type) {
      case 'ecr':
        return new EcrLoginStep(this.project, {
          region: registry.region!,
          accountId: registry.accountId,
          roleArn: registry.roleArn,
        });

      case 'dockerhub':
        return new DockerHubLoginStep(this.project, {
          username: registry.usernameSecret!,
          password: registry.passwordSecret!,
        });

      case 'harbor':
        return new HarborLoginStep(this.project, {
          registryUrl: registry.url!,
          username: registry.usernameSecret!,
          password: registry.passwordSecret!,
        });

      default:
        throw new Error(`Unknown registry type: ${(registry as any).type}`);
    }
  }

  /**
   * Generate build tags for the primary build
   */
  private generateBuildTags(): string[] {
    const tags: string[] = [];
    const imageName = this.taggingConfig.imageName;

    // Always include a commit SHA tag for tracking
    tags.push(`${imageName}:$\{COMMIT_SHA}`);

    return tags;
  }

  /**
   * Generate tags for a specific registry
   */
  private generateRegistryTags(registry: RegistryConfig, stageName: string): string[] {
    const tags: string[] = [];
    let prefix = '';

    // Build the registry prefix
    if (registry.type === 'ecr') {
      const accountId = registry.accountId ?? '$AWS_ACCOUNT_ID';
      prefix = `${accountId}.dkr.ecr.${registry.region}.amazonaws.com/`;
    } else if (registry.type === 'harbor') {
      prefix = `${registry.url}/`;
    }
    // DockerHub doesn't need a prefix unless it's a custom namespace

    const imageName = this.taggingConfig.imageName;
    const fullImageName = prefix ? `${prefix}${imageName}` : imageName;

    // Add configured tags
    if (this.taggingConfig.tagWithCommitSha) {
      tags.push(`${fullImageName}:$\{COMMIT_SHA}`);
    }

    if (this.taggingConfig.tagWithBranch) {
      tags.push(`${fullImageName}:$\{BRANCH_NAME}`);
    }

    if (this.taggingConfig.tagWithSemver) {
      tags.push(`${fullImageName}:$\{SEMVER}`);
    }

    if (this.taggingConfig.includeLatest && stageName === 'production') {
      tags.push(`${fullImageName}:latest`);
    }

    // Add stage-specific tag
    tags.push(`${fullImageName}:${stageName}`);

    // Add custom tags
    if (this.taggingConfig.customTags) {
      tags.push(...this.taggingConfig.customTags.map(tag => `${fullImageName}:${tag}`));
    }

    return tags;
  }

  /**
   * Generate tags for feature branches
   */
  private generateFeatureBranchTags(): string[] {
    const tags: string[] = [];
    const registry = this.options.featureBranchRegistry!;
    let prefix = '';

    if (registry.type === 'ecr') {
      const accountId = registry.accountId ?? '$AWS_ACCOUNT_ID';
      prefix = `${accountId}.dkr.ecr.${registry.region}.amazonaws.com/`;
    } else if (registry.type === 'harbor') {
      prefix = `${registry.url}/`;
    }

    const imageName = this.taggingConfig.imageName;
    const fullImageName = prefix ? `${prefix}${imageName}` : imageName;

    tags.push(`${fullImageName}:pr-$\{PR_NUMBER}`);
    tags.push(`${fullImageName}:$\{COMMIT_SHA}`);

    return tags;
  }

  /**
   * Get build environment variables
   */
  private getBuildEnvVars(): Record<string, string> {
    return {
      DOCKER_BUILDKIT: '1',
    };
  }

  /**
   * Generate script to set up environment variables
   */
  private generateEnvSetupScript(isFeatureBranch: boolean = false): string {
    const lines: string[] = [];

    if (isFeatureBranch) {
      lines.push('echo "PR_NUMBER=${{ github.event.pull_request.number }}" >> $GITHUB_ENV');
      lines.push('echo "BRANCH_NAME=${{ github.head_ref }}" >> $GITHUB_ENV');
    } else {
      lines.push('echo "BRANCH_NAME=${{ github.ref_name }}" >> $GITHUB_ENV');
    }

    lines.push('echo "COMMIT_SHA=${{ github.sha }}" >> $GITHUB_ENV');
    lines.push('echo "SHORT_SHA=$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_ENV');

    // Extract semver from git tags if configured
    if (this.taggingConfig.tagWithSemver) {
      lines.push('SEMVER=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")');
      lines.push('echo "SEMVER=${SEMVER#v}" >> $GITHUB_ENV');
    }

    return lines.join('\n');
  }
}
