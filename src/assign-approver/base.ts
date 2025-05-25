import { Component, Project } from 'projen';

export interface ApproverMapping {

  readonly author: string;
  readonly approvers: string[];

}

export interface AssignApproverOptions {

  /**
   * The mapping of authors to approvers.
   */
  readonly approverMapping: ApproverMapping[];

  /**
   * The GitHub token to use for the API calls.
   */
  readonly defaultApprovers: string[];

}

export abstract class AssignApprover extends Component {


  constructor(scope: Project, protected readonly baseOptions: AssignApproverOptions) {
    super(scope);
  }

}