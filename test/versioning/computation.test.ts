import {
  CompositeComputation,
  VersionComputer,
  ComputationContext,
  GitInfo,
} from '../../src/versioning/computation';
import { VersioningStrategy } from '../../src/versioning/strategy';

describe('CompositeComputation with VersioningStrategy', () => {
  const createContext = (gitInfo: Partial<GitInfo>): ComputationContext => ({
    gitInfo: {
      commitHash: '1234567890abcdef',
      commitHashShort: '12345678',
      branch: 'main',
      commitCount: 100,
      ...gitInfo,
    },
    environment: 'production',
    deployedBy: 'github-actions',
  });

  describe('Git Tag Strategy', () => {
    it('should return tag value', () => {
      const strategy = VersioningStrategy.gitTag();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        tag: 'v1.2.3',
        commitsSinceTag: 0,
      });

      const version = computation.computeVersion(context);
      expect(version).toBe('1.2.3');
    });

    it('should strip prefix from tag', () => {
      const strategy = VersioningStrategy.gitTag({ stripPrefix: 'release-' });
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        tag: 'release-1.2.3',
        commitsSinceTag: 0,
      });

      const version = computation.computeVersion(context);
      expect(version).toBe('1.2.3');
    });

    it('should fallback to default when no tag', () => {
      const strategy = VersioningStrategy.gitTag();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        tag: undefined,
        commitCount: 150,
      });

      const version = computation.computeVersion(context);
      expect(version).toBe('0.0.0');
    });

    it('should create version info', () => {
      const strategy = VersioningStrategy.gitTag();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        tag: 'v1.2.3',
        commitsSinceTag: 0,
      });

      const versionInfo = computation.createVersionInfo(context);
      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.commitHash).toBe('1234567890abcdef');
      expect(versionInfo.commitHashShort).toBe('12345678');
      expect(versionInfo.branch).toBe('main');
      expect(versionInfo.tag).toBe('v1.2.3');
      expect(versionInfo.commitsSinceTag).toBe(0);
      expect(versionInfo.commitCount).toBe(100);
      expect(versionInfo.environment).toBe('production');
      expect(versionInfo.deployedBy).toBe('github-actions');
    });
  });

  describe('Package JSON Strategy', () => {
    it('should return package version', () => {
      const strategy = VersioningStrategy.packageJson();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        packageVersion: '1.2.3',
      });

      const version = computation.computeVersion(context);
      expect(version).toBe('1.2.3');
    });

    it('should fallback to default when no package version', () => {
      const strategy = VersioningStrategy.packageJson();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        packageVersion: undefined,
        commitCount: 150,
      });

      const version = computation.computeVersion(context);
      expect(version).toBe('0.0.0');
    });

    it('should create version info', () => {
      const strategy = VersioningStrategy.packageJson();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        packageVersion: '1.2.3',
      });

      const versionInfo = computation.createVersionInfo(context);
      expect(versionInfo.version).toBe('1.2.3');
      expect(versionInfo.packageVersion).toBe('1.2.3');
    });
  });

  describe('Commit Count Strategy', () => {
    it('should return commit count', () => {
      const strategy = VersioningStrategy.commitCount();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        commitCount: 150,
      });

      const version = computation.computeVersion(context);
      expect(version).toBe('150');
    });

    it('should create version info', () => {
      const strategy = VersioningStrategy.commitCount();
      const computation = new CompositeComputation(strategy);
      const context = createContext({
        commitCount: 150,
      });

      const versionInfo = computation.createVersionInfo(context);
      expect(versionInfo.version).toBe('150');
      expect(versionInfo.commitCount).toBe(150);
    });
  });

  describe('Commit Hash Strategy', () => {
    it('should return full commit hash', () => {
      const strategy = VersioningStrategy.commitHash();
      const computation = new CompositeComputation(strategy);
      const context = createContext({});

      const version = computation.computeVersion(context);
      expect(version).toBe('1234567890abcdef');
    });

    it('should create version info', () => {
      const strategy = VersioningStrategy.commitHash();
      const computation = new CompositeComputation(strategy);
      const context = createContext({});

      const versionInfo = computation.createVersionInfo(context);
      expect(versionInfo.version).toBe('1234567890abcdef');
    });
  });
});

