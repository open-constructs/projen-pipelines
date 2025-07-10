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
  public static withConfig(config: CloudFormationOutputConfig): CloudFormationOutput {
    return new CloudFormationOutput({ ...config });
  }

  private constructor(private readonly config?: CloudFormationOutputConfig) {
    super(CloudFormationOutput.TYPE);
  }

  public toConfig(): any {
    if (!this.config) {
      return { enabled: true };
    }
    return this.config;
  }
}

/**
 * SSM Parameter Store output configuration
 */
export class ParameterStoreOutput extends OutputConfigBase {
  public static readonly TYPE = 'parameterStore';

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
  public static withConfig(config: ParameterStoreConfig): ParameterStoreOutput {
    return new ParameterStoreOutput({ ...config });
  }

  /**
   * Configure Parameter Store with hierarchical parameters
   */
  public static hierarchical(basePath: string, options?: HierarchicalParametersOptions): ParameterStoreOutput {
    return new ParameterStoreOutput({
      enabled: true,
      parameterName: basePath,
      hierarchical: true,
      splitParameters: true,
      ...options,
    });
  }

  private constructor(private readonly config?: ParameterStoreConfig) {
    super(ParameterStoreOutput.TYPE);
  }

  public toConfig(): any {
    if (!this.config) {
      return { enabled: false, parameterName: '' };
    }
    return this.config;
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
      cloudFormation: CloudFormationOutput.enabled().toConfig(),
      parameterStore: options?.parameterName
        ? ParameterStoreOutput.enabled(options.parameterName).toConfig()
        : ParameterStoreOutput.disabled().toConfig(),
    };
  }

  /**
   * Create output configuration with only CloudFormation
   */
  public static cloudFormationOnly(options?: CloudFormationOnlyOptions): VersioningOutputConfig {
    const cfConfig = options?.stackOutputName || options?.exportName
      ? CloudFormationOutput.withConfig({
        enabled: true,
        exportName: options.exportName,
      }).toConfig()
      : CloudFormationOutput.enabled().toConfig();

    return {
      cloudFormation: cfConfig,
      parameterStore: ParameterStoreOutput.disabled().toConfig(),
    };
  }

  /**
   * Create output configuration with hierarchical SSM parameters
   */
  public static hierarchicalParameters(basePath: string, options?: HierarchicalParametersOptions): VersioningOutputConfig {
    return {
      cloudFormation: options?.includeCloudFormation ? CloudFormationOutput.enabled().toConfig() : CloudFormationOutput.disabled().toConfig(),
      parameterStore: ParameterStoreOutput.hierarchical(basePath, {}).toConfig(),
    };
  }

  /**
   * Create minimal output configuration (CloudFormation only, plain format)
   */
  public static minimal(): VersioningOutputConfig {
    return {
      cloudFormation: CloudFormationOutput.enabled().toConfig(),
      parameterStore: ParameterStoreOutput.disabled().toConfig(),
    };
  }
}