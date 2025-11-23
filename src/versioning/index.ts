// Re-export versioning from cdk-devops
export {
  // Types
  VersioningConfig,
  VersioningOutputsConfig,
  IVersioningStrategy,
  IVersionInfo,
  GitTagConfig,
  PackageJsonConfig,
  CommitCountConfig,
  BuildNumberConfig,
  CloudFormationOutputConfig,
  ParameterStoreOutputConfig,
  GitInfo,
  ComputationContext,

  // Classes
  VersioningStrategy,
  VersionInfo,
  VersionInfoBuilder,
  VersionComputer,
  VersionOutputs,
} from 'cdk-devops';

// Setup (projen-specific, kept locally)
export { VersioningSetup } from './setup';
