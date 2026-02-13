import { gitlab, Project } from 'projen';
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

/**
 * Options for GitLab container build pipeline
 */
export interface GitlabContainerBuildPipelineOptions extends ContainerBuildPipelineOptions {
  /**
   * Runner tags for builds
   */
  readonly runnerTags?: string[];

  /**
   * Docker image to use for the pipeline
   * @default 'docker:24-dind'
   */
  readonly image?: string;

  /**
   * Services to use (e.g., docker:dind)
   * @default ['docker:24-dind']
   */
  readonly services?: string[];
}

/**
 * GitLab implementation of container build pipeline
 */
export class GitlabContainerBuildPipeline extends ContainerBuildPipeline {
  private readonly config: gitlab.GitlabConfiguration;
  private readonly runnerTags: string[];
  private readonly image: string;
  private readonly services: string[];

  constructor(project: Project, options: GitlabContainerBuildPipelineOptions) {
    super(project, options);

    this.runnerTags = options.runnerTags ?? [];
    this.image = options.image ?? 'docker:24';
    this.services = options.services ?? ['docker:24-dind'];

    // Create GitLab CI configuration
    this.config = new gitlab.GitlabConfiguration(project, {
      stages: [],
      jobs: {},
    });

    // Setup base configuration
    this.setupBaseJobs();

    // Create build stage
    this.createBuildStage();

    // Create deployment stages
    for (const stage of this.stages) {
      this.createDeploymentStage(stage);
    }

    // Create feature branch workflow if enabled
    if (options.enableFeatureBranches && options.featureBranchRegistry) {
      this.createFeatureBranchJob();
    }
  }

  public engineType(): PipelineEngine {
    return PipelineEngine.GITLAB;
  }

  /**
   * Setup base job templates
   */
  private setupBaseJobs(): void {
    this.config.addJobs({
      '.docker_base': {
        image: { name: this.image },
        services: this.services.map(s => ({ name: s })),
        tags: this.runnerTags,
        variables: {
          DOCKER_HOST: 'tcp://docker:2376',
          DOCKER_TLS_CERTDIR: '/certs',
          DOCKER_TLS_VERIFY: '1',
          DOCKER_CERT_PATH: '$DOCKER_TLS_CERTDIR/client',
          DOCKER_BUILDKIT: '1',
        },
        beforeScript: [
          'apk add --no-cache git curl',
          this.generateEnvSetupScript(),
        ],
      },
      '.docker_build': {
        extends: ['.docker_base'],
        artifacts: {
          paths: ['image.tar.gz'],
          expireIn: '1 day',
          when: gitlab.CacheWhen.ON_SUCCESS,
        },
      },
      '.docker_deploy': {
        extends: ['.docker_base'],
      },
    });

    // Add AWS job template if any stage uses ECR
    const hasEcr = this.stages.some(s => s.registries.some(r => r.type === 'ecr'));
    if (hasEcr || (this.options.featureBranchRegistry?.type === 'ecr')) {
      this.config.addJobs({
        '.aws_docker': {
          extends: ['.docker_base'],
          idTokens: {
            AWS_TOKEN: {
              aud: 'https://sts.amazonaws.com',
            },
          },
          beforeScript: [
            'apk add --no-cache git curl aws-cli',
            this.generateEnvSetupScript(),
          ],
        },
      });
    }
  }