describe('CompositeComputation with Custom Format', () => {
  const createContext = (gitInfo: Partial<GitInfo>, buildNumber?: string): ComputationContext => ({
    gitInfo: {
      commitHash: '1234567890abcdef',
      commitHashShort: '12345678',
      branch: 'main',
      commitCount: 100,
      ...gitInfo,
    },
    environment: 'production',
    deployedBy: 'github-actions',
    buildNumber,
  });

  it('should replace git tag variables', () => {
    const strategy = VersioningStrategy.create(
      '{git-tag}+{commit-count}-{commit-hash:8}',
      {
        gitTag: { stripPrefix: 'v' },
        commitCount: { countFrom: 'since-tag' },
      },
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({
      tag: 'v1.2.3',
      commitsSinceTag: 5,
      commitCount: 105,
    });

    const version = computation.computeVersion(context);
    expect(version).toBe('1.2.3+5-12345678');
  });

  it('should use default tag when no tag present', () => {
    const strategy = VersioningStrategy.create(
      '{git-tag}+{commit-count}',
      {
        gitTag: {},
        commitCount: {},
      },
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({
      tag: undefined,
      commitCount: 105,
    });

    const version = computation.computeVersion(context);
    expect(version).toBe('0.0.0+105');
  });

  it('should replace package version variables', () => {
    const strategy = VersioningStrategy.create(
      '{package-version}-{commit-hash:8}',
      {
        packageJson: { appendCommitInfo: true },
      },
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({
      packageVersion: '1.2.3',
    });

    const version = computation.computeVersion(context);
    expect(version).toBe('1.2.3-12345678');
  });

  it('should use default package version when missing', () => {
    const strategy = VersioningStrategy.create(
      '{package-version}-{commit-hash:8}',
      {
        packageJson: {},
      },
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({
      packageVersion: undefined,
    });

    const version = computation.computeVersion(context);
    expect(version).toBe('0.0.0-12345678');
  });

  it('should replace commit count with padding', () => {
    const strategy = VersioningStrategy.create(
      '{commit-count}-{commit-hash:8}',
      {
        commitCount: { padding: 5 },
      },
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({
      commitCount: 42,
    });

    const version = computation.computeVersion(context);
    expect(version).toBe('00042-12345678');
  });

  it('should replace branch variable', () => {
    const strategy = VersioningStrategy.create(
      '{branch}-{commit-count}',
      {
        commitCount: {},
      },
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({
      branch: 'feature/test',
      commitCount: 42,
    });

    const version = computation.computeVersion(context);
    expect(version).toBe('feature/test-42');
  });

  it('should replace full commit hash', () => {
    const strategy = VersioningStrategy.create(
      '{commit-hash}',
      {},
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({});

    const version = computation.computeVersion(context);
    expect(version).toBe('1234567890abcdef');
  });

  it('should replace build number', () => {
    const strategy = VersioningStrategy.create(
      '{build-number}-{commit-hash:8}',
      {},
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({}, '123');

    const version = computation.computeVersion(context);
    expect(version).toBe('123-12345678');
  });

  it('should handle missing build number', () => {
    const strategy = VersioningStrategy.create(
      '{build-number}-{commit-hash:8}',
      {},
    );
    const computation = new CompositeComputation(strategy);

    const context = createContext({}, undefined);

    const version = computation.computeVersion(context);
    expect(version).toBe('{build-number}-12345678');
  });
});

describe('VersionComputer', () => {
  const createContext = (gitInfo: Partial<GitInfo>): ComputationContext => ({
    gitInfo: {
      commitHash: '1234567890abcdef',
      commitHashShort: '12345678',
      branch: 'main',
      commitCount: 100,
      ...gitInfo,
    },
    environment: 'production',
    deployedBy: 'github-actions',
  });

  it('should compute version info for git-tag strategy', async () => {
    const strategy = VersioningStrategy.gitTag();
    const computer = new VersionComputer(strategy);
    const context = createContext({
      tag: 'v1.2.3',
      commitsSinceTag: 0,
    });

    const versionInfo = await computer.computeVersionInfo(context);
    expect(versionInfo.version).toBe('1.2.3');
  });

  it('should compute version info for package-json strategy', async () => {
    const strategy = VersioningStrategy.packageJson();
    const computer = new VersionComputer(strategy);
    const context = createContext({
      packageVersion: '1.2.3',
    });

    const versionInfo = await computer.computeVersionInfo(context);
    expect(versionInfo.version).toBe('1.2.3');
  });

  it('should compute version info for commit-count strategy', async () => {
    const strategy = VersioningStrategy.commitCount();
    const computer = new VersionComputer(strategy);
    const context = createContext({
      commitCount: 150,
    });

    const versionInfo = await computer.computeVersionInfo(context);
    expect(versionInfo.version).toBe('150');
  });

  it('should compute version info for commit-hash strategy', async () => {
    const strategy = VersioningStrategy.commitHash();
    const computer = new VersionComputer(strategy);
    const context = createContext({});

    const versionInfo = await computer.computeVersionInfo(context);
    expect(versionInfo.version).toBe('1234567890abcdef');
  });

  it('should compute version info for custom composite strategy', async () => {
    const strategy = VersioningStrategy.create(
      '{git-tag}+{commit-count}',
      {
        gitTag: { stripPrefix: 'v' },
        commitCount: { countFrom: 'since-tag' },
      },
    );
    const computer = new VersionComputer(strategy);
    const context = createContext({
      tag: 'v1.2.3',
      commitsSinceTag: 5,
      commitCount: 105,
    });

    const versionInfo = await computer.computeVersionInfo(context);
    expect(versionInfo.version).toBe('1.2.3+5');
  });

  it('should throw error when strategy computation fails', async () => {
    const strategy = VersioningStrategy.gitTag();
    const computer = new VersionComputer(strategy);
    const context = createContext({});

    // Replace the strategy with a mock that throws an error
    (computer as any).strategy = {
      strategy: { format: 'test' },
      createVersionInfo: () => {
        throw new Error('Strategy failed');
      },
    };

    await expect(computer.computeVersionInfo(context)).rejects.toThrow('Strategy \'test\' failed:');
  });
});