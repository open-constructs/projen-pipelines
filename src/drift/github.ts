import { Project } from 'projen';
import { GitHubProject, GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { DriftDetectionWorkflow, DriftDetectionWorkflowOptions, DriftDetectionStageOptions } from './base';
import { DriftDetectionStep, DriftRemediationStep, DriftVerificationStep } from './step';

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

    this.workflow = (this.project as GitHubProject).github!.addWorkflow(`${this.namePrefix}drift-detection`);
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

    // Track all job IDs for summary dependencies
    const allJobIds: string[] = [];

    // Add job for each stage
    for (const stage of this.stages) {
      const detectJobId = `drift-${stage.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      allJobIds.push(detectJobId);

      const driftStep = new DriftDetectionStep(this.project, stage).toGithub();
      const remediation = this.resolveRemediation(stage);
      const hasRemediation = remediation.policy !== 'off';

      // Build steps list - conditionally include drift-check step
      const jobSteps: any[] = [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v6',
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v6',
          with: {
            'node-version': '20',
          },
        },
        {
          name: 'Install dependencies',
          run: `${this.project.projenCommand} install:ci`,
        },
        ...driftStep.steps,
      ];

      // Only add drift-check outputs step when remediation is enabled
      if (hasRemediation) {
        jobSteps.push({
          id: 'drift-check',
          name: 'Check drift results',
          run: this.generateDriftCheckScript(stage),
        });
      }

      jobSteps.push({
        name: 'Upload results',
        ...(hasRemediation ? { if: 'always()' } : {}),
        uses: 'actions/upload-artifact@v7',
        with: {
          name: `${this.namePrefix}drift-results-${stage.name}`,
          path: `drift-results-${stage.name}.json`,
        },
      });

      if (this.createIssues) {
        jobSteps.push({
          name: 'Create Issue on Drift',
          if: hasRemediation
            ? 'steps.drift-check.outputs.drifted == \'true\' && github.event_name == \'schedule\''
            : 'steps.drift.outcome == \'failure\' && github.event_name == \'schedule\'',
          uses: 'actions/github-script@v8',
          with: {
            script: this.generateIssueCreationScript(stage),
          },
        });
      }

      // Build job config - conditionally include outputs
      const jobConfig: any = {
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
        steps: jobSteps,
      };

      if (hasRemediation) {
        jobConfig.outputs = {
          drifted: { stepId: 'drift-check', outputName: 'drifted' },
          eligible: { stepId: 'drift-check', outputName: 'eligible' },
        };
      }

      this.workflow.addJob(detectJobId, jobConfig);

      // Add remediation and verification jobs if policy is not 'off'
      if (hasRemediation) {
        const remediateJobId = `remediate-${stage.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const verifyJobId = `verify-${stage.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        allJobIds.push(remediateJobId, verifyJobId);

        this.addRemediateJob(stage, detectJobId, remediateJobId);
        this.addVerifyJob(stage, remediateJobId, verifyJobId);
      }
    }

    // Add summary job
    if (this.stages.length > 0) {
      const anyRemediation = this.stages.some(s => this.resolveRemediation(s).policy !== 'off');

      const summaryJob: any = {
        name: 'Drift Detection Summary',
        runsOn: ['ubuntu-latest'],
        permissions: {
          contents: JobPermission.READ,
        },
        needs: allJobIds,
        steps: [
          {
            name: 'Download all artifacts',
            uses: 'actions/download-artifact@v8',
            with: {
              path: 'drift-results',
            },
          },
          {
            name: 'Generate summary',
            run: anyRemediation ? this.generateSummaryScript() : this.generateDetectionOnlySummaryScript(),
          },
        ],
      };

      // Only add if: always() when remediation jobs exist (they might be skipped)
      if (anyRemediation) {
        summaryJob.if = 'always()';
      }

      this.workflow.addJob('drift-summary', summaryJob);
    }
  }

  private addRemediateJob(
    stage: DriftDetectionStageOptions,
    detectJobId: string,
    remediateJobId: string,
  ): void {
    const remediation = this.resolveRemediation(stage);
    const remediationStep = new DriftRemediationStep(this.project, {
      stageName: stage.name,
      region: stage.region,
      roleArn: stage.roleArn,
      jumpRoleArn: stage.jumpRoleArn,
      stackNames: stage.stackNames,
      remediation,
      environment: stage.environment,
    }).toGithub();

    const jobConfig: any = {
      name: `Drift Remediation - ${stage.name}`,
      runsOn: ['ubuntu-latest'],
      needs: [detectJobId],
      if: `\${{ needs.${detectJobId}.outputs.drifted == 'true' && needs.${detectJobId}.outputs.eligible == 'true' }}`,
      env: remediationStep.env,
      permissions: {
        contents: JobPermission.READ,
        ...(remediationStep.permissions ?? {}),
        ...this.permissions,
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v6',
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v6',
          with: {
            'node-version': '20',
          },
        },
        {
          name: 'Install dependencies',
          run: `${this.project.projenCommand} install:ci`,
        },
        {
          name: 'Download detection results',
          uses: 'actions/download-artifact@v8',
          with: {
            name: `${this.namePrefix}drift-results-${stage.name}`,
          },
        },
        ...remediationStep.steps,
        {
          name: 'Upload remediation results',
          if: 'always()',
          uses: 'actions/upload-artifact@v7',
          with: {
            name: `${this.namePrefix}drift-remediation-${stage.name}`,
            path: `drift-remediation-${stage.name}.json`,
          },
        },
      ],
    };

    // For 'manual' policy, use environment protection for gating
    if (remediation.policy === 'manual' && remediation.approvalEnvironment) {
      jobConfig.environment = remediation.approvalEnvironment;
    }

    this.workflow.addJob(remediateJobId, jobConfig);
  }

  private addVerifyJob(
    stage: DriftDetectionStageOptions,
    remediateJobId: string,
    verifyJobId: string,
  ): void {
    const verifyStep = new DriftVerificationStep(this.project, {
      stageName: stage.name,
      region: stage.region,
      roleArn: stage.roleArn,
      jumpRoleArn: stage.jumpRoleArn,
      stackNames: stage.stackNames,
      environment: stage.environment,
    }).toGithub();

    this.workflow.addJob(verifyJobId, {
      name: `Drift Verification - ${stage.name}`,
      runsOn: ['ubuntu-latest'],
      needs: [remediateJobId],
      if: `\${{ needs.${remediateJobId}.result == 'success' }}`,
      env: verifyStep.env,
      permissions: {
        contents: JobPermission.READ,
        ...(verifyStep.permissions ?? {}),
        ...this.permissions,
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v6',
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v6',
          with: {
            'node-version': '20',
          },
        },
        {
          name: 'Install dependencies',
          run: `${this.project.projenCommand} install:ci`,
        },
        ...verifyStep.steps,
        {
          name: 'Upload verification results',
          if: 'always()',
          uses: 'actions/upload-artifact@v7',
          with: {
            name: `${this.namePrefix}drift-verify-${stage.name}`,
            path: `drift-verify-${stage.name}.json`,
          },
        },
      ],
    });
  }

  /**
   * Generates a script that checks detection results and sets outputs:
   * - drifted: 'true'|'false'
   * - eligible: 'true'|'false' (drift exists AND is not all deletions/excluded)
   */
  private generateDriftCheckScript(stage: DriftDetectionStageOptions): string {
    return `#!/bin/bash
RESULTS_FILE="drift-results-${stage.name}.json"
if [[ ! -f "$RESULTS_FILE" ]]; then
  echo "drifted=false" >> $GITHUB_OUTPUT
  echo "eligible=false" >> $GITHUB_OUTPUT
  exit 0
fi

DRIFTED=$(jq '[.[] | select(.driftStatus == "DRIFTED")] | length' "$RESULTS_FILE")
if [[ "$DRIFTED" -eq 0 ]]; then
  echo "drifted=false" >> $GITHUB_OUTPUT
  echo "eligible=false" >> $GITHUB_OUTPUT
  exit 0
fi

echo "drifted=true" >> $GITHUB_OUTPUT

# Check eligibility: at least one MODIFIED (non-DELETED) resource that passes filters
ELIGIBLE=$(jq '[.[] | select(.driftStatus == "DRIFTED") | .driftedResources[]? | select(.stackResourceDriftStatus == "MODIFIED")] | length' "$RESULTS_FILE")

if [[ "$ELIGIBLE" -eq 0 ]]; then
  echo "eligible=false" >> $GITHUB_OUTPUT
else
  echo "eligible=true" >> $GITHUB_OUTPUT
fi

# Exit with failure if drift detected and failOnDrift is true
${stage.failOnDrift !== false ? 'exit 1' : 'exit 0'}
`;
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
    return `#!/bin/bash
echo "## Drift Detection & Remediation Summary" >> $GITHUB_STEP_SUMMARY
echo "" >> $GITHUB_STEP_SUMMARY

total_stacks=0
total_drifted=0
total_errors=0
total_reverted=0
total_skipped=0
total_failed=0
total_gated=0

# Process detection results
for dir in drift-results/*/; do
  if [[ -d "$dir" ]]; then
    for file in "$dir"drift-results-*.json; do
      if [[ -f "$file" ]]; then
        stage=$(basename "$file" | sed 's/drift-results-//;s/.json//')
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
  fi
done

# Process remediation results
for dir in drift-results/*/; do
  if [[ -d "$dir" ]]; then
    for file in "$dir"drift-remediation-*.json; do
      if [[ -f "$file" ]]; then
        stage=$(jq -r '.stageName' "$file")
        echo "#### Remediation - $stage" >> $GITHUB_STEP_SUMMARY

        reverted=$(jq '.summary.revertedStacks' "$file")
        skipped=$(jq '.summary.skippedStacks' "$file")
        failed=$(jq '.summary.failedStacks' "$file")
        gated=$(jq '.summary.gatedStacks' "$file")

        echo "- Reverted: $reverted" >> $GITHUB_STEP_SUMMARY
        echo "- Skipped: $skipped" >> $GITHUB_STEP_SUMMARY
        echo "- Failed: $failed" >> $GITHUB_STEP_SUMMARY
        echo "- Gated (requires approval): $gated" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY

        total_reverted=$((total_reverted + reverted))
        total_skipped=$((total_skipped + skipped))
        total_failed=$((total_failed + failed))
        total_gated=$((total_gated + gated))
      fi
    done
  fi
done

echo "### Overall Summary" >> $GITHUB_STEP_SUMMARY
echo "- Total stacks checked: $total_stacks" >> $GITHUB_STEP_SUMMARY
echo "- Total drifted stacks: $total_drifted" >> $GITHUB_STEP_SUMMARY
echo "- Total errors: $total_errors" >> $GITHUB_STEP_SUMMARY

if [[ $total_reverted -gt 0 ]] || [[ $total_failed -gt 0 ]] || [[ $total_gated -gt 0 ]]; then
  echo "" >> $GITHUB_STEP_SUMMARY
  echo "**Remediation:**" >> $GITHUB_STEP_SUMMARY
  echo "- Stacks reverted: $total_reverted" >> $GITHUB_STEP_SUMMARY
  echo "- Stacks skipped: $total_skipped" >> $GITHUB_STEP_SUMMARY
  echo "- Stacks failed: $total_failed" >> $GITHUB_STEP_SUMMARY
  echo "- Stacks gated: $total_gated" >> $GITHUB_STEP_SUMMARY
fi

if [[ $total_drifted -gt 0 ]]; then
  echo "" >> $GITHUB_STEP_SUMMARY
  echo "\\u26a0\\ufe0f **Action required:** Drift detected in $total_drifted stacks" >> $GITHUB_STEP_SUMMARY
fi
`;
  }

  private generateDetectionOnlySummaryScript(): string {
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