  /**
   * Create the build stage
   */
  private createBuildStage(): void {
    this.config.addStages('build');

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

    const gitlabSteps = steps.map(s => s.toGitlab());

    this.config.addJobs({
      build: {
        extends: ['.docker_build', ...gitlabSteps.flatMap(s => s.extensions)],
        stage: 'build',
        only: {
          refs: [this.branchName],
        },
        script: [
          ...gitlabSteps.flatMap(s => s.commands),
          `docker save ${tags[0]} | gzip > image.tar.gz`,
          'echo "Image saved to image.tar.gz"',
        ],
        variables: gitlabSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
    });
  }

  /**
   * Create a deployment stage
   */
  private createDeploymentStage(stage: ContainerBuildStage): void {
    this.config.addStages(stage.name);

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
        format: 'json',
        outputFile: 'trivy-results.json',
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

    const gitlabSteps = steps.map(s => s.toGitlab());

    // Determine if we need AWS support
    const needsAws = stage.registries.some(r => r.type === 'ecr') || stage.scan?.awsInspectorSbom;
    const baseExtend = needsAws ? '.aws_docker' : '.docker_deploy';

    this.config.addJobs({
      [`deploy_${stage.name}`]: {
        extends: [baseExtend, ...gitlabSteps.flatMap(s => s.extensions)],
        stage: stage.name,
        only: {
          refs: [this.branchName],
        },
        needs: [{ job: 'build', artifacts: true }],
        ...stage.manualApproval && {
          when: gitlab.JobWhen.MANUAL,
        },
        script: [
          'docker load < image.tar.gz',
          'echo "Image loaded from tarball"',
          ...gitlabSteps.flatMap(s => s.commands),
        ],
        variables: {
          ...stage.env,
          ...gitlabSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
        },
        artifacts: {
          paths: [
            ...(stage.scan?.trivy ? ['trivy-results.json'] : []),
            ...(stage.scan?.awsInspectorSbom ? ['sbom.json'] : []),
          ],
          expireIn: '30 days',
          when: gitlab.CacheWhen.ALWAYS,
        },
      },
    });
  }

  /**
   * Create feature branch job
   */
  private createFeatureBranchJob(): void {
    if (!this.options.featureBranchRegistry) return;

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

    const gitlabSteps = steps.map(s => s.toGitlab());

    const needsAws = this.options.featureBranchRegistry.type === 'ecr';
    const baseExtend = needsAws ? '.aws_docker' : '.docker_base';

    this.config.addJobs({
      build_feature: {
        extends: [baseExtend, ...gitlabSteps.flatMap(s => s.extensions)],
        stage: 'build',
        except: {
          refs: [this.branchName],
        },
        script: gitlabSteps.flatMap(s => s.commands),
        variables: gitlabSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
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
    tags.push(`${imageName}:$COMMIT_SHA`);

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
      const accountId = registry.accountId ?? '$(aws sts get-caller-identity --query Account --output text)';
      prefix = `${accountId}.dkr.ecr.${registry.region}.amazonaws.com/`;
    } else if (registry.type === 'harbor') {
      prefix = `${registry.url}/`;
    }

    const imageName = this.taggingConfig.imageName;
    const fullImageName = prefix ? `${prefix}${imageName}` : imageName;

    // Add configured tags
    if (this.taggingConfig.tagWithCommitSha) {
      tags.push(`${fullImageName}:$COMMIT_SHA`);
    }

    if (this.taggingConfig.tagWithBranch) {
      tags.push(`${fullImageName}:$BRANCH_NAME`);
    }

    if (this.taggingConfig.tagWithSemver) {
      tags.push(`${fullImageName}:$SEMVER`);
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
      const accountId = registry.accountId ?? '$(aws sts get-caller-identity --query Account --output text)';
      prefix = `${accountId}.dkr.ecr.${registry.region}.amazonaws.com/`;
    } else if (registry.type === 'harbor') {
      prefix = `${registry.url}/`;
    }

    const imageName = this.taggingConfig.imageName;
    const fullImageName = prefix ? `${prefix}${imageName}` : imageName;

    tags.push(`${fullImageName}:mr-$CI_MERGE_REQUEST_IID`);
    tags.push(`${fullImageName}:$COMMIT_SHA`);

    return tags;
  }

  /**
   * Generate script to set up environment variables
   */
  private generateEnvSetupScript(): string {
    const lines: string[] = [
      'export BRANCH_NAME="$CI_COMMIT_REF_NAME"',
      'export COMMIT_SHA="$CI_COMMIT_SHA"',
      'export SHORT_SHA="$(echo $CI_COMMIT_SHA | cut -c1-7)"',
    ];

    // Extract semver from git tags if configured
    if (this.taggingConfig.tagWithSemver) {
      lines.push('export SEMVER=$(git describe --tags --abbrev=0 2>/dev/null | sed \'s/^v//\' || echo "0.0.0")');
    }

    return lines.join('\n');
  }
}
