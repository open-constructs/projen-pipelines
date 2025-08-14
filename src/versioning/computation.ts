import { VersioningStrategy } from './strategy';
import { IVersioningStrategy } from './types';
import { VersionInfo } from './version-info';

/**
 * Git information extracted from repository
 */
export interface GitInfo {
  readonly commitHash: string;
  readonly commitHashShort: string;
  readonly branch: string;
  readonly tag?: string;
  readonly commitsSinceTag?: number;
  readonly commitCount: number;
  readonly packageVersion?: string;
}

/**
 * Context for version computation
 */
export interface ComputationContext {
  readonly gitInfo: GitInfo;
  readonly environment: string;
  readonly deployedBy: string;
  readonly buildNumber?: string;
  readonly repository?: string;
  readonly pipelineVersion?: string;
}

/**
 * Base class for version computation strategies
 */
export abstract class VersionComputationStrategy {
  protected constructor(public readonly strategy: VersioningStrategy) { }

  /**
   * Compute version string from context
   */
  abstract computeVersion(context: ComputationContext): string;

  /**
   * Create VersionInfo from context
   */
  public createVersionInfo(context: ComputationContext): VersionInfo {
    const version = this.computeVersion(context);

    return VersionInfo.create({
      version,
      commitHash: context.gitInfo.commitHash,
      commitHashShort: context.gitInfo.commitHashShort,
      branch: context.gitInfo.branch,
      tag: context.gitInfo.tag,
      commitsSinceTag: context.gitInfo.commitsSinceTag,
      commitCount: context.gitInfo.commitCount,
      packageVersion: context.gitInfo.packageVersion,
      deployedAt: new Date().toISOString(),
      deployedBy: context.deployedBy,
      buildNumber: context.buildNumber,
      environment: context.environment,
      repository: context.repository,
      pipelineVersion: context.pipelineVersion,
    });
  }
}


/**
 * Composite version computation that combines multiple strategies
 */
export class CompositeComputation extends VersionComputationStrategy {
  constructor(
    strategy: VersioningStrategy,
  ) {
    super(strategy);
  }

  public computeVersion(context: ComputationContext): string {
    let result = this.strategy.format;
    const { gitInfo } = context;

    // Replace git tag variables
    if (this.strategy.components.gitTag) {
      let tagValue = gitInfo.tag ?? '0.0.0';
      if (this.strategy.components.gitTag.stripPrefix && gitInfo.tag) {
        tagValue = gitInfo.tag.replace(new RegExp(`^${this.strategy.components.gitTag.stripPrefix}`), '');
      }
      result = result.replace('{git-tag}', tagValue);
    }

    // Replace package version
    if (this.strategy.components.packageJson) {
      const packageValue = gitInfo.packageVersion ?? '0.0.0';
      result = result.replace('{package-version}', packageValue);
    }

    // Replace commit count
    if (this.strategy.components.commitCount) {
      let countValue: string;
      if (this.strategy.components.commitCount.countFrom === 'since-tag' && gitInfo.commitsSinceTag !== undefined) {
        countValue = gitInfo.commitsSinceTag.toString();
      } else {
        // Default to total commit count for 'all' or undefined
        countValue = gitInfo.commitCount.toString();
      }
      if (this.strategy.components.commitCount.padding) {
        countValue = countValue.padStart(this.strategy.components.commitCount.padding, '0');
      }
      result = result.replace('{commit-count}', countValue);
    }

    // Replace commit hash
    result = result.replace('{commit-hash}', gitInfo.commitHash);
    result = result.replace('{commit-hash:8}', gitInfo.commitHashShort);

    // Replace branch
    result = result.replace('{branch}', gitInfo.branch);

    // Replace build number
    if (context.buildNumber) {
      result = result.replace('{build-number}', context.buildNumber);
    }

    return result;
  }
}

/**
 * Main version computer that handles strategy selection
 */
export class VersionComputer {
  private readonly strategy: VersionComputationStrategy;

  constructor(
    strategy: IVersioningStrategy,
  ) {
    this.strategy = this.createStrategy(strategy);
  }

  /**
   * Compute version info from context
   */
  public async computeVersionInfo(context: ComputationContext): Promise<VersionInfo> {
    try {
      return this.strategy.createVersionInfo(context);
    } catch (error) {
      throw new Error(`Strategy '${this.strategy.strategy.format}' failed: ${error}`);
    }
  }

  /**
   * Create strategy instance from configuration
   */
  private createStrategy(strategy: IVersioningStrategy): VersionComputationStrategy {
    return new CompositeComputation(strategy);
  }
}
