import { VersionInfo as IVersionInfo } from './types';

/**
 * Represents complete version information for a deployment
 */
export class VersionInfo implements IVersionInfo {
  public readonly version: string;
  public readonly commitHash: string;
  public readonly commitHashShort: string;
  public readonly branch: string;
  public readonly tag?: string;
  public readonly commitsSinceTag?: number;
  public readonly commitCount: number;
  public readonly packageVersion?: string;
  public readonly deployedAt: string;
  public readonly deployedBy: string;
  public readonly buildNumber?: string;
  public readonly environment: string;
  public readonly repository?: string;
  public readonly pipelineVersion?: string;

  private constructor(props: IVersionInfo) {
    this.version = props.version;
    this.commitHash = props.commitHash;
    this.commitHashShort = props.commitHashShort;
    this.branch = props.branch;
    this.tag = props.tag;
    this.commitsSinceTag = props.commitsSinceTag;
    this.commitCount = props.commitCount;
    this.packageVersion = props.packageVersion;
    this.deployedAt = props.deployedAt;
    this.deployedBy = props.deployedBy;
    this.buildNumber = props.buildNumber;
    this.environment = props.environment;
    this.repository = props.repository;
    this.pipelineVersion = props.pipelineVersion;
  }

  /**
   * Create a VersionInfo instance from raw data
   */
  public static create(props: IVersionInfo): VersionInfo {
    return new VersionInfo(props);
  }

  /**
   * Create a VersionInfo instance from environment variables
   */
  public static fromEnvironment(env: Record<string, string | undefined>): VersionInfo {
    const commitHash = env.GITHUB_SHA ?? env.GIT_COMMIT_HASH ?? '';
    const commitHashShort = commitHash.substring(0, 8);

    return new VersionInfo({
      version: env.VERSION ?? '0.0.0',
      commitHash,
      commitHashShort,
      branch: env.GIT_BRANCH ?? env.GITHUB_REF_NAME ?? 'unknown',
      tag: env.GIT_TAG,
      commitsSinceTag: env.COMMITS_SINCE_TAG ? parseInt(env.COMMITS_SINCE_TAG, 10) : undefined,
      commitCount: parseInt(env.GIT_COMMIT_COUNT ?? '0', 10),
      packageVersion: env.PACKAGE_VERSION,
      deployedAt: new Date().toISOString(),
      deployedBy: env.GITHUB_ACTOR ?? env.GITLAB_USER_LOGIN ?? env.USER ?? 'unknown',
      buildNumber: env.GITHUB_RUN_NUMBER ?? env.CI_PIPELINE_ID,
      environment: env.STAGE ?? env.ENVIRONMENT ?? 'unknown',
      repository: env.GITHUB_REPOSITORY ?? env.CI_PROJECT_PATH,
      pipelineVersion: env.PIPELINE_VERSION,
    });
  }

  /**
   * Create a VersionInfo instance from a JSON string
   */
  public static fromJson(json: string): VersionInfo {
    const data = JSON.parse(json);
    return new VersionInfo(data);
  }

  /**
   * Convert to plain version string
   */
  public toString(): string {
    return this.version;
  }

