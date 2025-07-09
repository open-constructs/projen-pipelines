import { VersioningStrategy } from '../../src/versioning/strategy';

describe('VersioningStrategy', () => {
  describe('gitTag', () => {
    it('should create a git tag strategy', () => {
      const strategy = VersioningStrategy.gitTag();
      expect(strategy.format).toBe('{git-tag}');
      expect(strategy.components.gitTag).toEqual({ stripPrefix: 'v' });
      expect(strategy.components.commitCount).toEqual({ countFrom: 'all' });
    });

    it('should create a git tag strategy with custom config', () => {
      const config = {
        annotatedOnly: true,
        stripPrefix: 'release-',
        includeSinceTag: true,
      };
      const strategy = VersioningStrategy.gitTag(config);
      expect(strategy.format).toBe('{git-tag}');
      expect(strategy.components.gitTag).toEqual(config);
      expect(strategy.components.commitCount).toEqual({ countFrom: 'all' });
    });
  });

  describe('packageJson', () => {
    it('should create a package.json strategy', () => {
      const strategy = VersioningStrategy.packageJson();
      expect(strategy.format).toBe('{package-version}');
      expect(strategy.components.packageJson).toEqual({});
    });

    it('should create a package.json strategy with custom config', () => {
      const config = {
        path: './package.json',
        includePrerelease: true,
        appendCommitInfo: true,
      };
      const strategy = VersioningStrategy.packageJson(config);
      expect(strategy.format).toBe('{package-version}');
      expect(strategy.components.packageJson).toEqual(config);
    });
  });

  describe('commitCount', () => {
    it('should create a commit count strategy', () => {
      const strategy = VersioningStrategy.commitCount();
      expect(strategy.format).toBe('{commit-count}');
      expect(strategy.components.commitCount).toEqual({ countFrom: 'all' });
    });

    it('should create a commit count strategy with custom config', () => {
      const config = {
        countFrom: 'all' as const,
        includeBranch: true,
        padding: 5,
      };
      const strategy = VersioningStrategy.commitCount(config);
      expect(strategy.format).toBe('{commit-count}');
      expect(strategy.components.commitCount).toEqual(config);
    });
  });

  describe('commitHash', () => {
    it('should create a commit hash strategy', () => {
      const strategy = VersioningStrategy.commitHash();
      expect(strategy.format).toBe('{commit-hash}');
      expect(strategy.components).toEqual({});
    });
  });

  describe('create', () => {
    it('should create a custom composite strategy', () => {
      const format = '{git-tag}+{commit-count}-{commit-hash:8}';
      const components = {
        gitTag: { stripPrefix: 'v' },
        commitCount: { countFrom: 'since-tag' as const },
      };

      const strategy = VersioningStrategy.create(format, components);
      expect(strategy.format).toBe(format);
      expect(strategy.components).toEqual(components);
    });
  });

  describe('buildNumber', () => {
    it('should create a build number strategy with default prefix', () => {
      const strategy = VersioningStrategy.buildNumber();
      expect(strategy.format).toBe('build-{commit-count}-{commit-hash:8}');
      expect(strategy.components.commitCount).toEqual({ countFrom: 'all', padding: 5 });
    });

    it('should create a build number strategy with custom prefix', () => {
      const config = {
        prefix: 'release',
        commitCount: { countFrom: 'branch' as const, padding: 3 },
      };

      const strategy = VersioningStrategy.buildNumber(config);
      expect(strategy.format).toBe('release-{commit-count}-{commit-hash:8}');
      expect(strategy.components.commitCount).toEqual({ countFrom: 'branch', padding: 3 });
    });
  });
});