import { GitHubActionsProvider } from 'projen/lib/github/actions-provider';
import { Project } from 'projen/lib/project';
import { CodeCatalystWorkflow } from './workflow';

export class CodeCatalyst {

  project: Project;
  projenCredentials: any;
  actions: any;
  workflowsEnabled: boolean | undefined = true;

  // constructor(project: Project, options: CodeCatalystProps = {}) {
  constructor(project: Project) {
    this.project = project;
    this.actions = new GitHubActionsProvider();
  }

  addWorkflow(workflowName: string): CodeCatalystWorkflow {
    return new CodeCatalystWorkflow(this, workflowName);
  }
}