import { gitlab, Project } from 'projen';
import { DriftDetectionWorkflow, DriftDetectionWorkflowOptions } from './base';
import { DriftDetectionStep } from './step';

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

    this.config.addStages('drift-detection', 'summary');

    this.config.addJobs({
      '.drift-detection': {
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
          'npm ci',
        ],
        artifacts: {
          paths: ['drift-results-*.json'],
          expireIn: '1 week',
          when: gitlab.CacheWhen.ALWAYS,
        },
      },
    });

    // Add job for each stage
    for (const stage of this.stages) {
      const jobName = `drift:${stage.name}`;

      const driftStep = new DriftDetectionStep(this.project, stage);
      const stepConfig = driftStep.toGitlab();

      this.config.addJobs({
        [jobName]: {
          extends: ['.drift-detection'],
          variables: {
            ...stepConfig.env,
          },
          script: stepConfig.commands,
          allowFailure: !stage.failOnDrift,
        },
      });
    }

    // Add summary job
    this.config.addJobs({
      'drift:summary': {
        stage: 'summary',
        tags: this.runnerTags,
        needs: this.stages.map(s => `drift:${s.name}`),
        only: {
          refs: ['schedules'],
          variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$DRIFT_DETECTION == "true"'],
        },
        script: [
          'echo "## Drift Detection Summary"',
          'echo ""',
          this.generateSummaryScript(),
        ],
        when: gitlab.JobWhen.ALWAYS,
      },
    });

  }

  private generateSummaryScript(): string {
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