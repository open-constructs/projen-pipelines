import {
  VersioningConfigBuilder,
  VersioningConfigurations,
  VersioningConfigUtils,
} from '../../src/versioning/config';
import { VersioningOutputs } from '../../src/versioning/outputs';
import { VersioningStrategy } from '../../src/versioning/strategy';

describe('VersioningConfigBuilder', () => {
  it('should build basic configuration', () => {
    const config = new VersioningConfigBuilder()
      .enabled(true)
      .strategy(VersioningStrategy.gitTag())
      .outputs(VersioningOutputs.standard())
      .build();

    expect(config.enabled).toBe(true);
    expect(config.strategy.format).toBe('{git-tag}');
    expect(config.outputs).toEqual({
      cloudFormation: true,
      parameterStore: false,
      format: 'plain',
    });
  });

  it('should build configuration with stage overrides', () => {
    const stageOverrides = {
      dev: {
        strategy: VersioningStrategy.commitCount(),
        outputs: VersioningOutputs.minimal(),
      },
      prod: {
        strategy: VersioningStrategy.gitTag(),
      },
    };

    const config = new VersioningConfigBuilder()
      .strategy(VersioningStrategy.gitTag())
      .outputs(VersioningOutputs.standard())
      .stageOverrides(stageOverrides)
      .build();

    expect(config.stageOverrides).toEqual(stageOverrides);
  });

  it('should throw error when strategy is missing', () => {
    expect(() => {
      new VersioningConfigBuilder()
        .outputs(VersioningOutputs.standard())
        .build();
    }).toThrow('Strategy is required');
  });

  it('should throw error when outputs configuration is missing', () => {
    expect(() => {
      new VersioningConfigBuilder()
        .strategy(VersioningStrategy.gitTag())
        .build();
    }).toThrow('Outputs configuration is required');
  });

  it('should use default enabled value', () => {
    const config = new VersioningConfigBuilder()
      .strategy(VersioningStrategy.gitTag())
      .outputs(VersioningOutputs.standard())
      .build();

    expect(config.enabled).toBe(true);
  });
});

describe('VersioningConfigurations', () => {
  describe('builder', () => {
    it('should create a new builder instance', () => {
      const builder = VersioningConfigurations.builder();
      expect(builder).toBeInstanceOf(VersioningConfigBuilder);
    });
  });

  describe('standard', () => {
    it('should create standard configuration', () => {
      const config = VersioningConfigurations.standard();
      expect(config.enabled).toBe(true);
      expect(config.strategy.format).toBe('{commit-count}');
      expect(config.outputs).toEqual({
        cloudFormation: true,
        parameterStore: false,
        format: 'plain',
      });
    });

    it('should create standard configuration with parameter store', () => {
      const config = VersioningConfigurations.standard({
        parameterStore: '/myapp/version',
      });
      expect(config.outputs.parameterStore).toEqual({
        enabled: true,
        parameterName: '/myapp/version',
      });
    });

    it('should create standard configuration with structured format', () => {
      const config = VersioningConfigurations.standard({
        format: 'structured',
      });
      expect(config.outputs.format).toBe('structured');
    });
  });

  describe('minimal', () => {
    it('should create minimal configuration', () => {
      const config = VersioningConfigurations.minimal();
      expect(config.enabled).toBe(true);
      expect(config.strategy.format).toBe('{commit-hash}');
      expect(config.outputs).toEqual({
        cloudFormation: true,
        parameterStore: false,
        format: 'plain',
      });
    });
  });
});

describe('VersioningConfigUtils', () => {
  describe('resolveForStage', () => {
    it('should return original config when no stage override', () => {
      const config = VersioningConfigurations.standard();
      const resolved = VersioningConfigUtils.resolveForStage(config, 'dev');
      expect(resolved).toBe(config);
    });

    it('should merge stage overrides', () => {
      const baseConfig = VersioningConfigurations.standard();
      const configWithOverrides = {
        ...baseConfig,
        stageOverrides: {
          dev: {
            strategy: VersioningStrategy.commitHash(),
            outputs: VersioningOutputs.minimal(),
          },
        },
      };

      const resolved = VersioningConfigUtils.resolveForStage(configWithOverrides, 'dev');
      expect(resolved.strategy).toEqual(configWithOverrides.stageOverrides.dev.strategy);
      expect(resolved.outputs).toEqual(configWithOverrides.stageOverrides.dev.outputs);
    });

    it('should merge partial stage overrides', () => {
      const baseConfig = VersioningConfigurations.standard();
      const configWithOverrides = {
        ...baseConfig,
        stageOverrides: {
          dev: {
            outputs: {
              ...baseConfig.outputs,
              format: 'structured' as const,
            },
          },
        },
      };

      const resolved = VersioningConfigUtils.resolveForStage(configWithOverrides, 'dev');
      expect(resolved.outputs.format).toBe('structured');
      expect(resolved.outputs.cloudFormation).toBe(true); // Original value preserved
      expect(resolved.outputs.parameterStore).toBe(false); // Original value preserved
    });
  });

  describe('validate', () => {
    it('should pass validation for valid config', () => {
      const config = VersioningConfigurations.standard();
      const errors = VersioningConfigUtils.validate(config);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when strategy is missing', () => {
      const config = {
        enabled: true,
        strategy: undefined as any,
        outputs: VersioningOutputs.standard(),
      };
      const errors = VersioningConfigUtils.validate(config);
      expect(errors).toContain('Strategy is required');
    });

    it('should fail validation when outputs configuration is missing', () => {
      const config = {
        enabled: true,
        strategy: VersioningStrategy.gitTag(),
        outputs: undefined as any,
      };
      const errors = VersioningConfigUtils.validate(config);
      expect(errors).toContain('Outputs configuration is required');
    });

    it('should fail validation when parameter store is enabled but parameter name is missing', () => {
      const config = {
        enabled: true,
        strategy: VersioningStrategy.gitTag(),
        outputs: {
          cloudFormation: true,
          parameterStore: {
            enabled: true,
            parameterName: '',
          },
          format: 'plain' as const,
        },
      };
      const errors = VersioningConfigUtils.validate(config);
      expect(errors).toContain('Parameter name is required when parameterStore is enabled');
    });
  });

  describe('getDefault', () => {
    it('should return default configuration', () => {
      const config = VersioningConfigUtils.getDefault();
      expect(config).toEqual(VersioningConfigurations.standard());
    });
  });
});