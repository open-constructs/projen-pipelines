import { GitHubProject, GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';
import { AssignApprover, AssignApproverOptions } from './base';

export interface GitHubAssignApproverOptions extends AssignApproverOptions {

  /**
   * runner tags to use to select runners
   *
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

}

export class GitHubAssignApprover extends AssignApprover {
  private readonly workflow: GithubWorkflow;
  private readonly options: GitHubAssignApproverOptions;

  constructor(scope: GitHubProject, options: GitHubAssignApproverOptions) {
    super(scope, options);
    this.options = options;

    // Initialize the deployment workflow on GitHub.
    this.workflow = scope.github!.addWorkflow('assign-approver');
    this.workflow.on({
      pullRequestTarget: {
        types: ['opened', 'ready_for_review'],
      },
    });

    this.setupWorkflow();
  }

  /**
   * Get the required permissions for the GitHub workflow
   */
  public renderPermissions(): JobPermissions {
    return {
      pullRequests: JobPermission.WRITE,
    };
  }

  protected setupWorkflow(): void {
    const runnerTags = this.options.runnerTags ?? ['ubuntu-latest'];

    const approverMappingScript = this.generateApproverMappingScript();

    this.workflow.addJob('assign-approver', {
      runsOn: runnerTags,
      permissions: this.renderPermissions(),
      steps: [
        {
          name: 'Assign approver based on author',
          uses: 'actions/github-script@v7',
          with: {
            script: approverMappingScript,
          },
        },
      ],
    });
  }

  protected generateApproverMappingScript(): string {
    const mappingEntries = this.baseOptions.approverMapping
      .map(mapping => `  '${mapping.author}': [${mapping.approvers.map(a => `'${a}'`).join(', ')}]`)
      .join(',\n');

    const defaultApprovers = this.baseOptions.defaultApprovers
      .map(a => `'${a}'`)
      .join(', ');

    return `const author = context.payload.pull_request.user.login;

// Define approver mapping
const approverMapping = {
${mappingEntries}${mappingEntries.length > 0 ? ',' : ''}
  'default': [${defaultApprovers}] // Default approver(s) if author not in mapping
};

// Get approvers for the PR author
const approvers = approverMapping[author] || approverMapping['default'];

// Filter out the author from approvers list (can't approve own PR)
const filteredApprovers = approvers.filter(approver => approver !== author);

if (filteredApprovers.length > 0) {
  // Request reviews from the approvers
  await github.rest.pulls.requestReviewers({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
    reviewers: filteredApprovers
  });
  
  console.log(\`Assigned reviewers: \${filteredApprovers.join(', ')}\`);
} else {
  console.log('No eligible reviewers found for this PR author');
}`;
  }
}
