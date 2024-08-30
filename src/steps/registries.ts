import { Project } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { GithubStepConfig, PipelineStep } from './step';

export interface GithubPackagesLoginStepOptions {
  /**
   * Whether or not to grant the step write permissions to the registry.
   *
   * @default false
   */
  readonly write?: boolean;
}

export class GithubPackagesLoginStep extends PipelineStep {

  constructor(project: Project, private options: GithubPackagesLoginStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      env: {},
      needs: [],
      steps: [{
        run: 'echo "GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}" >> $GITHUB_ENV',
      }],
      permissions: { packages: this.options.write ? JobPermission.WRITE : JobPermission.READ },
    };
  }
}