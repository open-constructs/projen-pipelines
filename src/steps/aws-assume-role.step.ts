import { Project } from 'projen';
import { JobPermission, JobStep } from 'projen/lib/github/workflows-model';
import {
  BashStepConfig,
  CodeCatalystStepConfig,
  GithubStepConfig,
  GitlabStepConfig,
  PipelineStep,
} from './step';

/**
 * Configuration for an AWS AssumeRoleStep
 */
export interface AwsAssumeRoleStepConfig {
  /** The ARN of the role to assume */
  readonly roleArn: string;
  /** An identifier for the assumed role session */
  readonly sessionName?: string;
  /** The AWS region that should be set */
  readonly region?: string;
  /**
   * The ARN of the jump role to use for role chaining
   */
  readonly jumpRoleArn?: string;
}

/**
 * A step that assumes a role in AWS
 */
export class AwsAssumeRoleStep extends PipelineStep {
  constructor(
    project: Project,
    private readonly config: AwsAssumeRoleStepConfig,
  ) {
    super(project);
  }

  public toGitlab(): GitlabStepConfig {
    const sessionName =
      this.config.sessionName ??
      'GitLabRunner-${CI_PROJECT_ID}-${CI_PIPELINE_ID}}';
    return {
      env: {
        ...(this.config.region ? { AWS_REGION: this.config.region } : {}),
      },
      commands: [
        `export $(printf "AWS_ACCESS_KEY_ID=%s AWS_SECRET_ACCESS_KEY=%s AWS_SESSION_TOKEN=%s" $(aws sts assume-role-with-web-identity --role-arn "${this.config.roleArn}" --role-session-name "${sessionName}" --web-identity-token \${AWS_TOKEN} --duration-seconds 3600 --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' --output text))`,
      ],
      extensions: [],
      needs: [],
    };
  }

  public toGithub(): GithubStepConfig {
    let steps: JobStep[] = [];

    if (this.config.jumpRoleArn) {
      steps.push({
        name: 'Assume Jump Role',
        uses: 'aws-actions/configure-aws-credentials@v5',
        with: {
          'role-to-assume': this.config.jumpRoleArn,
          'role-session-name': this.config.sessionName ?? 'GitHubAction',
          ...(this.config.region
            ? { 'aws-region': this.config.region }
            : { 'aws-region': 'us-east-1' }),
          'role-skip-session-tagging': true,
        },
      });
    }
    steps.push({
      name: 'AWS Credentials',
      uses: 'aws-actions/configure-aws-credentials@v5',
      with: {
        'role-to-assume': this.config.roleArn,
        'role-session-name': this.config.sessionName ?? 'GitHubAction',
        ...(this.config.region
          ? { 'aws-region': this.config.region }
          : { 'aws-region': 'us-east-1' }),
      },
    });
    if (this.config.jumpRoleArn) {
      // Add role chaining options to the second step
      steps[1]?.with && (steps[1].with['role-chaining'] = true);
      steps[1]?.with && (steps[1].with['role-skip-session-tagging'] = true);
    }
    return {
      steps,
      needs: [],
      env: {},
      permissions: {
        idToken: JobPermission.WRITE,
      },
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: [
        `echo "Login to AWS using role ${this.config.roleArn} for region ${
          this.config.region ?? 'undefined'
        }"`,
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    //FIXME use CC environments here
    return {
      commands: [],
      env: {},
      needs: [],
    };
  }
}
