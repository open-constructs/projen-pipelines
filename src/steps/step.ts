import { Project } from 'projen';
import { JobStep } from 'projen/lib/github/workflows-model';
import { Need } from 'projen/lib/gitlab';

export interface GitlabStep {
  readonly extensions: string[];
  readonly needs: Need[];
  readonly commands: string[];
}

export interface GithubStep {
  readonly needs: string[];
  readonly steps: JobStep[];
}

export interface BashStep {
  readonly commands: string[];
}

export abstract class PipelineStep {

  constructor(protected project: Project) {
    //
  }

  public abstract toGitlab(): GitlabStep;
  public abstract toGithub(): GithubStep;
  public abstract toBash(): BashStep;

}