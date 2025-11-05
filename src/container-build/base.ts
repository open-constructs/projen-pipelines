import { Component, Project } from 'projen';
import { PipelineEngine } from '../engine';
import { PipelineStep } from '../steps';

/**
 * Configuration for container registry
 */
export interface RegistryConfig {
  /**
   * Type of registry
   */
  readonly type: 'ecr' | 'dockerhub' | 'harbor';

  /**
   * Registry URL (for Harbor and custom registries)
   */
  readonly url?: string;

  /**
   * AWS region (for ECR)
   */
  readonly region?: string;

  /**
   * AWS account ID (for ECR)
   */
  readonly accountId?: string;

  /**
   * IAM role ARN to assume (for ECR)
   */
  readonly roleArn?: string;

  /**
   * Username secret/variable name
   * For GitHub: secrets.DOCKER_USERNAME
   * For GitLab: $DOCKER_USERNAME
   */
  readonly usernameSecret?: string;

  /**
   * Password secret/variable name
   * For GitHub: secrets.DOCKER_PASSWORD
   * For GitLab: $DOCKER_PASSWORD
   */
  readonly passwordSecret?: string;
}

/**
 * Configuration for image scanning
 */
export interface ScanConfig {
  /**
   * Enable Trivy scanning
   * @default false
   */
  readonly trivy?: boolean;

  /**
   * Trivy severity levels to report
   * @default ['CRITICAL', 'HIGH']
   */
  readonly trivySeverity?: string[];

  /**
   * Fail build on vulnerabilities
   * @default true
   */
  readonly failOnVulnerabilities?: boolean;

  /**
   * Enable AWS Inspector SBOM generation
   * @default false
   */
  readonly awsInspectorSbom?: boolean;

  /**
   * AWS region for Inspector
   */
  readonly awsInspectorRegion?: string;

  /**
   * IAM role for Inspector
   */
  readonly awsInspectorRoleArn?: string;

  /**
   * SBOM format
   * @default 'cyclonedx'
   */
  readonly sbomFormat?: 'cyclonedx' | 'spdx';
}

/**
 * Configuration for image tagging strategy
 */
export interface TaggingConfig {
  /**
   * Base image name (e.g., 'myapp' or 'myregistry.com/myapp')
   */
  readonly imageName: string;

  /**
   * Tag with git commit SHA
   * @default true
   */
  readonly tagWithCommitSha?: boolean;

  /**
   * Tag with git branch name
   * @default true
   */
  readonly tagWithBranch?: boolean;

  /**
   * Tag with semantic version (from git tags)
   * @default false
   */
  readonly tagWithSemver?: boolean;

  /**
   * Always include 'latest' tag
   * @default false
   */
  readonly includeLatest?: boolean;

  /**
   * Custom tags to add
   * @default []
   */
  readonly customTags?: string[];
}

/**
 * Configuration for Docker build
 */
export interface BuildConfig {
  /**
   * Path to Dockerfile
   * @default './Dockerfile'
   */
  readonly dockerfile?: string;

  /**
   * Build context path
   * @default '.'
   */
  readonly context?: string;

  /**
   * Build arguments
   */
  readonly buildArgs?: Record<string, string>;

  /**
   * Target stage for multi-stage builds
   */
  readonly target?: string;

  /**
   * Platforms to build for
   * @default ['linux/amd64']
   */
  readonly platforms?: string[];

  /**
   * Enable build cache
   * @default true
   */
  readonly cache?: boolean;
}

/**
 * Options for a container build pipeline stage
 */
export interface ContainerBuildStage {
  /**
   * Stage name (e.g., 'dev', 'staging', 'prod')
   */
  readonly name: string;

  /**
   * Registries to push to for this stage
   */
  readonly registries: RegistryConfig[];

  /**
   * Scanning configuration for this stage
   */
  readonly scan?: ScanConfig;

  /**
   * Whether this stage requires manual approval
   * @default false
   */
  readonly manualApproval?: boolean;

  /**
   * Environment variables for this stage
   */
  readonly env?: Record<string, string>;

  /**
   * Additional steps to run before building
   */
  readonly preBuildSteps?: PipelineStep[];

  /**
   * Additional steps to run after building but before scanning
   */
  readonly postBuildSteps?: PipelineStep[];

