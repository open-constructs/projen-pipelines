import { GitTagConfig, PackageJsonConfig, CommitCountConfig, IVersioningStrategy } from './types';


/**
 * Composite versioning strategy that combines multiple strategies
 */
export class VersioningStrategy implements IVersioningStrategy {

  private constructor(
    public readonly format: string,
    public readonly components: IVersioningStrategy['components'],
  ) {
    //
  }

  /**
   * Create a composite strategy with custom format and components
   */
  public static create(
    format: string,
    components: IVersioningStrategy['components'],
  ): VersioningStrategy {
    return new VersioningStrategy(format, components);
  }

  /**
   * Create a build number based strategy
   */
  public static buildNumber(config?: {
    prefix?: string;
    commitCount?: CommitCountConfig;
  }): VersioningStrategy {
    const prefix = config?.prefix ?? 'build';
    return new VersioningStrategy(`${prefix}-{commit-count}-{commit-hash:8}`, {
      commitCount: config?.commitCount ?? { countFrom: 'all', padding: 5 },
    });
  }

  public static gitTag(config?: GitTagConfig): VersioningStrategy {
    return new VersioningStrategy('{git-tag}', {
      gitTag: config ?? { stripPrefix: 'v' },
      commitCount: { countFrom: 'all' },
    });
  }

  public static packageJson(config?: PackageJsonConfig): VersioningStrategy {
    return new VersioningStrategy('{package-version}', { packageJson: config ?? {} });
  }

  public static commitCount(config?: CommitCountConfig): VersioningStrategy {
    return new VersioningStrategy('{commit-count}', {
      commitCount: config ?? { countFrom: 'all' },
    });
  }

  public static commitHash(): VersioningStrategy {
    return new VersioningStrategy('{commit-hash}', {});
  }

}
