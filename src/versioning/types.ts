
export interface VersioningConfig {
  /**
   * Enable versioning feature
   * @default true
   */
  enabled: boolean;

  /**
   * Primary versioning strategy
   */
  strategy: IVersioningStrategy;

  /**
   * Output configuration
   */
  outputs: VersioningOutputConfig;

  /**
   * Stage-specific overrides
   */
  stageOverrides?: Record<string, Partial<VersioningConfig>>;
}

export interface IVersioningStrategy {
  /**
   * Version format template
   * Variables: {git-tag}, {package-version}, {commit-count}, {commit-hash},
   *            {commit-hash:8}, {branch}, {build-number}
   */
  format: string;

  /**
   * Components to include
   */
  components: {
    gitTag?: GitTagConfig;
    packageJson?: PackageJsonConfig;
    commitCount?: CommitCountConfig;
  };
}

export interface GitTagConfig {
  /**
   * Only use annotated tags
   */
  annotatedOnly?: boolean;
  /**
   * Tag pattern to match
   */
  pattern?: RegExp;
  /**
   * Strip prefix from tag
   */
  stripPrefix?: string;
  /**
   * Include commits since tag
   */
  includeSinceTag?: boolean;
}

export interface PackageJsonConfig {
  /**
   * Path to package.json
   */
  path?: string;
  /**
   * Include pre-release version
   */
  includePrerelease?: boolean;
  /**
   * Append commit info
   */
  appendCommitInfo?: boolean;
}

export interface CommitCountConfig {
  /**
   * Count from: 'all' | 'branch' | 'since-tag'
   */
  countFrom?: 'all' | 'branch' | 'since-tag';
  /**
   * Include branch name
   */
  includeBranch?: boolean;
  /**
   * Reset on major version
   */
  resetOnMajor?: boolean;
  /**
   * Padding for count
   */
  padding?: number;
}

export interface VersioningOutputConfig {
  /**
   * Output to CloudFormation stack outputs
   * @default true
   */
  cloudFormation: boolean | CloudFormationOutputConfig;

  /**
   * Output to SSM Parameter Store
   * @default false
   */
  parameterStore: boolean | ParameterStoreConfig;

  /**
   * Output format
   * @default 'structured'
   */
  format: 'plain' | 'structured';

  /**
   * Custom output targets
   */
  custom?: CustomOutputConfig[];
}

export interface CloudFormationOutputConfig {
  enabled: boolean;
  stackOutputName?: string;
  exportName?: string;
}

export interface ParameterStoreConfig {
  enabled: boolean;
  parameterName: string;
  description?: string;
  allowOverwrite?: boolean;
  splitParameters?: boolean;
  hierarchical?: boolean;
}

export interface CustomOutputConfig {
  type: string;
  [key: string]: any;
}

export interface VersionInfo {
  /**
   * Primary version string
   */
  version: string;

  /**
   * Git information (ALWAYS included)
   */
  commitHash: string;
  commitHashShort: string;
  branch: string;

  /**
   * Optional git tag information
   */
  tag?: string;
  commitsSinceTag?: number;

  /**
   * Commit count information
   */
  commitCount: number;

  /**
   * Package.json information (if applicable)
   */
  packageVersion?: string;

  /**
   * Deployment metadata
   */
  deployedAt: string;
  deployedBy: string;
  buildNumber?: string;
  environment: string;

  /**
   * Additional metadata
   */
  repository?: string;
  pipelineVersion?: string;
}
