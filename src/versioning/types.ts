
export interface MutableVersioningConfig {
  enabled?: boolean;
  strategy?: IVersioningStrategy;
  outputs?: VersioningOutputConfig;
  stageOverrides?: { [stage: string]: Partial<VersioningConfig> };
}

export interface VersioningConfig {
  /**
   * Enable versioning feature
   * @default true
   */
  readonly enabled: boolean;

  /**
   * Primary versioning strategy
   */
  readonly strategy: IVersioningStrategy;

  /**
   * Output configuration
   */
  readonly outputs: VersioningOutputConfig;

  /**
   * Stage-specific overrides
   */
  readonly stageOverrides?: { [stage: string]: Partial<VersioningConfig> };
}

export interface VersioningStrategyComponents {
  readonly gitTag?: GitTagConfig;
  readonly packageJson?: PackageJsonConfig;
  readonly commitCount?: CommitCountConfig;
}

export interface IVersioningStrategy {
  /**
   * Version format template
   * Variables: {git-tag}, {package-version}, {commit-count}, {commit-hash},
   *            {commit-hash:8}, {branch}, {build-number}
   */
  readonly format: string;

  /**
   * Components to include
   */
  readonly components: VersioningStrategyComponents;
}

export interface GitTagConfig {
  /**
   * Only use annotated tags
   */
  readonly annotatedOnly?: boolean;
  /**
   * Tag pattern to match
   */
  readonly pattern?: string;
  /**
   * Strip prefix from tag
   */
  readonly stripPrefix?: string;
  /**
   * Include commits since tag
   */
  readonly includeSinceTag?: boolean;
}

export interface PackageJsonConfig {
  /**
   * Path to package.json
   */
  readonly path?: string;
  /**
   * Include pre-release version
   */
  readonly includePrerelease?: boolean;
  /**
   * Append commit info
   */
  readonly appendCommitInfo?: boolean;
}

export interface CommitCountConfig {
  /**
   * Count from: 'all' | 'branch' | 'since-tag'
   */
  readonly countFrom?: 'all' | 'branch' | 'since-tag';
  /**
   * Include branch name
   */
  readonly includeBranch?: boolean;
  /**
   * Reset on major version
   */
  readonly resetOnMajor?: boolean;
  /**
   * Padding for count
   */
  readonly padding?: number;
}

export interface VersioningOutputConfig {
  /**
   * Output to CloudFormation stack outputs
   * @default true
   */
  readonly cloudFormation: boolean | CloudFormationOutputConfig;

  /**
   * Output to SSM Parameter Store
   * @default false
   */
  readonly parameterStore: boolean | ParameterStoreConfig;

  /**
   * Output format
   * @default 'structured'
   */
  readonly format: 'plain' | 'structured';

  /**
   * Custom output targets
   */
  readonly custom?: CustomOutputConfig[];
}

export interface CloudFormationOutputConfig {
  readonly enabled: boolean;
  readonly stackOutputName?: string;
  readonly exportName?: string;
}

export interface ParameterStoreConfig {
  readonly enabled: boolean;
  readonly parameterName: string;
  readonly description?: string;
  readonly allowOverwrite?: boolean;
  readonly splitParameters?: boolean;
  readonly hierarchical?: boolean;
}

export interface CustomOutputConfig {
  readonly type: string;
  readonly [key: string]: any;
}

export interface BuildNumberConfig {
  readonly prefix?: string;
  readonly commitCount?: CommitCountConfig;
}

export interface GitInfoInput {
  readonly commitHash: string;
  readonly branch: string;
  readonly tag?: string;
  readonly commitsSinceTag?: number;
  readonly commitCount: number;
}

export interface DeploymentInfoInput {
  readonly environment: string;
  readonly deployedBy?: string;
  readonly buildNumber?: string;
}

export interface StandardConfigOptions {
  readonly parameterStore?: boolean | string;
  readonly format?: 'plain' | 'structured';
}

export interface CloudFormationOnlyOptions {
  readonly format?: 'plain' | 'structured';
  readonly stackOutputName?: string;
  readonly exportName?: string;
}

export interface HierarchicalParametersOptions {
  readonly includeCloudFormation?: boolean;
  readonly format?: 'plain' | 'structured';
}

export interface StandardOutputOptions {
  readonly parameterName?: string;
  readonly format?: 'plain' | 'structured';
}

export interface MutableVersionInfo {
  version?: string;
  commitHash?: string;
  commitHashShort?: string;
  branch?: string;
  tag?: string;
  commitsSinceTag?: number;
  commitCount?: number;
  packageVersion?: string;
  deployedAt?: string;
  deployedBy?: string;
  buildNumber?: string;
  environment?: string;
  repository?: string;
  pipelineVersion?: string;
}

export interface IVersionInfo {
  /**
   * Primary version string
   */
  readonly version: string;

  /**
   * Git information (ALWAYS included)
   */
  readonly commitHash: string;
  readonly commitHashShort: string;
  readonly branch: string;

  /**
   * Optional git tag information
   */
  readonly tag?: string;
  readonly commitsSinceTag?: number;

  /**
   * Commit count information
   */
  readonly commitCount: number;

  /**
   * Package.json information (if applicable)
   */
  readonly packageVersion?: string;

  /**
   * Deployment metadata
   */
  readonly deployedAt: string;
  readonly deployedBy: string;
  readonly buildNumber?: string;
  readonly environment: string;

  /**
   * Additional metadata
   */
  readonly repository?: string;
  readonly pipelineVersion?: string;
}
