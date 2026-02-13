// Re-export versioning from cdk-devops
export {
  // Types
  VersioningConfig,
  VersioningOutputsConfig,
  VersioningOutputConfig, // Alias
  IVersioningStrategy,
  IVersionInfo,
  GitTagConfig,
  PackageJsonConfig,
  CommitCountConfig,
  BuildNumberConfig,
  CloudFormationOutputConfig,
  ParameterStoreOutputConfig,
  ParameterStoreConfig, // Alias
  GitInfo,
  ComputationContext,

  // Classes
  VersioningStrategy,
  VersionInfo,
  VersionInfoBuilder,
  VersionComputer,
  VersionOutputs,
  VersioningOutputsFactory,
  // Alias for backward compatibility
  VersioningOutputsFactory as VersioningOutputs,

  // Functions
  computeVersion,
} from 'cdk-devops';

// Setup (projen-specific, kept locally)
export { VersioningSetup } from './setup';
