import { VersionInfo, VersionInfoBuilder } from '../../src/versioning/version-info';

describe('VersionInfo', () => {
  const sampleVersionInfo = {
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
  };

  describe('create', () => {
    it('should create a VersionInfo instance', () => {
      const versionInfo = VersionInfo.create(sampleVersionInfo);
      expect(versionInfo).toBeInstanceOf(VersionInfo);
      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.commitHash).toBe('1234567890abcdef');
      expect(versionInfo.commitHashShort).toBe('12345678');
      expect(versionInfo.branch).toBe('main');
      expect(versionInfo.tag).toBe('v1.2.3');
      expect(versionInfo.commitsSinceTag).toBe(0);
      expect(versionInfo.commitCount).toBe(100);
    });
  });

  describe('fromEnvironment', () => {
    it('should create from environment variables', () => {
      const env = {
        VERSION: '1.2.3',
        GIT_COMMIT_HASH: '1234567890abcdef',
        GIT_BRANCH: 'main',
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
      expect(versionInfo.deployedBy).toBe('github-actions');
      expect(versionInfo.buildNumber).toBe('123');
      expect(versionInfo.environment).toBe('production');
      expect(versionInfo.repository).toBe('owner/repo');
    });

    it('should use defaults when environment variables are missing', () => {
      const env = {};
      const versionInfo = VersionInfo.fromEnvironment(env);
      expect(versionInfo.version).toBe('0.0.0');
      expect(versionInfo.commitHash).toBe('');
      expect(versionInfo.commitHashShort).toBe('');
      expect(versionInfo.branch).toBe('unknown');
      expect(versionInfo.commitCount).toBe(0);
      expect(versionInfo.deployedBy).toBe('unknown');
      expect(versionInfo.environment).toBe('unknown');
    });

    it('should prefer GITHUB_SHA over GIT_COMMIT_HASH', () => {
      const env = {
        GIT_COMMIT_HASH: '1111111111111111',
        GITHUB_SHA: '2222222222222222',
      };
      const versionInfo = VersionInfo.fromEnvironment(env);
      expect(versionInfo.commitHash).toBe('2222222222222222');
      expect(versionInfo.commitHashShort).toBe('22222222');
    });
  });

  describe('fromJson', () => {
    it('should create from JSON string', () => {
      const json = JSON.stringify(sampleVersionInfo);
      const versionInfo = VersionInfo.fromJson(json);
      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.commitHash).toBe('1234567890abcdef');
      expect(versionInfo.tag).toBe('v1.2.3');
    });

    it('should throw error for invalid JSON', () => {
      expect(() => VersionInfo.fromJson('invalid-json')).toThrow();
    });
  });

  describe('toString', () => {
    it('should return version string', () => {
      const versionInfo = VersionInfo.create(sampleVersionInfo);
      expect(versionInfo.toString()).toBe('1.2.3');
    });
  });

  describe('toJson', () => {
    it('should serialize to JSON', () => {
      const versionInfo = VersionInfo.create(sampleVersionInfo);
      const json = versionInfo.toJson();
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.2.3');
      expect(parsed.commitHash).toBe('1234567890abcdef');
      expect(parsed.tag).toBe('v1.2.3');
    });

    it('should serialize to pretty JSON', () => {
      const versionInfo = VersionInfo.create(sampleVersionInfo);
      const json = versionInfo.toJson(true);
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('should exclude undefined values', () => {
      const minimalInfo = {
        version: '1.2.3',
        commitHash: '1234567890abcdef',
        commitHashShort: '12345678',
        branch: 'main',
        commitCount: 100,
        deployedAt: '2024-01-01T00:00:00Z',
        deployedBy: 'github-actions',
        environment: 'production',
      };
      const versionInfo = VersionInfo.create(minimalInfo);
      const json = versionInfo.toJson();
      const parsed = JSON.parse(json);
      expect(parsed.tag).toBeUndefined();
      expect(parsed.commitsSinceTag).toBeUndefined();
      expect(parsed.packageVersion).toBeUndefined();
    });
  });

  describe('toObject', () => {
    it('should convert to object', () => {
      const versionInfo = VersionInfo.create(sampleVersionInfo);
      const obj = versionInfo.toObject();
      expect(obj.version).toBe('1.2.3');
      expect(obj.commitHash).toBe('1234567890abcdef');
      expect(obj.tag).toBe('v1.2.3');
    });
  });

  describe('getDisplayVersion', () => {
    it('should return tag for tagged release', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        tag: 'v1.2.3',
        commitsSinceTag: 0,
      });
      expect(versionInfo.getDisplayVersion()).toBe('v1.2.3');
    });

    it('should return version for non-tagged release', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        tag: 'v1.2.3',
        commitsSinceTag: 5,
      });
      expect(versionInfo.getDisplayVersion()).toBe('1.2.3');
    });

    it('should return version when no tag', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        tag: undefined,
      });
      expect(versionInfo.getDisplayVersion()).toBe('1.2.3');
    });
  });

  describe('isTaggedRelease', () => {
    it('should return true for tagged release', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        tag: 'v1.2.3',
        commitsSinceTag: 0,
      });
      expect(versionInfo.isTaggedRelease()).toBe(true);
    });

    it('should return false for non-tagged release', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        tag: 'v1.2.3',
        commitsSinceTag: 5,
      });
      expect(versionInfo.isTaggedRelease()).toBe(false);
    });

    it('should return false when no tag', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        tag: undefined,
      });
      expect(versionInfo.isTaggedRelease()).toBe(false);
    });
  });

  describe('isMainBranch', () => {
    it('should return true for main branch', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        branch: 'main',
      });
      expect(versionInfo.isMainBranch()).toBe(true);
    });

    it('should return true for master branch', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        branch: 'master',
      });
      expect(versionInfo.isMainBranch()).toBe(true);
    });

    it('should return false for other branches', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        branch: 'feature/test',
      });
      expect(versionInfo.isMainBranch()).toBe(false);
    });
  });

  describe('compare', () => {
    it('should compare by commit count first', () => {
      const version1 = VersionInfo.create({
        ...sampleVersionInfo,
        commitCount: 100,
        version: '1.2.3',
      });
      const version2 = VersionInfo.create({
        ...sampleVersionInfo,
        commitCount: 200,
        version: '1.2.2',
      });
      expect(version1.compare(version2)).toBe(-1);
      expect(version2.compare(version1)).toBe(1);
    });

    it('should compare by version string when commit counts are equal', () => {
      const version1 = VersionInfo.create({
        ...sampleVersionInfo,
        commitCount: 100,
        version: '1.2.3',
      });
      const version2 = VersionInfo.create({
        ...sampleVersionInfo,
        commitCount: 100,
        version: '1.2.4',
      });
      expect(version1.compare(version2)).toBe(-1);
      expect(version2.compare(version1)).toBe(1);
    });

    it('should return 0 for equal versions', () => {
      const version1 = VersionInfo.create(sampleVersionInfo);
      const version2 = VersionInfo.create(sampleVersionInfo);
      expect(version1.compare(version2)).toBe(0);
    });
  });

  describe('getParameterName', () => {
    it('should replace template variables', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        environment: 'prod',
        branch: 'main',
        version: '1.2.3',
      });
      const template = '/myapp/{stage}/version/{branch}';
      const result = versionInfo.getParameterName(template);
      expect(result).toBe('/myapp/prod/version/main');
    });
  });

  describe('getExportName', () => {
    it('should replace template variables', () => {
      const versionInfo = VersionInfo.create({
        ...sampleVersionInfo,
        environment: 'prod',
        version: '1.2.3',
      });
      const template = 'MyApp-{stage}-{version}';
      const result = versionInfo.getExportName(template);
      expect(result).toBe('MyApp-prod-1.2.3');
    });
  });
});

