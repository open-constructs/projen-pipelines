import { Project } from 'projen';
import { BashStepConfig, CodeCatalystStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

export interface SetEnvStepOptions {
  readonly name: string;
  readonly command: string;
}

export class SetEnvStep extends PipelineStep {
  constructor(project: Project, protected options: SetEnvStepOptions) {
    super(project);
  }

  public toBash(): BashStepConfig {
    return {
      commands: [`export ${this.options.name}=$(${this.options.command})`],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      env: {},
      needs: [],
      commands: [`export ${this.options.name}=$(${this.options.command})`],
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      env: {},
      needs: [],
      extensions: [],
      commands: [`export ${this.options.name}=$(${this.options.command})`],
    };
  }

  public toGithub(): GithubStepConfig {
    return {
      env: {},
      needs: [],
      permissions: {},
      steps: [
        {
          run: `echo "${this.options.name}=$(${this.options.command})" >> $GITHUB_ENV`,
        },
      ],
    };
  }
}