  /**
   * Convert to JSON string
   */
  public toJson(pretty = false): string {
    const data: IVersionInfo = {
      version: this.version,
      commitHash: this.commitHash,
      commitHashShort: this.commitHashShort,
      branch: this.branch,
      commitCount: this.commitCount,
      deployedAt: this.deployedAt,
      deployedBy: this.deployedBy,
      environment: this.environment,
    };

    if (this.tag !== undefined) data.tag = this.tag;
    if (this.commitsSinceTag !== undefined) data.commitsSinceTag = this.commitsSinceTag;
    if (this.packageVersion !== undefined) data.packageVersion = this.packageVersion;
    if (this.buildNumber !== undefined) data.buildNumber = this.buildNumber;
    if (this.repository !== undefined) data.repository = this.repository;
    if (this.pipelineVersion !== undefined) data.pipelineVersion = this.pipelineVersion;

    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Convert to object
   */
  public toObject(): IVersionInfo {
    return JSON.parse(this.toJson());
  }

  /**
   * Get formatted version for display
   */
  public getDisplayVersion(): string {
    if (this.tag && this.commitsSinceTag === 0) {
      return this.tag;
    }
    return this.version;
  }

  /**
   * Check if this version is from a tagged release
   */
  public isTaggedRelease(): boolean {
    return this.tag !== undefined && this.commitsSinceTag === 0;
  }

  /**
   * Check if this version is from the main branch
   */
  public isMainBranch(): boolean {
    return this.branch === 'main' || this.branch === 'master';
  }

  /**
   * Compare with another version
   * Returns: -1 if this < other, 0 if equal, 1 if this > other
   */
  public compare(other: VersionInfo): number {
    // First compare by commit count
    if (this.commitCount < other.commitCount) return -1;
    if (this.commitCount > other.commitCount) return 1;

    // Then by version string
    return this.version.localeCompare(other.version);
  }

  /**
   * Create a parameter name for SSM Parameter Store
   */
  public getParameterName(template: string): string {
    return template
      .replace('{stage}', this.environment)
      .replace('{environment}', this.environment)
      .replace('{branch}', this.branch)
      .replace('{version}', this.version);
  }

  /**
   * Create CloudFormation export name
   */
  public getExportName(template: string): string {
    return template
      .replace('{stage}', this.environment)
      .replace('{environment}', this.environment)
      .replace('{branch}', this.branch)
      .replace('{version}', this.version);
  }
}

/**
 * Builder class for creating VersionInfo instances
 */
export class VersionInfoBuilder {
  private props: Partial<IVersionInfo> = {};

  /**
   * Set the version string
   */
  public version(version: string): this {
    this.props.version = version;
    return this;
  }

  /**
   * Set git information
   */
  public gitInfo(info: {
    commitHash: string;
    branch: string;
    tag?: string;
    commitsSinceTag?: number;
    commitCount: number;
  }): this {
    this.props.commitHash = info.commitHash;
    this.props.commitHashShort = info.commitHash.substring(0, 8);
    this.props.branch = info.branch;
    this.props.tag = info.tag;
    this.props.commitsSinceTag = info.commitsSinceTag;
    this.props.commitCount = info.commitCount;
    return this;
  }

  /**
   * Set package version
   */
  public packageVersion(version: string): this {
    this.props.packageVersion = version;
    return this;
  }

  /**
   * Set deployment metadata
   */
  public deploymentInfo(info: {
    environment: string;
    deployedBy?: string;
    buildNumber?: string;
  }): this {
    this.props.environment = info.environment;
    this.props.deployedBy = info.deployedBy ?? 'unknown';
    this.props.buildNumber = info.buildNumber;
    this.props.deployedAt = new Date().toISOString();
    return this;
  }

  /**
   * Set repository information
   */
  public repository(repo: string): this {
    this.props.repository = repo;
    return this;
  }

  /**
   * Set pipeline version
   */
  public pipelineVersion(version: string): this {
    this.props.pipelineVersion = version;
    return this;
  }

  /**
   * Build the VersionInfo instance
   */
  public build(): VersionInfo {
    if (!this.props.version) {
      throw new Error('Version is required');
    }
    if (!this.props.commitHash) {
      throw new Error('Commit hash is required');
    }
    if (!this.props.branch) {
      throw new Error('Branch is required');
    }
    if (this.props.commitCount === undefined) {
      throw new Error('Commit count is required');
    }
    if (!this.props.environment) {
      throw new Error('Environment is required');
    }

    return VersionInfo.create({
      version: this.props.version,
      commitHash: this.props.commitHash,
      commitHashShort: this.props.commitHashShort!,
      branch: this.props.branch,
      tag: this.props.tag,
      commitsSinceTag: this.props.commitsSinceTag,
      commitCount: this.props.commitCount,
      packageVersion: this.props.packageVersion,
      deployedAt: this.props.deployedAt ?? new Date().toISOString(),
      deployedBy: this.props.deployedBy ?? 'unknown',
      buildNumber: this.props.buildNumber,
      environment: this.props.environment,
      repository: this.props.repository,
      pipelineVersion: this.props.pipelineVersion,
    });
  }
}