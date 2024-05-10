import { Component, Project } from "projen";
import { GitHubProject, GithubWorkflow } from "projen/lib/github";

interface GithubWinglangPipelineOptions {
  readonly stages: string[];
  readonly target: "tf-aws";
}

class GithubWinglangPipeline extends Component {
  readonly worklfow: GithubWorkflow;
  constructor(scope: GitHubProject, options: GithubWinglangPipelineOptions) {
    super(scope);

    this.worklfow = scope.github!.addWorkflow("deploy");

    this.worklfow.on({
      push: {
        branches: ["main"],
      },
      workflowDispatch: {},
    });
  }

  private createCompile {
    
  }
}
