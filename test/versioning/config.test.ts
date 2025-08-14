import {
  VersioningConfigurations,
  VersioningConfigUtils,
} from '../../src/versioning/config';
import { VersioningOutputs } from '../../src/versioning/outputs';
import { VersioningStrategy } from '../../src/versioning/strategy';
import { StageOverrides, VersioningConfig } from '../../src/versioning/types';

describe('VersioningConfigBuilder', () => {
  it('should build basic configuration', () => {
    const config = VersioningConfigurations.standard();

    expect(config.enabled).toBe(true);
    expect(config.strategy.format).toBe('{commit-count}');
    expect(config.outputs).toEqual({
      cloudFormation: {
        enabled: true,
      },
      parameterStore: {
        enabled: false,
        parameterName: '',
      },
    });
  });

  it('should build configuration with stage overrides', () => {
    const stageOverrides: StageOverrides = {
      dev: {
        enabled: true,
        strategy: VersioningStrategy.commitCount(),
        outputs: VersioningOutputs.minimal(),
      },
      prod: {
        enabled: true,
        strategy: VersioningStrategy.gitTag(),
        outputs: VersioningOutputs.standard(),
      },
    };

    const config = VersioningConfigurations.custom({
      strategy: VersioningStrategy.gitTag(),
      outputs: VersioningOutputs.standard(),
      stageOverrides,
    });

    expect(config.stageOverrides).toEqual(stageOverrides);
  });

  it('should use default enabled value', () => {
    const config = VersioningConfigurations.custom({
      strategy: VersioningStrategy.gitTag(),
      outputs: VersioningOutputs.standard(),
    });

    expect(config.enabled).toBe(true);
  });
});

describe('VersioningConfigurations', () => {

  describe('standard', () => {
    it('should create standard configuration', () => {
      const config = VersioningConfigurations.standard();
      expect(config.enabled).toBe(true);
      expect(config.strategy.format).toBe('{commit-count}');
      expect(config.outputs).toEqual({
        cloudFormation: {
          enabled: true,
        },
        parameterStore: {
          enabled: false,
          parameterName: '',
        },
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
  });

  describe('minimal', () => {
    it('should create minimal configuration', () => {
      const config = VersioningConfigurations.minimal();
      expect(config.enabled).toBe(true);
      expect(config.strategy.format).toBe('{commit-hash}');
      expect(config.outputs).toEqual({
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

describe('VersioningConfigUtils', () => {
  describe('resolveForStage', () => {
    it('should return original config when no stage override', () => {
      const config = VersioningConfigurations.standard();
      const resolved = VersioningConfigUtils.resolveForStage(config, 'dev');
      expect(resolved).toBe(config);
    });

    it('should merge stage overrides', () => {
      const baseConfig = VersioningConfigurations.standard();
      const configWithOverrides: VersioningConfig = {
        ...baseConfig,
        stageOverrides: {
          dev: {
            enabled: true,
            strategy: VersioningStrategy.commitHash(),
            outputs: VersioningOutputs.minimal(),
          },
        },
      };

      const resolved = VersioningConfigUtils.resolveForStage(configWithOverrides, 'dev');
      expect(resolved.strategy).toEqual(configWithOverrides.stageOverrides?.dev.strategy);
      expect(resolved.outputs).toEqual(configWithOverrides.stageOverrides?.dev.outputs);
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
  });

  describe('default', () => {
    it('should return default configuration', () => {
      const config = VersioningConfigUtils.default();
      expect(config).toEqual(VersioningConfigurations.standard());
    });
  });
});