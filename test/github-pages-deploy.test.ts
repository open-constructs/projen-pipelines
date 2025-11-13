import { Project } from 'projen';
import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GithubCDKPipeline, GithubPagesDeployStep } from '../src';

describe('GithubPagesDeployStep', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ name: 'test-project' });
  });

  test('generates correct configuration with defaults', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run build:docs',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('generates correct configuration with custom docs folder', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'pnpm build:docs',
      docsFolder: 'dist/docs',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('generates correct configuration with custom domain', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run generate:docs',
      docsFolder: 'public',
      customDomain: 'docs.example.com',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('generates correct configuration with all options', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'yarn build:documentation',
      docsFolder: 'build/docs',
      sourceBranch: 'develop',
      customDomain: 'documentation.mycompany.com',
      artifactName: 'my-docs-artifact',
    });

    expect(step.toBash()).toMatchSnapshot();
    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('GitHub config includes upload-pages-artifact action', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run build:docs',
      docsFolder: 'docs-output',
    });

    const githubConfig = step.toGithub();
    expect(githubConfig.steps).toHaveLength(3);
    expect(githubConfig.steps[0].name).toBe('Build Documentation');
    expect(githubConfig.steps[1].name).toBe('Upload Pages Artifact');
    expect(githubConfig.steps[1].uses).toBe('actions/upload-pages-artifact@v3');
    expect(githubConfig.steps[1].with).toEqual({
      path: 'docs-output',
      name: 'github-pages',
    });
  });

  test('GitHub config includes deploy-pages action', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run docs',
    });

    const githubConfig = step.toGithub();
    expect(githubConfig.steps).toHaveLength(3);
    expect(githubConfig.steps[2].name).toBe('Deploy to GitHub Pages');
    expect(githubConfig.steps[2].uses).toBe('actions/deploy-pages@v4');
    expect(githubConfig.steps[2].id).toBe('deployment');
  });

  test('GitHub config includes required permissions', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run build:docs',
    });

    const githubConfig = step.toGithub();
    expect(githubConfig.permissions).toBeDefined();
    expect(githubConfig.permissions?.contents).toBe('read');
    expect(githubConfig.permissions?.pages).toBe('write');
    expect(githubConfig.permissions?.idToken).toBe('write');
  });

  test('GitHub config adds custom domain with CNAME', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run docs',
      docsFolder: 'site',
      customDomain: 'docs.example.org',
    });

    const githubConfig = step.toGithub();
    expect(githubConfig.steps).toHaveLength(4);
    expect(githubConfig.steps[1].name).toBe('Add Custom Domain');
    expect(githubConfig.steps[1].run).toBe('echo "docs.example.org" > site/CNAME');
  });

  test('GitLab config uses public folder convention', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run build',
      docsFolder: 'dist',
    });

    const gitlabConfig = step.toGitlab();
    expect(gitlabConfig.commands).toContain('rm -rf public');
    expect(gitlabConfig.commands).toContain('cp -r dist public');
  });

  test('GitLab config adds custom domain', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run docs',
      customDomain: 'pages.example.com',
    });

    const gitlabConfig = step.toGitlab();
    expect(gitlabConfig.commands).toContain('echo "pages.example.com" > public/CNAME');
  });

  test('Bash config shows documentation location', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'make docs',
      docsFolder: 'output',
    });

    const bashConfig = step.toBash();
    expect(bashConfig.commands).toContain('echo "Building documentation..."');
    expect(bashConfig.commands).toContain('make docs');
    expect(bashConfig.commands).toContain('echo "Documentation built in output"');
  });

  test('CodeCatalyst throws not supported error', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run docs',
    });

    expect(() => step.toCodeCatalyst()).toThrow('CodeCatalyst is not supported for GitHub Pages deployment');
  });

  test('can be added as post-deployment step to CDK Pipeline', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.150.0',
      name: 'test-app',
      defaultReleaseBranch: 'main',
    });

    // Create the GitHub Pages deployment step
    const ghPagesDeploy = new GithubPagesDeployStep(app, {
      buildCommand: 'npm run build:api-docs',
      docsFolder: 'api-docs',
      customDomain: 'api.example.com',
    });

    // Create a CDK Pipeline with GitHub Pages deployment as post-deploy step
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
        postDeploySteps: [ghPagesDeploy],
      }],
    });

    // Verify the pipeline was created
    expect(pipeline).toBeDefined();

    // Verify the GitHub Pages step has correct configuration
    const githubConfig = ghPagesDeploy.toGithub();
    expect(githubConfig.steps).toHaveLength(4);
    expect(githubConfig.steps[0].name).toBe('Build Documentation');
    expect(githubConfig.steps[1].name).toBe('Add Custom Domain');
    expect(githubConfig.steps[2].name).toBe('Upload Pages Artifact');
    expect(githubConfig.steps[3].name).toBe('Deploy to GitHub Pages');
    expect(githubConfig.permissions?.pages).toBe('write');

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  });

  test('supports deployment without custom domain', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.150.0',
      name: 'simple-docs-app',
      defaultReleaseBranch: 'main',
    });

    // Create GitHub Pages deployment without custom domain
    const ghPagesDeploy = new GithubPagesDeployStep(app, {
      buildCommand: 'npx typedoc',
      docsFolder: 'docs',
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
          region: 'eu-west-1',
        },
        postDeploySteps: [ghPagesDeploy],
      }],
    });

    // Verify the GitHub Pages step configuration
    const githubConfig = ghPagesDeploy.toGithub();
    expect(githubConfig.steps).toHaveLength(3);
    expect(githubConfig.steps[0].name).toBe('Build Documentation');
    expect(githubConfig.steps[0].run).toBe('npx typedoc');

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  });

  test('uses custom artifact name when specified', () => {
    const step = new GithubPagesDeployStep(project, {
      buildCommand: 'npm run docs',
      artifactName: 'my-custom-docs',
    });

    const githubConfig = step.toGithub();
    const uploadStep = githubConfig.steps.find(s => s.uses === 'actions/upload-pages-artifact@v3');
    const deployStep = githubConfig.steps.find(s => s.uses === 'actions/deploy-pages@v4');

    expect(uploadStep?.with).toEqual({
      path: 'docs',
      name: 'my-custom-docs',
    });
    expect(deployStep?.with).toEqual({
      artifact_name: 'my-custom-docs',
    });
  });
});
