import {
  VersioningConfigurations,
  VersioningOutputs,
} from '../../src/versioning';
import { VersionComputer, ComputationContext } from '../../src/versioning/computation';
import { VersioningStrategy } from '../../src/versioning/strategy';
import { VersionInfo } from '../../src/versioning/version-info';

describe('Versioning Integration Tests', () => {
  describe('End-to-End Versioning Flow', () => {
    it('should create version info from git tag strategy', async () => {
      const strategy = VersioningStrategy.gitTag();
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'main',
          tag: 'v1.2.3',
          commitsSinceTag: 0,
          commitCount: 100,
          packageVersion: '1.2.3',
        },
        environment: 'production',
        deployedBy: 'github-actions',
        buildNumber: '123',
        repository: 'owner/repo',
        pipelineVersion: '1.0.0',
      };

      const versionInfo = await computer.computeVersionInfo(context);

      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.taggedRelease()).toBe(true);
      expect(versionInfo.mainBranch()).toBe(true);
      expect(versionInfo.displayVersion()).toBe('v1.2.3');
    });

    it('should create version info from composite strategy', async () => {
      const strategy = VersioningStrategy.create(
        '{git-tag}+{commit-count}-{commit-hash:8}',
        {
          gitTag: { stripPrefix: 'v' },
          commitCount: { countFrom: 'since-tag' },
        },
      );
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'main',
          tag: 'v1.2.3',
          commitsSinceTag: 5,
          commitCount: 105,
        },
        environment: 'production',
        deployedBy: 'github-actions',
      };

      const versionInfo = await computer.computeVersionInfo(context);

      expect(versionInfo.version).toBe('1.2.3+5-12345678');
      expect(versionInfo.taggedRelease()).toBe(false);
      expect(versionInfo.commitsSinceTag).toBe(5);
    });

    it('should create version info from package.json strategy', async () => {
      const strategy = VersioningStrategy.packageJson();
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'feature/test',
          commitCount: 100,
          packageVersion: '1.2.3-beta.1',
        },
        environment: 'development',
        deployedBy: 'github-actions',
      };

      const versionInfo = await computer.computeVersionInfo(context);

      expect(versionInfo.version).toBe('1.2.3-beta.1');
      expect(versionInfo.mainBranch()).toBe(false);
      expect(versionInfo.packageVersion).toBe('1.2.3-beta.1');
    });
  });

  describe('Configuration Integration', () => {
    it('should configure CloudFormation-only outputs', () => {
      const config = VersioningConfigurations.custom({
        strategy: VersioningStrategy.gitTag(),
        outputs: VersioningOutputs.cloudFormationOnly({
          format: 'structured',
          stackOutputName: 'DeploymentInfo',
          exportName: 'MyApp-Version',
        }),
      });

      expect(config.outputs.cloudFormation).toEqual({
        enabled: true,
        stackOutputName: 'DeploymentInfo',
        exportName: 'MyApp-Version',
      });
      expect(config.outputs.parameterStore).toEqual({
        enabled: false,
        parameterName: '',
      });
      expect(config.outputs.format).toBe('structured');
    });

    it('should configure hierarchical parameter store', () => {
      const config = VersioningConfigurations.custom({
        strategy: VersioningStrategy.gitTag(),
        outputs: VersioningOutputs.hierarchicalParameters('/myapp/{stage}/version', {
          format: 'structured',
          includeCloudFormation: true,
        }),
      });

      expect(config.outputs.cloudFormation).toEqual({
        enabled: true,
      });
      expect(config.outputs.parameterStore).toEqual({
        enabled: true,
        parameterName: '/myapp/{stage}/version',
        hierarchical: true,
        splitParameters: true,
      });
      expect(config.outputs.format).toBe('structured');
    });
  });

  describe('Version Info Serialization', () => {
    it('should serialize and deserialize version info', () => {
      const originalInfo = VersionInfo.create({
        version: '1.2.3',
        commitHash: '1234567890abcdef',
        commitHashShort: '12345678',
        branch: 'main',
        tag: 'v1.2.3',
        commitsSinceTag: 0,
        commitCount: 100,
        packageVersion: '1.2.3',
        deployedAt: '2024-01-01T00:00:00Z',
        deployedBy: 'github-actions',
        buildNumber: '123',
        environment: 'production',
        repository: 'owner/repo',
        pipelineVersion: '1.0.0',
      });

      const json = originalInfo.toJson();
      const deserializedInfo = VersionInfo.fromJson(json);

      expect(deserializedInfo.version).toBe(originalInfo.version);
      expect(deserializedInfo.commitHash).toBe(originalInfo.commitHash);
      expect(deserializedInfo.tag).toBe(originalInfo.tag);
      expect(deserializedInfo.commitsSinceTag).toBe(originalInfo.commitsSinceTag);
      expect(deserializedInfo.commitCount).toBe(originalInfo.commitCount);
      expect(deserializedInfo.packageVersion).toBe(originalInfo.packageVersion);
      expect(deserializedInfo.deployedAt).toBe(originalInfo.deployedAt);
      expect(deserializedInfo.deployedBy).toBe(originalInfo.deployedBy);
      expect(deserializedInfo.buildNumber).toBe(originalInfo.buildNumber);
      expect(deserializedInfo.environment).toBe(originalInfo.environment);
      expect(deserializedInfo.repository).toBe(originalInfo.repository);
      expect(deserializedInfo.pipelineVersion).toBe(originalInfo.pipelineVersion);
    });

    it('should handle version info from environment variables', () => {
      const env = {
        VERSION: '1.2.3',
        GITHUB_SHA: '1234567890abcdef',
        GITHUB_REF_NAME: 'main',
        GIT_TAG: 'v1.2.3',
        COMMITS_SINCE_TAG: '0',
        GIT_COMMIT_COUNT: '100',
        PACKAGE_VERSION: '1.2.3',
        GITHUB_ACTOR: 'github-actions',
        GITHUB_RUN_NUMBER: '123',
        STAGE: 'production',
        GITHUB_REPOSITORY: 'owner/repo',
        PIPELINE_VERSION: '1.0.0',
      };

      const versionInfo = VersionInfo.fromEnvironment(env);
      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.commitHash).toBe('1234567890abcdef');
      expect(versionInfo.commitHashShort).toBe('12345678');
      expect(versionInfo.branch).toBe('main');
      expect(versionInfo.tag).toBe('v1.2.3');
      expect(versionInfo.commitsSinceTag).toBe(0);
      expect(versionInfo.commitCount).toBe(100);
      expect(versionInfo.packageVersion).toBe('1.2.3');
      expect(versionInfo.deployedBy).toBe('github-actions');
      expect(versionInfo.buildNumber).toBe('123');
      expect(versionInfo.environment).toBe('production');
      expect(versionInfo.repository).toBe('owner/repo');
      expect(versionInfo.pipelineVersion).toBe('1.0.0');
    });
  });

  describe('Parameter Name Generation', () => {
    it('should generate parameter names with templates', () => {
      const versionInfo = VersionInfo.create({
        version: '1.2.3',
        commitHash: '1234567890abcdef',
        commitHashShort: '12345678',
        branch: 'main',
        commitCount: 100,
        deployedAt: '2024-01-01T00:00:00Z',
        deployedBy: 'github-actions',
        environment: 'production',
      });

      const parameterName = versionInfo.parameterName('/myapp/{stage}/version/{branch}');
      expect(parameterName).toBe('/myapp/production/version/main');

      const exportName = versionInfo.exportName('MyApp-{stage}-{version}');
      expect(exportName).toBe('MyApp-production-1.2.3');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle feature branch deployment to development', async () => {
      const strategy = VersioningStrategy.create(
        '{branch}-{commit-count}-{commit-hash:8}',
        {
          commitCount: { countFrom: 'all' },
        },
      );
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'feature/awesome-feature',
          commitCount: 75,
        },
        environment: 'development',
        deployedBy: 'github-actions',
      };

      const versionInfo = await computer.computeVersionInfo(context);
      expect(versionInfo.version).toBe('feature/awesome-feature-75-12345678');
      expect(versionInfo.mainBranch()).toBe(false);
      expect(versionInfo.taggedRelease()).toBe(false);
    });

    it('should handle release candidate deployment to staging', async () => {
      const strategy = VersioningStrategy.create(
        '{package-version}-rc{commit-count}',
        {
          packageJson: {},
          commitCount: { countFrom: 'all' },
        },
      );
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'release/1.2.3',
          commitCount: 25,
          packageVersion: '1.2.3-rc.1',
        },
        environment: 'staging',
        deployedBy: 'github-actions',
      };

      const versionInfo = await computer.computeVersionInfo(context);
      expect(versionInfo.version).toBe('1.2.3-rc.1-rc25');
      expect(versionInfo.packageVersion).toBe('1.2.3-rc.1');
    });

    it('should handle production deployment with git tag', async () => {
      const strategy = VersioningStrategy.gitTag({ stripPrefix: 'v' });
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'main',
          tag: 'v1.2.3',
          commitsSinceTag: 0,
          commitCount: 100,
        },
        environment: 'production',
        deployedBy: 'github-actions',
      };

      const versionInfo = await computer.computeVersionInfo(context);
      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.taggedRelease()).toBe(true);
      expect(versionInfo.mainBranch()).toBe(true);
    });

    it('should handle build number strategy', async () => {
      const strategy = VersioningStrategy.buildNumber({ prefix: 'build' });
      const computer = new VersionComputer(strategy);

      const context: ComputationContext = {
        gitInfo: {
          commitHash: '1234567890abcdef',
          commitHashShort: '12345678',
          branch: 'main',
          commitCount: 42,
        },
        environment: 'production',
        deployedBy: 'github-actions',
      };

      const versionInfo = await computer.computeVersionInfo(context);
      expect(versionInfo.version).toBe('build-00042-12345678');
    });
  });
});