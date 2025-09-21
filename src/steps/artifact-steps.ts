import { Project } from 'projen';
import { CodeCatalystStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

export interface DownloadArtifactStepConfig {
  readonly name: string;
  readonly path: string;
}

export class DownloadArtifactStep extends PipelineStep {

  constructor(project: Project, private readonly config: DownloadArtifactStepConfig) {
    super(project);
  }

  public toGitlab(): GitlabStepConfig {
    // Nothing to do; artifact is already downloaded for you
    return {
      env: {},
      extensions: [],
      needs: [],
      commands: [],
    };
  }
  public toGithub(): GithubStepConfig {
    return {
      steps: [{
        name: 'Download Artifact',
        uses: 'actions/download-artifact@v5',
        with: {
          name: this.config.name,
          path: this.config.path,
        },
      }],
      needs: [],
      env: {},
    };
  }

  /**
   * Converts the step into a CodeCatalyst Actions step configuration.
   */
  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      needs: [], // No dependencies.
      commands: [], // Maps each command into a CodeCatalyst Action job step.
      env: {}, // No environment variables.
    };
  }
}


export interface UploadArtifactStepConfig {
  readonly name: string;
  readonly path: string;
}

export class UploadArtifactStep extends PipelineStep {

  constructor(project: Project, private readonly config: UploadArtifactStepConfig) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [{
        name: 'Upload Artifact',
        uses: 'actions/upload-artifact@v4.6.2',
        with: {
          name: this.config.name,
          path: this.config.path,
        },
      }],
      needs: [],
      env: {},
    };
  }

  /**
   * Converts the step into a CodeCatalyst Actions step configuration.
   */
  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      needs: [], // No dependencies.
      commands: [], // Maps each command into a CodeCatalyst Action job step.
      env: {}, // No environment variables.
    };
  }

}