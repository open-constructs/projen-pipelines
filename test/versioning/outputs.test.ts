import { CloudFormationOutputConfig, HierarchicalParametersOptions, ParameterStoreConfig } from '../../src/versioning';
import {
  CloudFormationOutput,
  ParameterStoreOutput,
  OutputFormat,
  VersioningOutputs,
} from '../../src/versioning/outputs';

describe('CloudFormationOutput', () => {
  it('should create enabled CloudFormation output', () => {
    const output = CloudFormationOutput.enabled();
    expect(output.type).toBe('cloudformation');
    expect(output.toConfig()).toEqual({ enabled: true });
  });

  it('should create disabled CloudFormation output', () => {
    const output = CloudFormationOutput.disabled();
    expect(output.type).toBe('cloudformation');
    expect(output.toConfig()).toEqual({ enabled: false });
  });

  it('should create CloudFormation output with config', () => {
    const config: CloudFormationOutputConfig = {
      enabled: true,
      exportName: 'MyApp-Version',
    };
    const output = CloudFormationOutput.withConfig(config);
    expect(output.type).toBe('cloudformation');
    expect(output.toConfig()).toEqual(config);
  });
});

describe('ParameterStoreOutput', () => {
  it('should create enabled Parameter Store output', () => {
    const parameterName = '/myapp/version';
    const output = ParameterStoreOutput.enabled(parameterName);
    expect(output.type).toBe('parameterStore');
    expect(output.toConfig()).toEqual({
      enabled: true,
      parameterName,
    });
  });

  it('should create disabled Parameter Store output', () => {
    const output = ParameterStoreOutput.disabled();
    expect(output.type).toBe('parameterStore');
    expect(output.toConfig()).toEqual({ enabled: false, parameterName: '' });
  });

  it('should create Parameter Store output with config', () => {
    const config: ParameterStoreConfig = {
      enabled: true,
      parameterName: '/myapp/version',
      description: 'Application version',
      allowOverwrite: true,
    };
    const output = ParameterStoreOutput.withConfig(config);
    expect(output.type).toBe('parameterStore');
    expect(output.toConfig()).toEqual(config);
  });

  it('should create hierarchical Parameter Store output', () => {
    const basePath = '/myapp/{stage}/version';
    const options: HierarchicalParametersOptions = {
      includeCloudFormation: true,
      format: 'structured',
    };
    const output = ParameterStoreOutput.hierarchical(basePath, options);
    expect(output.type).toBe('parameterStore');
    expect(output.toConfig()).toEqual({
      enabled: true,
      parameterName: basePath,
      hierarchical: true,
      splitParameters: true,
      ...options,
    });
  });
});

describe('OutputFormat', () => {
  it('should have correct constants', () => {
    expect(OutputFormat.PLAIN).toBe('plain');
    expect(OutputFormat.STRUCTURED).toBe('structured');
  });
});

describe('VersioningOutputs', () => {
  describe('standard', () => {
    it('should create standard output configuration', () => {
      const config = VersioningOutputs.standard();
      expect(config).toEqual({
        cloudFormation: {
          enabled: true,
        },
        parameterStore: {
          enabled: false,
          parameterName: '',
        },
      });
    });

    it('should create standard output configuration with parameter store', () => {
      const parameterName = '/myapp/version';
      const config = VersioningOutputs.standard({ parameterName });
      expect(config).toEqual({
        cloudFormation: {
          enabled: true,
        },
        parameterStore: {
          enabled: true,
          parameterName,
        },
      });
    });

    it('should create standard output configuration with structured format', () => {
      const config = VersioningOutputs.standard({ format: 'structured' });
      expect(config).toEqual({
        cloudFormation: {
          enabled: true,
        },
        parameterStore: {
          enabled: false,
          parameterName: '',
        },
      });
    });
  });

  describe('cloudFormationOnly', () => {
    it('should create CloudFormation-only output configuration', () => {
      const config = VersioningOutputs.cloudFormationOnly();
      expect(config).toEqual({
        cloudFormation: {
          enabled: true,
        },
        parameterStore: {
          enabled: false,
          parameterName: '',
        },
      });
    });

    it('should create CloudFormation-only output configuration with custom settings', () => {
      const options = {
        format: 'structured' as const,
        stackOutputName: 'DeploymentInfo',
        exportName: 'MyApp-Version',
      };
      const config = VersioningOutputs.cloudFormationOnly(options);
      expect(config).toEqual({
        cloudFormation: {
          enabled: true,
          exportName: 'MyApp-Version',
        },
        parameterStore: {
          enabled: false,
          parameterName: '',
        },
      });
    });
  });

  describe('hierarchicalParameters', () => {
    it('should create hierarchical parameters configuration', () => {
      const basePath = '/myapp/{stage}/version';
      const config = VersioningOutputs.hierarchicalParameters(basePath);
      expect(config).toEqual({
        cloudFormation: {
          enabled: false,
        },
        parameterStore: {
          enabled: true,
          parameterName: basePath,
          hierarchical: true,
          splitParameters: true,
        },
      });
    });

    it('should create hierarchical parameters configuration with options', () => {
      const basePath = '/myapp/{stage}/version';
      const options = {
        includeCloudFormation: false,
        format: 'structured' as const,
      };
      const config = VersioningOutputs.hierarchicalParameters(basePath, options);
      expect(config).toEqual({
        cloudFormation: {
          enabled: false,
        },
        parameterStore: {
          enabled: true,
          parameterName: basePath,
          hierarchical: true,
          splitParameters: true,
        },
      });
    });
  });

  describe('minimal', () => {
    it('should create minimal output configuration', () => {
      const config = VersioningOutputs.minimal();
      expect(config).toEqual({
        cloudFormation: {
          enabled: true,
        },
        parameterStore: {
          enabled: false,
          parameterName: '',
        },
      });
    });
  });
});