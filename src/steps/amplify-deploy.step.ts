import { Project } from 'projen';
import { BashStepConfig, CodeCatalystStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

/**
 * Configuration for an AWS Amplify deployment step
 */
export interface AmplifyDeployStepConfig {
  /** The Amplify app ID (static value) */
  readonly appId?: string;
  /** Command to retrieve the Amplify app ID dynamically */
  readonly appIdCommand?: string;
  /** The artifact file to deploy (zip file containing the build) */
  readonly artifactFile: string;
  /** The branch name to deploy to (defaults to 'main') */
  readonly branchName?: string;
  /** The AWS region (defaults to 'eu-central-1') */
  readonly region?: string;
  /** Environment name */
  readonly environment?: string;
}

/**
 * A step that deploys a web application to AWS Amplify
 */
export class AmplifyDeployStep extends PipelineStep {

  private readonly branchName: string;
  private readonly region: string;

  constructor(project: Project, private readonly config: AmplifyDeployStepConfig) {
    super(project);
    if (!config.appId && !config.appIdCommand) {
      throw new Error('Either appId or appIdCommand must be provided');
    }
    if (config.appId && config.appIdCommand) {
      throw new Error('Cannot provide both appId and appIdCommand');
    }
    this.branchName = config.branchName ?? 'main';
    this.region = config.region ?? 'eu-central-1';
  }

  /**
   * Generate the core Amplify deployment commands
   */
  private getDeploymentCommands(): string[] {
    const commands: string[] = [];

    // Check and stop any pending jobs
    commands.push('echo "Checking for pending Amplify jobs..."');
    commands.push(`aws amplify list-jobs --app-id $AMPLIFY_APP_ID --branch-name ${this.branchName} --max-items 1 > amplify-last-job.json`);
    commands.push('AMPLIFY_LAST_JOB_STATUS=$(cat amplify-last-job.json | jq -r \'.jobSummaries[].status\')');
    commands.push('AMPLIFY_LAST_JOB_ID=$(cat amplify-last-job.json | jq -r \'.jobSummaries[].jobId\')');
    commands.push('if [ "$AMPLIFY_LAST_JOB_STATUS" = "PENDING" ]; then');
    commands.push(`  aws amplify stop-job --app-id $AMPLIFY_APP_ID --branch-name ${this.branchName} --job-id $AMPLIFY_LAST_JOB_ID`);
    commands.push('fi');

    // Create deployment
    commands.push('echo "Creating Amplify deployment..."');
    commands.push(`aws amplify create-deployment --app-id $AMPLIFY_APP_ID --branch-name ${this.branchName} > amplify-deploy.json`);
    commands.push('AMPLIFY_ZIP_UPLOAD_URL=$(cat amplify-deploy.json | jq -r \'.zipUploadUrl\')');
    commands.push('AMPLIFY_JOB_ID=$(cat amplify-deploy.json | jq -r \'.jobId\')');

    // Upload artifact
    commands.push('echo "Uploading deployment artifact..."');
    commands.push(`curl -H "Content-Type: application/zip" $AMPLIFY_ZIP_UPLOAD_URL --upload-file ${this.config.artifactFile}`);

    // Start deployment
    commands.push('echo "Starting Amplify deployment..."');
    commands.push(`aws amplify start-deployment --app-id $AMPLIFY_APP_ID --branch-name ${this.branchName} --job-id $AMPLIFY_JOB_ID`);

    // Wait for deployment to complete
    commands.push('while :; do');
    commands.push('  sleep 10');
    commands.push(`  STATUS=$(aws amplify get-job --app-id $AMPLIFY_APP_ID --branch-name ${this.branchName} --job-id $AMPLIFY_JOB_ID | jq -r '.job.summary.status')`);
    commands.push('  if [ "$STATUS" != "PENDING" ] && [ "$STATUS" != "RUNNING" ]; then');
    commands.push('    break');
    commands.push('  fi');
    commands.push('  echo "Deployment status: $STATUS"');
    commands.push('done');

    // Clean up and check final status
    commands.push('rm -f amplify-last-job.json amplify-deploy.json');
    commands.push('echo "Amplify deployment completed with status: $STATUS"');
    commands.push('if [ "$STATUS" != "SUCCEED" ]; then');
    commands.push('  echo "Deployment failed with status: $STATUS"');
    commands.push('  exit 1');
    commands.push('fi');

    return commands;
  }

  /**
   * Get the command to set the Amplify App ID
   */
  private getAppIdCommand(): string {
    if (this.config.appId) {
      return `AMPLIFY_APP_ID="${this.config.appId}"`;
    } else if (this.config.appIdCommand) {
      return `AMPLIFY_APP_ID=$(${this.config.appIdCommand})`;
    }
    return '';
  }

  public toGitlab(): GitlabStepConfig {
    const commands: string[] = [];

    // Set Amplify App ID
    commands.push(this.getAppIdCommand());

    // Add deployment commands
    commands.push(...this.getDeploymentCommands());

    return {
      env: {
        AWS_REGION: this.region,
        AWS_DEFAULT_REGION: this.region,
      },
      commands,
      extensions: [],
      needs: [],
    };
  }

  public toGithub(): GithubStepConfig {
    const steps = [];

    // Set Amplify App ID
    if (this.config.appId) {
      steps.push({
        name: 'Set Amplify App ID',
        run: `echo "AMPLIFY_APP_ID=${this.config.appId}" >> $GITHUB_ENV`,
      });
    } else if (this.config.appIdCommand) {
      const envStep: any = {
        name: 'Extract Amplify App ID',
        run: `AMPLIFY_APP_ID=$(${this.config.appIdCommand}) && echo "AMPLIFY_APP_ID=$AMPLIFY_APP_ID" >> $GITHUB_ENV`,
      };
      if (this.config.environment) {
        envStep.env = { ENVIRONMENT: this.config.environment };
      }
      steps.push(envStep);
    }

    // Deploy to Amplify - use the environment variable set above
    const deploymentScript = [
      '#!/bin/bash -e',
      ...this.getDeploymentCommands(),
    ].join('\n');

    steps.push({
      name: 'Deploy to Amplify',
      run: deploymentScript,
    });

    return {
      steps,
      needs: [],
      env: {
        AWS_REGION: this.region,
        AWS_DEFAULT_REGION: this.region,
      },
    };
  }

  public toBash(): BashStepConfig {
    const commands: string[] = [];

    // Set AWS region
    commands.push(`export AWS_REGION="${this.region}"`);
    commands.push(`export AWS_DEFAULT_REGION="${this.region}"`);

    // Set Amplify App ID
    commands.push(this.getAppIdCommand());

    // Add deployment commands
    commands.push(...this.getDeploymentCommands());

    return { commands };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    throw new Error('CodeCatalyst is not supported for Amplify deployment');
  }
}