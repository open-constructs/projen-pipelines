import { gitlab, Project } from 'projen';
import { DriftDetectionWorkflow, DriftDetectionWorkflowOptions } from './base';
import { DriftDetectionStep, DriftRemediationStep, DriftVerificationStep } from './step';

export interface GitLabDriftDetectionWorkflowOptions extends DriftDetectionWorkflowOptions {
  /**
   * GitLab runner tags
   */
  readonly runnerTags?: string[];

  /**
   * Docker image to use for drift detection
   * @default "node:18"
   */
  readonly image?: string;
}

export class GitLabDriftDetectionWorkflow extends DriftDetectionWorkflow {
  private readonly runnerTags: string[];
  private readonly image: string;
  private readonly config: gitlab.GitlabConfiguration;

  constructor(project: Project, options: GitLabDriftDetectionWorkflowOptions) {
    super(project, options);
    this.runnerTags = options.runnerTags ?? [];
    this.image = options.image ?? 'node:18';
    this.config = new gitlab.GitlabConfiguration(project, {
      stages: [],
      jobs: {},
    });

    // Build stages list: detection + optional remediation/verify + summary
    const stagesList: string[] = ['drift-detection'];
    const hasRemediation = this.stages.some(s => this.resolveRemediation(s).policy !== 'off');
    if (hasRemediation) {
      stagesList.push('drift-remediation', 'drift-verification');
    }
    stagesList.push('summary');
    this.config.addStages(...stagesList);

    // Base job template for drift detection
    this.config.addJobs({
      [`.${this.namePrefix}drift-detection`]: {
        stage: 'drift-detection',
        tags: this.runnerTags,
        image: { name: this.image },
        idTokens: {
          AWS_TOKEN: {
            aud: 'https://sts.amazonaws.com',
          },
        },
        only: {
          refs: ['schedules'],
          variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$DRIFT_DETECTION == "true"'],
        },
        beforeScript: [
          'apt-get update && apt-get install -y python3 python3-pip',
          'pip3 install awscli',
          `${this.project.projenCommand} install:ci`,
        ],
        artifacts: {
          paths: ['drift-results-*.json'],
          expireIn: '1 week',
          when: gitlab.CacheWhen.ALWAYS,
          ...(hasRemediation ? { reports: { dotenv: ['drift-env.env'] } } : {}),
        },
      },
    });

    // Base job template for remediation (if any stage has remediation)
    if (hasRemediation) {
      this.config.addJobs({
        [`.${this.namePrefix}drift-remediation`]: {
          stage: 'drift-remediation',
          tags: this.runnerTags,
          image: { name: this.image },
          idTokens: {
            AWS_TOKEN: {
              aud: 'https://sts.amazonaws.com',
            },
          },
          only: {
            refs: ['schedules'],
            variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$DRIFT_DETECTION == "true"'],
          },
          beforeScript: [
            'apt-get update && apt-get install -y python3 python3-pip',
            'pip3 install awscli',
            `${this.project.projenCommand} install:ci`,
          ],
          artifacts: {
            paths: ['drift-remediation-*.json'],
            expireIn: '1 week',
            when: gitlab.CacheWhen.ALWAYS,
          },
        },
      });

      this.config.addJobs({
        [`.${this.namePrefix}drift-verification`]: {
          stage: 'drift-verification',
          tags: this.runnerTags,
          image: { name: this.image },
          idTokens: {
            AWS_TOKEN: {
              aud: 'https://sts.amazonaws.com',
            },
          },
          only: {
            refs: ['schedules'],
            variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$DRIFT_DETECTION == "true"'],
          },
          beforeScript: [
            'apt-get update && apt-get install -y python3 python3-pip',
            'pip3 install awscli',
            `${this.project.projenCommand} install:ci`,
          ],
          artifacts: {
            paths: ['drift-verify-*.json'],
            expireIn: '1 week',
            when: gitlab.CacheWhen.ALWAYS,
          },
        },
      });
    }

    // Summary job needs list
    const summaryNeeds: string[] = [];

    // Add jobs for each stage
    for (const stage of this.stages) {
      const detectJobName = `${this.namePrefix}drift:${stage.name}`;
      summaryNeeds.push(detectJobName);

      const driftStep = new DriftDetectionStep(this.project, stage);
      const stepConfig = driftStep.toGitlab();

      const remediation = this.resolveRemediation(stage);
      const stageHasRemediation = remediation.policy !== 'off';

      // Build script — only add dotenv output when remediation is enabled
      const script: string[] = [...stepConfig.commands];
      if (stageHasRemediation) {
        script.push(
          `echo "DRIFTED_${stage.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}=$(jq '[.[] | select(.driftStatus == \\"DRIFTED\\")] | length' drift-results-${stage.name}.json)" >> drift-env.env`,
        );
      }

      this.config.addJobs({
        [detectJobName]: {
          extends: [`.${this.namePrefix}drift-detection`],
          variables: {
            ...stepConfig.env,
          },
          script,
          allowFailure: !stage.failOnDrift,
        },
      });

      // Add remediation and verification jobs if policy is not 'off'
      if (remediation.policy !== 'off') {
        const remediateJobName = `${this.namePrefix}remediate:${stage.name}`;
        const verifyJobName = `${this.namePrefix}verify:${stage.name}`;
        summaryNeeds.push(remediateJobName, verifyJobName);

        const remediationStep = new DriftRemediationStep(this.project, {
          stageName: stage.name,
          region: stage.region,
          roleArn: stage.roleArn,
          jumpRoleArn: stage.jumpRoleArn,
          stackNames: stage.stackNames,
          remediation,
          environment: stage.environment,
        });
        const remStepConfig = remediationStep.toGitlab();

        const stageVarName = `DRIFTED_${stage.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

        const remediateJob: any = {
          extends: [`.${this.namePrefix}drift-remediation`],
          needs: [{ job: detectJobName, artifacts: true }],
          variables: {
            ...remStepConfig.env,
          },
          script: remStepConfig.commands,
          rules: [
            {
              if: `$${stageVarName} != "0" && $${stageVarName} != ""`,
              when: remediation.policy === 'manual' ? gitlab.JobWhen.MANUAL : gitlab.JobWhen.ON_SUCCESS,
            },
          ],
          allowFailure: remediation.policy === 'manual' ? false : undefined,
        };

        this.config.addJobs({ [remediateJobName]: remediateJob });

        // Verification job
        const verifyStep = new DriftVerificationStep(this.project, {
          stageName: stage.name,
          region: stage.region,
          roleArn: stage.roleArn,
          jumpRoleArn: stage.jumpRoleArn,
          stackNames: stage.stackNames,
          environment: stage.environment,
        });
        const verStepConfig = verifyStep.toGitlab();

        this.config.addJobs({
          [verifyJobName]: {
            extends: [`.${this.namePrefix}drift-verification`],
            needs: [{ job: remediateJobName, artifacts: true }],
            variables: {
              ...verStepConfig.env,
            },
            script: verStepConfig.commands,
          },
        });
      }
    }

    // Add summary job
    this.config.addJobs({
      [`${this.namePrefix}drift:summary`]: {
        stage: 'summary',
        tags: this.runnerTags,
        needs: summaryNeeds.map(job => ({ job, artifacts: true })),
        only: {
          refs: ['schedules'],
          variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$DRIFT_DETECTION == "true"'],
        },
        script: [
          'echo "## Drift Detection Summary"',
          'echo ""',
          hasRemediation ? this.generateRemediationSummaryScript() : this.generateDetectionOnlySummaryScript(),
        ],
        when: gitlab.JobWhen.ALWAYS,
      },
    });

  }

  private generateRemediationSummaryScript(): string {
    return `
total_stacks=0
total_drifted=0
total_errors=0
total_reverted=0
total_skipped=0
total_failed=0
total_gated=0

# Detection results
for file in drift-results-*.json; do
  if [[ -f "$file" ]]; then
    stage=$(echo $file | sed 's/drift-results-//;s/.json//')
    echo "### Stage: $stage"
    
    # Count results
    stacks=$(jq 'length' "$file")
    drifted=$(jq '[.[] | select(.driftStatus == "DRIFTED")] | length' "$file")
    errors=$(jq '[.[] | select(.error)] | length' "$file")
    
    echo "- Total stacks: $stacks"
    echo "- Drifted: $drifted"
    echo "- Errors: $errors"
    
    # Show drifted stacks
    if [[ $drifted -gt 0 ]]; then
      echo ""
      echo "**Drifted stacks:**"
      jq -r '.[] | select(.driftStatus == "DRIFTED") | "  - " + .stackName + " (" + ((.driftedResources // []) | length | tostring) + " resources)"' "$file"
    fi
    
    echo ""
    
    # Accumulate totals
    total_stacks=$((total_stacks + stacks))
    total_drifted=$((total_drifted + drifted))
    total_errors=$((total_errors + errors))
  fi
done

# Remediation results
for file in drift-remediation-*.json; do
  if [[ -f "$file" ]]; then
    stage=$(jq -r '.stageName' "$file")
    echo "#### Remediation - $stage"
    
    reverted=$(jq '.summary.revertedStacks' "$file")
    skipped=$(jq '.summary.skippedStacks' "$file")
    failed=$(jq '.summary.failedStacks' "$file")
    gated=$(jq '.summary.gatedStacks' "$file")
    
    echo "- Reverted: $reverted"
    echo "- Skipped: $skipped"
    echo "- Failed: $failed"
    echo "- Gated (requires approval): $gated"
    echo ""
    
    total_reverted=$((total_reverted + reverted))
    total_skipped=$((total_skipped + skipped))
    total_failed=$((total_failed + failed))
    total_gated=$((total_gated + gated))
  fi
done

echo "### Overall Summary"
echo "- Total stacks checked: $total_stacks"
echo "- Total drifted stacks: $total_drifted"
echo "- Total errors: $total_errors"

if [[ $total_reverted -gt 0 ]] || [[ $total_failed -gt 0 ]] || [[ $total_gated -gt 0 ]]; then
  echo ""
  echo "**Remediation:**"
  echo "- Stacks reverted: $total_reverted"
  echo "- Stacks skipped: $total_skipped"
  echo "- Stacks failed: $total_failed"
  echo "- Stacks gated: $total_gated"
fi

if [[ $total_drifted -gt 0 ]]; then
  echo ""
  echo "\\u26a0\\ufe0f **Action required:** Drift detected in $total_drifted stacks"
  
  # Send notification if webhook is configured
  if [[ -n "$DRIFT_NOTIFICATION_WEBHOOK" ]]; then
    curl -X POST "$DRIFT_NOTIFICATION_WEBHOOK" \\
      -H "Content-Type: application/json" \\
      -d "{\\"text\\": \\"Drift detected in $total_drifted stacks (reverted: $total_reverted, failed: $total_failed). Check pipeline $CI_PIPELINE_URL for details.\\"}" || true
  fi
fi
`;
  }

  private generateDetectionOnlySummaryScript(): string {
    return `
total_stacks=0
total_drifted=0
total_errors=0

for file in drift-results-*.json; do
  if [[ -f "$file" ]]; then
    stage=$(echo $file | sed 's/drift-results-//;s/.json//')
    echo "### Stage: $stage"
    
    # Count results
    stacks=$(jq 'length' "$file")
    drifted=$(jq '[.[] | select(.driftStatus == "DRIFTED")] | length' "$file")
    errors=$(jq '[.[] | select(.error)] | length' "$file")
    
    echo "- Total stacks: $stacks"
    echo "- Drifted: $drifted"
    echo "- Errors: $errors"
    
    # Show drifted stacks
    if [[ $drifted -gt 0 ]]; then
      echo ""
      echo "**Drifted stacks:**"
      jq -r '.[] | select(.driftStatus == "DRIFTED") | "  - " + .stackName + " (" + ((.driftedResources // []) | length | tostring) + " resources)"' "$file"
    fi
    
    echo ""
    
    # Accumulate totals
    total_stacks=$((total_stacks + stacks))
    total_drifted=$((total_drifted + drifted))
    total_errors=$((total_errors + errors))
  fi
done

echo "### Overall Summary"
echo "- Total stacks checked: $total_stacks"
echo "- Total drifted stacks: $total_drifted"
echo "- Total errors: $total_errors"

if [[ $total_drifted -gt 0 ]]; then
  echo ""
  echo "⚠️ **Action required:** Drift detected in $total_drifted stacks"
  
  # Send notification if webhook is configured
  if [[ -n "$DRIFT_NOTIFICATION_WEBHOOK" ]]; then
    curl -X POST "$DRIFT_NOTIFICATION_WEBHOOK" \\
      -H "Content-Type: application/json" \\
      -d "{\\"text\\": \\"Drift detected in $total_drifted stacks. Check pipeline $CI_PIPELINE_URL for details.\\"}" || true
  fi
fi
`;
  }

}
