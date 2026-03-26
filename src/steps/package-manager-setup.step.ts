import { Project } from 'projen';
import { GithubStepConfig, PipelineStep } from './step';

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