  /**
   * Additional steps to run after pushing
   */
  readonly postPushSteps?: PipelineStep[];
}

/**
 * Options for container build pipeline
 */
export interface ContainerBuildPipelineOptions {
  /**
   * Branch name to trigger pipeline
   * @default 'main'
   */
  readonly branchName?: string;

  /**
   * Build configuration
   */
  readonly buildConfig: BuildConfig;

  /**
   * Tagging configuration
   */
  readonly tagging: TaggingConfig;

  /**
   * Stages to build and push to
   */
  readonly stages: ContainerBuildStage[];

  /**
   * Enable feature branch builds
   * @default false
   */
  readonly enableFeatureBranches?: boolean;

  /**
   * Feature branch registry configuration
   */
  readonly featureBranchRegistry?: RegistryConfig;

  /**
   * Pre-build steps that run before any stage
   */
  readonly preBuildSteps?: PipelineStep[];

  /**
   * Post-build steps that run after all stages
   */
  readonly postBuildSteps?: PipelineStep[];
}

/**
 * Abstract base class for container build pipelines
 */
export abstract class ContainerBuildPipeline extends Component {
  public readonly branchName: string;
  public readonly buildConfig: BuildConfig;
  public readonly taggingConfig: TaggingConfig;
  public readonly stages: ContainerBuildStage[];

  constructor(public readonly project: Project, protected options: ContainerBuildPipelineOptions) {
    super(project);

    this.branchName = options.branchName ?? 'main';
    this.buildConfig = options.buildConfig;
    this.taggingConfig = options.tagging;
    this.stages = options.stages;

    // Validate configuration
    this.validateConfiguration();
  }

  /**
   * Get the pipeline engine type
   */
  public abstract engineType(): PipelineEngine;

  /**
   * Validate pipeline configuration
   */
  protected validateConfiguration(): void {
    if (this.stages.length === 0) {
      throw new Error('At least one stage must be defined');
    }

    for (const stage of this.stages) {
      if (stage.registries.length === 0) {
        throw new Error(`Stage '${stage.name}' must have at least one registry configured`);
      }

      for (const registry of stage.registries) {
        if (registry.type === 'ecr' && !registry.region) {
          throw new Error(`ECR registry in stage '${stage.name}' must specify a region`);
        }

        if (registry.type === 'harbor' && !registry.url) {
          throw new Error(`Harbor registry in stage '${stage.name}' must specify a URL`);
        }

        if ((registry.type === 'dockerhub' || registry.type === 'harbor') && (!registry.usernameSecret || !registry.passwordSecret)) {
          throw new Error(`${registry.type} registry in stage '${stage.name}' must specify username and password secrets`);
        }
      }
    }
  }

  /**
   * Generate image tags based on tagging configuration
   */
  protected generateImageTags(baseTag?: string): string[] {
    const tags: string[] = [];
    const imageName = this.taggingConfig.imageName;

    if (baseTag) {
      tags.push(`${imageName}:${baseTag}`);
    }

    if (this.taggingConfig.customTags) {
      tags.push(...this.taggingConfig.customTags.map(tag => `${imageName}:${tag}`));
    }

    if (this.taggingConfig.includeLatest) {
      tags.push(`${imageName}:latest`);
    }

    return tags;
  }

  /**
   * Tag expressions for CI/CD (with environment variable substitution)
   */
  protected tagExpressions(): string[] {
    const tags: string[] = [];
    const imageName = this.taggingConfig.imageName;

    if (this.taggingConfig.tagWithCommitSha) {
      // These will be replaced with actual values in CI/CD
      tags.push(`${imageName}:\${COMMIT_SHA}`);
    }

    if (this.taggingConfig.tagWithBranch) {
      tags.push(`${imageName}:\${BRANCH_NAME}`);
    }

    if (this.taggingConfig.tagWithSemver) {
      tags.push(`${imageName}:\${SEMVER}`);
    }

    if (this.taggingConfig.customTags) {
      tags.push(...this.taggingConfig.customTags.map(tag => `${imageName}:${tag}`));
    }

    if (this.taggingConfig.includeLatest) {
      tags.push(`${imageName}:latest`);
    }

    return tags;
  }
}
