import { Project } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { AwsAssumeRoleStep } from './aws-assume-role.step';
import { SetEnvStep } from './set-env.step';
import { GithubStepConfig, PipelineStep, StepSequence } from './step';

export interface GithubPackagesLoginStepOptions {
  /**
   * Whether or not to grant the step write permissions to the registry.
   *
   * @default false
   */
  readonly write?: boolean;
}

export class GithubPackagesLoginStep extends PipelineStep {

  constructor(project: Project, private options: GithubPackagesLoginStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      env: {},
      needs: [],
      steps: [{
        run: 'echo "GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}" >> $GITHUB_ENV',
      }],
      permissions: { packages: this.options.write ? JobPermission.WRITE : JobPermission.READ },
    };
  }
}

export interface CodeArtifactLoginStepOptions {
  readonly ownerAccount: string;
  readonly region: string;
  readonly domainName: string;
  readonly role: string;
}

export class CodeArtifactLoginStep extends StepSequence {
  constructor(project: Project, protected options: CodeArtifactLoginStepOptions) {
    super(project, [
      new AwsAssumeRoleStep(project, { roleArn: options.role, sessionName: 'CodeArtifact' }),
      new SetEnvStep(project, {
        name: 'CODEARTIFACT_AUTH_TOKEN',
        command: `aws codeartifact get-authorization-token --domain ${options.domainName} --region ${options.region} --domain-owner ${options.ownerAccount} --query authorizationToken --output text`,
      }),
    ]);
  }

}