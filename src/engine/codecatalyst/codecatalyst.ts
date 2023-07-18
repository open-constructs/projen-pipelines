import { Project } from 'projen/lib/project';
import { CodeCatalystWorkflow } from './workflow';

export class CodeCatalyst {

  project: Project = new Project({ name: 'CodeCatalyst Project' });
  projenCredentials: any;
  actions: any;
  workflowsEnabled: boolean | undefined = true;

  addWorkflow(workflowName: string) : CodeCatalystWorkflow {
    return new CodeCatalystWorkflow(this, workflowName);
  }
}