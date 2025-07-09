import { VersioningOutputs } from './outputs';
import { VersioningStrategy } from './strategy';
import { VersioningConfig, MutableVersioningConfig, IVersioningStrategy, StandardConfigOptions } from './types';

/**
 * Builder class for versioning configuration
 */
export class VersioningConfigBuilder {
  private config: MutableVersioningConfig = {
    enabled: true,
  };

  /**
   * Enable or disable versioning
   */
  public enabled(enabled: boolean): this {
    this.config.enabled = enabled;
    return this;
  }

  /**
   * Set the primary versioning strategy
   */
  public strategy(strategy: IVersioningStrategy): this {
    this.config.strategy = strategy;
    return this;
  }

  /**
   * Configure outputs
   */
  public outputs(outputs: VersioningConfig['outputs']): this {
    this.config.outputs = outputs;
    return this;
  }

  /**
   * Set stage-specific overrides
   */
  public stageOverrides(overrides: VersioningConfig['stageOverrides']): this {
    this.config.stageOverrides = overrides;
    return this;
  }

  /**
   * Build the configuration
   */
  public build(): VersioningConfig {
    if (!this.config.strategy) {
      throw new Error('Strategy is required');
    }
    if (!this.config.outputs) {
      throw new Error('Outputs configuration is required');
    }

    return {
      enabled: this.config.enabled!,
      strategy: this.config.strategy,
      outputs: this.config.outputs,
      stageOverrides: this.config.stageOverrides,
    };
  }
}

/**
 * Main versioning configuration class with factory methods
 */
export class VersioningConfigurations {
  /**
   * Create a new configuration builder
   */
  public static builder(): VersioningConfigBuilder {
    return new VersioningConfigBuilder();
  }

  /**
   * Standard configuration with git tag strategy
   */
  public static standard(options?: StandardConfigOptions): VersioningConfig {
    return new VersioningConfigBuilder()
      .strategy(VersioningStrategy.commitCount())
      .outputs(VersioningOutputs.standard({
        parameterName: typeof options?.parameterStore === 'string' ? options.parameterStore : undefined,
        format: options?.format,
      }))
      .build();
  }

  /**
   * Minimal configuration for testing
   */
  public static minimal(): VersioningConfig {
    return new VersioningConfigBuilder()
      .strategy(VersioningStrategy.commitHash())
      .outputs(VersioningOutputs.minimal())
      .build();
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

    if (config.outputs?.parameterStore && typeof config.outputs.parameterStore === 'object') {
      const paramConfig = config.outputs.parameterStore;
      if (!paramConfig.parameterName) {
        errors.push('Parameter name is required when parameterStore is enabled');
      }
    }

    return errors;
  }

  /**
   * Get default configuration
   */
  public static getDefault(): VersioningConfig {
    return VersioningConfigurations.standard();
  }
}