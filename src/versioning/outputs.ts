import { CloudFormationOutputConfig, ParameterStoreConfig, VersioningOutputConfig, StandardOutputOptions, CloudFormationOnlyOptions, HierarchicalParametersOptions } from './types';

/**
 * Base class for output configurations
 */
export abstract class OutputConfigBase {
  protected constructor(public readonly type: string) { }

  /**
   * Convert to configuration object
   */
  abstract toConfig(): any;
}

/**
 * CloudFormation output configuration
 */
export class CloudFormationOutput extends OutputConfigBase {
  public static readonly TYPE = 'cloudformation';

  private constructor(private readonly config?: CloudFormationOutputConfig) {
    super(CloudFormationOutput.TYPE);
  }

  /**
   * Enable CloudFormation outputs with default configuration
   */
  public static enabled(): CloudFormationOutput {
    return new CloudFormationOutput({ enabled: true });
  }

  /**
   * Disable CloudFormation outputs
   */
  public static disabled(): CloudFormationOutput {
    return new CloudFormationOutput({ enabled: false });
  }

  /**
   * Configure CloudFormation outputs with custom settings
   */
  public static withConfig(config: Omit<CloudFormationOutputConfig, 'enabled'>): CloudFormationOutput {
    return new CloudFormationOutput({ ...config, enabled: true });
  }

  public toConfig(): boolean | CloudFormationOutputConfig {
    if (!this.config) {
      return true;
    }
    return this.config.enabled ? this.config : false;
  }
}

/**
 * SSM Parameter Store output configuration
 */
export class ParameterStoreOutput extends OutputConfigBase {
  public static readonly TYPE = 'parameterStore';

  private constructor(private readonly config?: ParameterStoreConfig) {
    super(ParameterStoreOutput.TYPE);
  }

  /**
   * Enable Parameter Store outputs with parameter name
   */
  public static enabled(parameterName: string): ParameterStoreOutput {
    return new ParameterStoreOutput({ enabled: true, parameterName });
  }

  /**
   * Disable Parameter Store outputs
   */
  public static disabled(): ParameterStoreOutput {
    return new ParameterStoreOutput({ enabled: false, parameterName: '' });
  }

  /**
   * Configure Parameter Store outputs with custom settings
   */
  public static withConfig(config: Omit<ParameterStoreConfig, 'enabled'>): ParameterStoreOutput {
    return new ParameterStoreOutput({ ...config, enabled: true });
  }

  /**
   * Configure Parameter Store with hierarchical parameters
   */
  public static hierarchical(basePath: string, options?: {
    description?: string;
    allowOverwrite?: boolean;
  }): ParameterStoreOutput {
    return new ParameterStoreOutput({
      enabled: true,
      parameterName: basePath,
      hierarchical: true,
      splitParameters: true,
      ...options,
    });
  }

  public toConfig(): boolean | ParameterStoreConfig {
    if (!this.config) {
      return false;
    }
    return this.config.enabled ? this.config : false;
  }
}

/**
 * Output format types
 */
export class OutputFormat {
  public static readonly PLAIN = 'plain' as const;
  public static readonly STRUCTURED = 'structured' as const;

  private constructor() { }
}

/**
 * Factory class for output configurations
 */
export class VersioningOutputs {
  /**
   * Create output configuration with CloudFormation and SSM Parameter Store
   */
  public static standard(options?: StandardOutputOptions): VersioningOutputConfig {
    return {
      cloudFormation: true,
      parameterStore: options?.parameterName
        ? ParameterStoreOutput.enabled(options.parameterName).toConfig()
        : false,
      format: options?.format ?? 'plain',
    };
  }

  /**
   * Create output configuration with only CloudFormation
   */
  public static cloudFormationOnly(options?: CloudFormationOnlyOptions): VersioningOutputConfig {
    const cfConfig = options?.stackOutputName || options?.exportName
      ? CloudFormationOutput.withConfig({
        stackOutputName: options.stackOutputName,
        exportName: options.exportName,
      }).toConfig()
      : true;

    return {
      cloudFormation: cfConfig,
      parameterStore: false,
      format: options?.format ?? 'plain',
    };
  }

  /**
   * Create output configuration with hierarchical SSM parameters
   */
  public static hierarchicalParameters(basePath: string, options?: HierarchicalParametersOptions): VersioningOutputConfig {
    return {
      cloudFormation: options?.includeCloudFormation ?? true,
      parameterStore: ParameterStoreOutput.hierarchical(basePath, {}).toConfig(),
      format: options?.format ?? 'plain',
    };
  }

  /**
   * Create minimal output configuration (CloudFormation only, plain format)
   */
  public static minimal(): VersioningOutputConfig {
    return {
      cloudFormation: true,
      parameterStore: false,
      format: 'plain',
    };
  }
}