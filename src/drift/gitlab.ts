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
          'npm install',
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
            'npm install',
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
            'npm install',
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
        image: { name: this.image },
        needs: summaryNeeds.map(job => ({ job, artifacts: true })),
        only: {
          refs: ['schedules'],
          variables: ['$CI_PIPELINE_SOURCE == "schedule"', '$DRIFT_DETECTION == "true"'],
        },
        beforeScript: [
          'npm install',
        ],
        script: [
          'generate-drift-summary --results-dir . --output drift-summary.md',
          'cat drift-summary.md',
        ],
        when: gitlab.JobWhen.ALWAYS,
      },
    });

  }

}
