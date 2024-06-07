import { Project } from 'projen';
import { GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';


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
}

/**
 * A step that assumes a role in AWS
 */
export class AwsAssumeRoleStep extends PipelineStep {

  constructor(project: Project, private readonly config: AwsAssumeRoleStepConfig) {
    super(project);
  }

  public toGitlab(): GitlabStepConfig {
    return {
      env: {
        ...this.config.region ? { AWS_REGION: this.config.region } : {},
      },
      commands: [
        `awslogin ${this.config.roleArn} ${this.config.sessionName ?? ''}`,
      ],
      extensions: [],
      needs: [],
    };
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [{
        name: 'AWS Credentials',
        uses: 'aws-actions/configure-aws-credentials@master',
        with: {
          'role-to-assume': this.config.roleArn,
          'role-session-name': this.config.sessionName ?? 'GitHubAction',
          ...this.config.region ? { 'aws-region': this.config.region } : {},
        },
      }],
      needs: [],
      env: {},
    };
  }

}