describe('VersionInfoBuilder', () => {
  it('should build version info with all fields', () => {
    const builder = new VersionInfoBuilder();
    const versionInfo = builder
      .version('1.2.3')
      .gitInfo({
        commitHash: '1234567890abcdef',
        branch: 'main',
        tag: 'v1.2.3',
        commitsSinceTag: 0,
        commitCount: 100,
      })
      .packageVersion('1.2.3')
      .deploymentInfo({
        environment: 'production',
        deployedBy: 'github-actions',
        buildNumber: '123',
      })
      .repository('owner/repo')
      .pipelineVersion('1.0.0')
      .build();

    expect(versionInfo.version).toBe('1.2.3');
    expect(versionInfo.commitHash).toBe('1234567890abcdef');
    expect(versionInfo.commitHashShort).toBe('12345678');
    expect(versionInfo.branch).toBe('main');
    expect(versionInfo.tag).toBe('v1.2.3');
    expect(versionInfo.commitsSinceTag).toBe(0);
    expect(versionInfo.commitCount).toBe(100);
    expect(versionInfo.packageVersion).toBe('1.2.3');
    expect(versionInfo.environment).toBe('production');
    expect(versionInfo.deployedBy).toBe('github-actions');
    expect(versionInfo.buildNumber).toBe('123');
    expect(versionInfo.repository).toBe('owner/repo');
    expect(versionInfo.pipelineVersion).toBe('1.0.0');
  });

  it('should throw error when required fields are missing', () => {
    const builder = new VersionInfoBuilder();
    expect(() => builder.build()).toThrow('Version is required');
  });

  it('should throw error when commit hash is missing', () => {
    const builder = new VersionInfoBuilder();
    expect(() => builder.version('1.2.3').build()).toThrow('Commit hash is required');
  });

  it('should throw error when branch is missing', () => {
    const builder = new VersionInfoBuilder();
    expect(() => builder
      .version('1.2.3')
      .gitInfo({
        commitHash: '1234567890abcdef',
        branch: '',
        commitCount: 100,
      })
      .build()).toThrow('Branch is required');
  });

  it('should throw error when commit count is missing', () => {
    const builder = new VersionInfoBuilder();
    expect(() => builder
      .version('1.2.3')
      .gitInfo({
        commitHash: '1234567890abcdef',
        branch: 'main',
        commitCount: undefined as any,
      })
      .build()).toThrow('Commit count is required');
  });

  it('should throw error when environment is missing', () => {
    const builder = new VersionInfoBuilder();
    expect(() => builder
      .version('1.2.3')
      .gitInfo({
        commitHash: '1234567890abcdef',
        branch: 'main',
        commitCount: 100,
      })
      .build()).toThrow('Environment is required');
  });

  it('should use defaults for optional fields', () => {
    const builder = new VersionInfoBuilder();
    const versionInfo = builder
      .version('1.2.3')
      .gitInfo({
        commitHash: '1234567890abcdef',
        branch: 'main',
        commitCount: 100,
      })
      .deploymentInfo({
        environment: 'production',
      })
      .build();

    expect(versionInfo.deployedBy).toBe('unknown');
    expect(versionInfo.deployedAt).toBeTruthy();
  });
});