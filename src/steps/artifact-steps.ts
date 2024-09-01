import { Project } from 'projen';
import { GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

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
        uses: 'actions/download-artifact@v4',
        with: {
          name: this.config.name,
          path: this.config.path,
        },
      }],
      needs: [],
      env: {},
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
        uses: 'actions/upload-artifact@v4',
        with: {
          name: this.config.name,
          path: this.config.path,
        },
      }],
      needs: [],
      env: {},
    };
  }

}