import { Project } from 'projen';
import { BashStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

/**
 * Options for the PnpmSetupStep.
 */
export interface PnpmSetupStepOptions {
  /**
   * The version of pnpm to install.
   * If not provided, defaults to '9'.
   */
  readonly version?: string;
}

/**
 * Step to setup pnpm using the pnpm/action-setup GitHub Action.
 *
 * This step is automatically injected when a project uses pnpm as its package manager.
 * It ensures pnpm is available in the GitHub Actions workflow environment before
 * running any install commands.
 */
export class PnpmSetupStep extends PipelineStep {

  constructor(project: Project, private options: PnpmSetupStepOptions = {}) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      env: {},
      needs: [],
      steps: [{
        name: 'Setup pnpm',
        uses: 'pnpm/action-setup@v4',
        with: {
          version: this.options.version ?? '9',
        },
      }],
    };
  }
}

/**
 * Step to enable corepack for Yarn Berry support.
 *
 * This step is automatically injected when a project uses Yarn Berry as its package manager.
 * It ensures corepack is enabled in the CI environment before running any yarn commands,
 * which is required for Yarn Berry (v2+) to work correctly.
 */
export class CorepackSetupStep extends PipelineStep {

  constructor(project: Project) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      env: {},
      needs: [],
      steps: [{
        name: 'Enable corepack',
        run: 'corepack enable',
      }],
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: ['corepack enable'],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: ['corepack enable'],
    };
  }
}
