import { Project } from 'projen';
import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { AmplifyDeployStep, GithubCDKPipeline } from '../src';

describe('AmplifyDeployStep', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ name: 'test-project' });
  });

  test('generates correct configuration with direct app ID', () => {
    const step = new AmplifyDeployStep(project, {
      appId: 'd123gtgt770s1x',
      artifactFile: 'dist.zip',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('generates correct configuration with custom branch and region', () => {
    const step = new AmplifyDeployStep(project, {
      appId: 'd123gtgt770s1x',
      artifactFile: 'build.zip',
      branchName: 'develop',
      region: 'us-west-2',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('generates correct configuration with command-based app ID extraction', () => {
    const step = new AmplifyDeployStep(project, {
      appIdCommand: 'jq -r \'.MyStack.AmplifyAppId\' cdk-outputs-production.json',
      artifactFile: 'website.zip',
      environment: 'production',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('GitHub config includes environment variable for command extraction', () => {
    const step = new AmplifyDeployStep(project, {
      appIdCommand: 'jq -r \'.StackName.AmplifyAppId\' cdk-outputs-staging.json',
      artifactFile: 'app.zip',
      environment: 'staging',
    });

    const githubConfig = step.toGithub();
    expect(githubConfig.steps).toHaveLength(2);
    expect(githubConfig.steps[0].name).toBe('Extract Amplify App ID');
    expect(githubConfig.steps[0].env).toEqual({ ENVIRONMENT: 'staging' });
  });

  test('GitHub config sets app ID directly when no CDK outputs configured', () => {
    const step = new AmplifyDeployStep(project, {
      appId: 'direct-app-id',
      artifactFile: 'app.zip',
    });

    const githubConfig = step.toGithub();
    expect(githubConfig.steps).toHaveLength(2);
    expect(githubConfig.steps[0].name).toBe('Set Amplify App ID');
    expect(githubConfig.steps[0].run).toContain('direct-app-id');
  });

  test('GitLab config includes command-based extraction', () => {
    const step = new AmplifyDeployStep(project, {
      appIdCommand: 'jq -r \'.AppStack.AmplifyId\' outputs.json',
      artifactFile: 'app.zip',
    });

    const gitlabConfig = step.toGitlab();
    expect(gitlabConfig.commands).toContain(
      "AMPLIFY_APP_ID=$(jq -r '.AppStack.AmplifyId' outputs.json)",
    );
  });

  test('Bash config uses deployment commands', () => {
    const step = new AmplifyDeployStep(project, {
      appId: 'test-app-id',
      artifactFile: 'deploy.zip',
    });

    const bashConfig = step.toBash();
    expect(bashConfig.commands).toContain('AMPLIFY_APP_ID="test-app-id"');
    expect(bashConfig.commands).toContain('echo "Checking for pending Amplify jobs..."');
    expect(bashConfig.commands.some(cmd => cmd.includes('aws amplify list-jobs'))).toBe(true);
  });

  test('Bash config with command extraction', () => {
    const step = new AmplifyDeployStep(project, {
      appIdCommand: 'cat amplify-id.txt',
      artifactFile: 'deploy.zip',
    });

    const bashConfig = step.toBash();
    expect(bashConfig.commands).toContain('AMPLIFY_APP_ID=$(cat amplify-id.txt)');
    expect(bashConfig.commands).toContain('echo "Checking for pending Amplify jobs..."');
    expect(bashConfig.commands.some(cmd => cmd.includes('aws amplify start-deployment'))).toBe(true);
  });

  test('CodeCatalyst throws not supported error', () => {
    const step = new AmplifyDeployStep(project, {
      appId: 'test-app-id',
      artifactFile: 'deploy.zip',
    });

    expect(() => step.toCodeCatalyst()).toThrow('CodeCatalyst is not supported for Amplify deployment');
  });

  test('throws error when neither appId nor appIdCommand is provided', () => {
    expect(() => {
      new AmplifyDeployStep(project, {
        artifactFile: 'deploy.zip',
      });
    }).toThrow('Either appId or appIdCommand must be provided');
  });

  test('throws error when both appId and appIdCommand are provided', () => {
    expect(() => {
      new AmplifyDeployStep(project, {
        appId: 'test-app-id',
        appIdCommand: 'cat amplify-id.txt',
        artifactFile: 'deploy.zip',
      });
    }).toThrow('Cannot provide both appId and appIdCommand');
  });

  test('can be added as post-deployment step to CDK Pipeline', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.150.0',
      name: 'test-app',
      defaultReleaseBranch: 'main',
    });

    // Create the Amplify deployment step
    const amplifyDeploy = new AmplifyDeployStep(app, {
      appIdCommand: 'jq -r \'.MyStack.AmplifyAppId\' cdk-outputs-prod.json',
      artifactFile: 'website.zip',
      environment: 'prod',
      branchName: 'main',
      region: 'us-east-1',
    });

    // Create a CDK Pipeline with Amplify deployment as post-deploy step
    const pipeline = new GithubCDKPipeline(app, {
      iamRoleArns: {
        default: 'arn:aws:iam::123456789012:role/DeploymentRole',
      },
      stages: [{
        name: 'prod',
        env: {
          account: '123456789012',
          region: 'us-east-1',
        },
        postDeploySteps: [amplifyDeploy],
      }],
    });

    // Verify the pipeline was created
    expect(pipeline).toBeDefined();

    // Verify the Amplify step has correct configuration
    const githubConfig = amplifyDeploy.toGithub();
    expect(githubConfig.steps).toHaveLength(2);
    expect(githubConfig.steps[0].name).toBe('Extract Amplify App ID');
    expect(githubConfig.steps[0].env).toEqual({ ENVIRONMENT: 'prod' });
    expect(githubConfig.steps[1].name).toBe('Deploy to Amplify');
    expect(githubConfig.env).toEqual({
      AWS_REGION: 'us-east-1',
      AWS_DEFAULT_REGION: 'us-east-1',
    });

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  });

  test('supports multiple Amplify deployments for different stages', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.150.0',
      name: 'multi-stage-app',
      defaultReleaseBranch: 'main',
    });

    // Create Amplify deployment steps for different stages
    const devAmplifyDeploy = new AmplifyDeployStep(app, {
      appIdCommand: 'jq -r \'.DevStack.AmplifyAppId\' cdk-outputs-dev.json',
      artifactFile: 'website-dev.zip',
      environment: 'dev',
      branchName: 'develop',
    });

    const prodAmplifyDeploy = new AmplifyDeployStep(app, {
      appIdCommand: 'jq -r \'.ProdStack.AmplifyAppId\' cdk-outputs-prod.json',
      artifactFile: 'website-prod.zip',
      environment: 'prod',
      branchName: 'main',
    });

    // Create a CDK Pipeline with Amplify deployments for each stage
    const pipeline = new GithubCDKPipeline(app, {
      iamRoleArns: {
        default: 'arn:aws:iam::123456789012:role/DeploymentRole',
      },
      pkgNamespace: '@test-org', // Required when using manual approval
      stages: [{
        name: 'dev',
        env: {
          account: '123456789013',
          region: 'eu-central-1',
        },
        postDeploySteps: [devAmplifyDeploy],
      }, {
        name: 'prod',
        manualApproval: true,
        env: {
          account: '123456789014',
          region: 'eu-central-1',
        },
        postDeploySteps: [prodAmplifyDeploy],
      }],
    });

    // Verify the pipeline was created
    expect(pipeline).toBeDefined();

    // Verify dev stage Amplify configuration
    const devConfig = devAmplifyDeploy.toGithub();
    expect(devConfig.steps[0].env).toEqual({ ENVIRONMENT: 'dev' });

    // Verify prod stage Amplify configuration
    const prodConfig = prodAmplifyDeploy.toGithub();
    expect(prodConfig.steps[0].env).toEqual({ ENVIRONMENT: 'prod' });

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  });

  test('integrates with CDK Pipeline using static app ID', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.150.0',
      name: 'static-id-app',
      defaultReleaseBranch: 'main',
    });

    // Create Amplify deployment with static app ID
    const amplifyDeploy = new AmplifyDeployStep(app, {
      appId: 'd123gtgt770s1x',
      artifactFile: 'dist.zip',
      branchName: 'production',
      region: 'ap-southeast-1',
    });

    // Add to CDK Pipeline
    new GithubCDKPipeline(app, {
      iamRoleArns: {
        default: 'arn:aws:iam::123456789012:role/DeploymentRole',
      },
      stages: [{
        name: 'production',
        env: {
          account: '123456789012',
          region: 'ap-southeast-1',
        },
        postDeploySteps: [amplifyDeploy],
      }],
    });

    // Verify the Amplify step configuration
    const bashConfig = amplifyDeploy.toBash();
    expect(bashConfig.commands).toContain('AMPLIFY_APP_ID="d123gtgt770s1x"');
    expect(bashConfig.commands).toContain('export AWS_REGION="ap-southeast-1"');

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  });
});