import { VersioningOutputs } from './outputs';
import { VersioningStrategy } from './strategy';
import { VersioningConfig, IVersioningStrategy, StandardConfigOptions, VersioningOutputConfig, StageOverrides } from './types';


export interface CustomVersioningConfig {
  readonly enabled?: boolean;
  readonly strategy: IVersioningStrategy;
  readonly outputs: VersioningOutputConfig;
  readonly stageOverrides?: StageOverrides;
}

/**
 * Main versioning configuration class with factory methods
 */
export class VersioningConfigurations {
  /**
   * Standard configuration with commit count strategy
   */
  public static standard(options?: StandardConfigOptions): VersioningConfig {
    return {
      enabled: true,
      strategy: VersioningStrategy.commitCount(),
      outputs: VersioningOutputs.standard({
        parameterName: typeof options?.parameterStore === 'string' ? options.parameterStore : undefined,
        format: options?.format,
      }),
    };
  }

  /**
   * Minimal configuration for testing
   */
  public static minimal(): VersioningConfig {
    return {
      enabled: true,
      strategy: VersioningStrategy.commitHash(),
      outputs: VersioningOutputs.minimal(),
    };
  }

  /**
   * Create a custom configuration
   */
  public static custom(config: CustomVersioningConfig): VersioningConfig {
    return {
      enabled: config.enabled ?? true,
      strategy: config.strategy,
      outputs: config.outputs,
      stageOverrides: config.stageOverrides,
    };
  }
}

/**
 * Utility functions for versioning configuration
 */
export class VersioningConfigUtils {
  /**
   * Resolve configuration for a specific stage
   */
  public static resolveForStage(config: VersioningConfig, stage: string): VersioningConfig {
    const stageOverride = config.stageOverrides?.[stage];
    if (!stageOverride) {
      return config;
    }

    return {
      ...config,
      ...stageOverride,
      outputs: stageOverride.outputs ? { ...config.outputs, ...stageOverride.outputs } : config.outputs,
    };
  }

  /**
   * Validate configuration
   */
  public static validate(config: VersioningConfig): string[] {
    const errors: string[] = [];

    if (!config.strategy) {
      errors.push('Strategy is required');
    }

    if (!config.outputs) {
      errors.push('Outputs configuration is required');
    }

    return errors;
  }

  /**
   * Get default configuration
   */
  public static default(): VersioningConfig {
    return VersioningConfigurations.standard();
  }
}