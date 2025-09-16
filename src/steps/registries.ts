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

/**
 * Step to set the GITHUB_TOKEN environment variable from a secret.
 *
 * Only supported for GitHub as it is GitHub specific.
 */
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

export interface NpmSecretStepOptions {
  /**
   * Name of the secret to set for the environment variable NPM_TOKEN.
   *
   * @default 'NPM_TOKEN'
   */
  readonly secretName?: string;
}

/**
 * Step to set the NPM_TOKEN environment variable from a secret.
 *
 * Currently only supported and needed for GitHub.
 * Gitlab sets the NPM_TOKEN environment variable automatically from the project's settings.
 */
export class NpmSecretStep extends PipelineStep {

  constructor(project: Project, private options: NpmSecretStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      env: {},
      needs: [],
      steps: [{
        run: `echo "NPM_TOKEN=\${{ secrets.${this.options.secretName ?? 'NPM_TOKEN'} }}" >> $GITHUB_ENV`,
      }],
      permissions: {},
    };
  }
}

/**
 * Options for the CodeArtifactLoginStep.
 */
export interface CodeArtifactLoginStepOptions {
  readonly ownerAccount: string;
  readonly region: string;
  readonly domainName: string;
  readonly role: string;

  /**
   * The environment variable name to set.
   *
   * @default 'CODEARTIFACT_AUTH_TOKEN'
   */
  readonly envVariableName?: string;
}

/**
 * Step to login to CodeArtifact.
 *
 * The environment variable name can be configured to avoid conflicts with other environment variables.
 * The default is CODEARTIFACT_AUTH_TOKEN.
 */
export class CodeArtifactLoginStep extends StepSequence {
  constructor(project: Project, protected options: CodeArtifactLoginStepOptions) {
    super(project, [
      new AwsAssumeRoleStep(project, { roleArn: options.role, sessionName: 'CodeArtifact' }),
      new SetEnvStep(project, {
        name: options.envVariableName ?? 'CODEARTIFACT_AUTH_TOKEN',
        command: `aws codeartifact get-authorization-token --domain ${options.domainName} --region ${options.region} --domain-owner ${options.ownerAccount} --query authorizationToken --output text`,
      }),
    ]);
  }

}