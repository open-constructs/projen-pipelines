import { Project } from 'projen';
import { GitHubProject, GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { DriftDetectionWorkflow, DriftDetectionWorkflowOptions, DriftDetectionStageOptions } from './base';
import { DriftDetectionStep } from './step';

export interface GitHubDriftDetectionWorkflowOptions extends DriftDetectionWorkflowOptions {
  /**
   * Additional permissions for GitHub workflow
   */
  readonly permissions?: Record<string, string>;

  /**
   * Whether to create issues on drift detection
   * @default false
   */
  readonly createIssues?: boolean;
}

export class GitHubDriftDetectionWorkflow extends DriftDetectionWorkflow {
  private readonly permissions?: Record<string, string>;
  private readonly createIssues: boolean;
  private readonly workflow: GithubWorkflow;

  constructor(project: Project, options: GitHubDriftDetectionWorkflowOptions) {
    super(project, options);
    this.permissions = options.permissions;
    this.createIssues = options.createIssues ?? false;

    this.workflow = (this.project as GitHubProject).github!.addWorkflow('drift-detection');
    this.workflow.on({
      schedule: [{
        cron: this.schedule,
      }],
      workflowDispatch: {
        inputs: {
          stage: {
            description: 'Stage to check for drift (leave empty for all)',
            required: false,
            type: 'choice',
            options: this.stages.map(s => s.name),
          },
        },
      },
    });

    // Add job for each stage
    for (const stage of this.stages) {
      const jobId = `drift-${stage.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const driftStep = new DriftDetectionStep(this.project, stage).toGithub();

      this.workflow.addJob(jobId, {
        name: `Drift Detection - ${stage.name}`,
        runsOn: ['ubuntu-latest'],
        if: `\${{ github.event_name == 'schedule' || github.event.inputs.stage == '' || github.event.inputs.stage == '${stage.name}' }}`,
        env: driftStep.env,
        permissions: {
          contents: JobPermission.READ,
          ...(driftStep.permissions ?? {}),
          ...(this.createIssues ? { issues: JobPermission.WRITE } : {}),
          ...this.permissions,
        },
        steps: [
          {
            name: 'Checkout',
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': '20',
            },
          },
          {
            name: 'Install dependencies',
            run: 'npm ci',
          },
          ...driftStep.steps,
          {
            name: 'Upload results',
            uses: 'actions/upload-artifact@v4',
            with: {
              name: `drift-results-${stage.name}`,
              path: `drift-results-${stage.name}.json`,
            },
          },
          ...(this.createIssues ? [{
            name: 'Create Issue on Drift',
            if: 'steps.drift.outcome == \'failure\' && github.event_name == \'schedule\'',
            uses: 'actions/github-script@v7',
            with: {
              script: this.generateIssueCreationScript(stage),
            },
          }] : []),
        ],
      });
    }

    // Add summary job
    if (this.stages.length > 0) {
      this.workflow.addJob('drift-summary', {
        name: 'Drift Detection Summary',
        runsOn: ['ubuntu-latest'],
        permissions: {
          contents: JobPermission.READ,
        },
        needs: this.stages.map(stage => `drift-${stage.name}`),
        steps: [
          {
            name: 'Download all artifacts',
            uses: 'actions/download-artifact@v4',
            with: {
              path: 'drift-results',
            },
          },
          {
            name: 'Generate summary',
            run: this.generateSummaryScript(),
          },
        ],
      });
    }
  }

  private generateIssueCreationScript(stage: DriftDetectionStageOptions): string {
    return `
const fs = require('fs');
const resultsFile = 'drift-results-${stage.name}.json';

if (!fs.existsSync(resultsFile)) {
  console.log('No results file found');
  return;
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const driftedStacks = results.filter(r => r.driftStatus === 'DRIFTED');

if (driftedStacks.length === 0) {
  console.log('No drift detected');
  return;
}

const title = 'Drift Detected in ${stage.name}';
const body = \`## Drift Detection Report

**Stage:** ${stage.name}
**Region:** ${stage.region}
**Time:** \${new Date().toISOString()}

### Summary
- Total stacks checked: \${results.length}
- Drifted stacks: \${driftedStacks.length}

### Drifted Stacks
\${driftedStacks.map(stack => {
  const resources = stack.driftedResources || [];
  return \`#### \${stack.stackName}
- Drifted resources: \${resources.length}
\${resources.map(r => \`  - \${r.logicalResourceId} (\${r.resourceType})\`).join('\\n')}
\`;
}).join('\\n')}

### Action Required
Please review the drifted resources and either:
1. Update the infrastructure code to match the actual state
2. Restore the resources to match the expected state

[View workflow run](\${context.serverUrl}/\${context.repo.owner}/\${context.repo.repo}/actions/runs/\${context.runId})
\`;

// Check if issue already exists
const issues = await github.rest.issues.listForRepo({
  owner: context.repo.owner,
  repo: context.repo.repo,
  state: 'open',
  labels: ['drift-detection', '${stage.name}'],
});

if (issues.data.length === 0) {
  await github.rest.issues.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    title,
    body,
    labels: ['drift-detection', '${stage.name}'],
  });
} else {
  // Update existing issue
  const issue = issues.data[0];
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue.number,
    body: body,
  });
}
`;
  }

  private generateSummaryScript(): string {
    return `
#!/bin/bash
echo "## Drift Detection Summary" >> $GITHUB_STEP_SUMMARY
echo "" >> $GITHUB_STEP_SUMMARY

total_stacks=0
total_drifted=0
total_errors=0

for file in drift-results-*.json; do
  if [[ -f "$file" ]]; then
    stage=$(basename $(dirname "$file"))
    echo "### Stage: $stage" >> $GITHUB_STEP_SUMMARY
    
    # Parse JSON and generate summary
    jq -r '
      . as $results |
      "- Total stacks: " + ($results | length | tostring) + "\\n" +
      "- Drifted: " + ([$results[] | select(.driftStatus == "DRIFTED")] | length | tostring) + "\\n" +
      "- Errors: " + ([$results[] | select(.error)] | length | tostring) + "\\n" +
      ([$results[] | select(.driftStatus == "DRIFTED")] | 
        if length > 0 then
          "\\n**Drifted stacks:**\\n" + 
          (map("  - " + .stackName + " (" + ((.driftedResources // []) | length | tostring) + " resources)") | join("\\n"))
        else "" end)
    ' "$file" >> $GITHUB_STEP_SUMMARY
    
    echo "" >> $GITHUB_STEP_SUMMARY
    
    # Count totals
    total_stacks=$((total_stacks + $(jq 'length' "$file")))
    total_drifted=$((total_drifted + $(jq '[.[] | select(.driftStatus == "DRIFTED")] | length' "$file")))
    total_errors=$((total_errors + $(jq '[.[] | select(.error)] | length' "$file")))
  fi
done

echo "### Overall Summary" >> $GITHUB_STEP_SUMMARY
echo "- Total stacks checked: $total_stacks" >> $GITHUB_STEP_SUMMARY
echo "- Total drifted stacks: $total_drifted" >> $GITHUB_STEP_SUMMARY
echo "- Total errors: $total_errors" >> $GITHUB_STEP_SUMMARY

if [[ $total_drifted -gt 0 ]]; then
  echo "" >> $GITHUB_STEP_SUMMARY
  echo "⚠️ **Action required:** Drift detected in $total_drifted stacks" >> $GITHUB_STEP_SUMMARY
fi
`;
  }

}