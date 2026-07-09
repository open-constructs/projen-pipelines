import { NodeProject } from 'projen/lib/javascript';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GithubPagesWorkflow } from '../src';

describe('GithubPagesWorkflow', () => {
  test('creates workflow with default options', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run build:docs',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom docs folder', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run build:docs',
      docsFolder: 'dist/docs',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom domain', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'pnpm build:docs',
      docsFolder: 'public',
      customDomain: 'docs.example.com',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom workflow name', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'yarn docs',
      workflowName: 'deploy-docs',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/deploy-docs.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom branch', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run docs',
      branchName: 'develop',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom runner tags', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run build:docs',
      runnerTags: ['self-hosted', 'linux'],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom Node.js version', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run docs',
      nodeVersion: '18',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow without install step', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run docs',
      runInstall: false,
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with custom install command', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'pnpm build:docs',
      installCommand: 'pnpm install --frozen-lockfile',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('creates workflow with all custom options', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'pnpm build:documentation',
      docsFolder: 'build/docs',
      customDomain: 'documentation.mycompany.com',
      workflowName: 'docs-deployment',
      branchName: 'production',
      runnerTags: ['ubuntu-22.04'],
      nodeVersion: '20',
      installCommand: 'pnpm install --frozen-lockfile',
      artifactName: 'my-docs',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/docs-deployment.yml']).toMatchSnapshot();
  });

  test('creates workflow with TypeScript project', () => {
    const project = new NodeProject({
      name: 'typescript-docs-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npx typedoc',
      docsFolder: 'docs',
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/github-pages.yml']).toMatchSnapshot();
  });

  test('workflow has correct permissions', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run docs',
    });

    const snapshot = synthSnapshot(project);
    const workflowYaml = snapshot['.github/workflows/github-pages.yml'];

    // Check that the workflow includes the necessary permissions
    expect(workflowYaml).toContain('pages: write');
    expect(workflowYaml).toContain('id-token: write');
    expect(workflowYaml).toContain('contents: read');
  });

  test('workflow includes checkout and setup steps', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run build:docs',
    });

    const snapshot = synthSnapshot(project);
    const workflowYaml = snapshot['.github/workflows/github-pages.yml'];

    // Check for checkout action
    expect(workflowYaml).toContain('actions/checkout@v4');

    // Check for Node.js setup
    expect(workflowYaml).toContain('actions/setup-node@v4');

    // Check for install step
    expect(workflowYaml).toContain('npm ci');

    // Check for GitHub Pages actions
    expect(workflowYaml).toContain('actions/upload-pages-artifact@v3');
    expect(workflowYaml).toContain('actions/deploy-pages@v4');
  });

  test('workflow has concurrency group', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run docs',
    });

    const snapshot = synthSnapshot(project);
    const workflowYaml = snapshot['.github/workflows/github-pages.yml'];

    // Check for concurrency configuration
    expect(workflowYaml).toContain('concurrency:');
    expect(workflowYaml).toContain('group: pages');
  });

  test('workflow triggers on push and workflow_dispatch', () => {
    const project = new NodeProject({
      name: 'test-project',
      defaultReleaseBranch: 'main',
    });

    new GithubPagesWorkflow(project, {
      buildCommand: 'npm run docs',
      branchName: 'main',
    });

    const snapshot = synthSnapshot(project);
    const workflowYaml = snapshot['.github/workflows/github-pages.yml'];

    // Check for triggers
    expect(workflowYaml).toContain('push:');
    expect(workflowYaml).toContain('branches:');
    expect(workflowYaml).toContain('- main');
    expect(workflowYaml).toContain('workflow_dispatch: {}');
  });
});
