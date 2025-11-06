import { ReleasableCommits, cdk, github, javascript } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { GitHubAssignApprover } from './src/assign-approver';

const project = new cdk.JsiiProject({
  author: 'The Open Construct Foundation',
  authorAddress: 'info@taimos.de',
  authorOrganization: true,
  copyrightOwner: 'The Open Construct Foundation',
  copyrightPeriod: '2024',
  defaultReleaseBranch: 'main',
  name: 'projen-pipelines',
  projenrcTs: true,
  packageManager: javascript.NodePackageManager.NPM,
  repositoryUrl: 'https://github.com/open-constructs/projen-pipelines.git',
  licensed: true,
  license: 'Apache-2.0',
  jsiiVersion: '~5.8',
  devDeps: [
    'constructs',
    'fs-extra',
    '@types/fs-extra',
    '@types/standard-version',
  ],
  bundledDeps: [
    'standard-version',
  ],
  peerDeps: [
    'projen@>=0.96.3 <1.0.0',
    'constructs@^10.4.2',
  ],
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['hoegertn', 'Lock128', 'open-constructs-projen[bot]'], secret: 'GITHUB_TOKEN' },
  depsUpgradeOptions: { workflowOptions: { schedule: javascript.UpgradeDependenciesSchedule.WEEKLY } },
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ['feat', 'fix', 'chore', 'ci', 'docs', 'style', 'refactor', 'test', 'revert', 'Revert'],
      },
    },
  },
  releasableCommits: ReleasableCommits.ofType(['feat', 'fix', 'revert', 'Revert', 'docs']),
  keywords: [
    'aws',
    'cdk',
    'projen',
  ],
  bin: {
    'pipelines-release': 'lib/release.js',
    'detect-drift': 'lib/drift/detect-drift.js',
    'count-resources': 'lib/awscdk/count-resources.js',
  },
  releaseToNpm: true,
  gitpod: true,
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
});

project.addTask('local-push', { exec: 'npx yalc push' }).prependSpawn(project.buildTask);

project.gitpod?.addCustomTask({
  init: 'npm ci',
  command: 'npx projen build',
});

// Integration tests for existing and new projects
const integWf = project.github?.addWorkflow('integ');
integWf?.on({
  push: { branches: ['main'] },
  workflowDispatch: {},
  pullRequest: {},
});
integWf?.addJobs({
  'build': {
    runsOn: ['ubuntu-latest'],
    permissions: { contents: JobPermission.WRITE },
    steps: [
      {
        name: 'Checkout',
        uses: 'actions/checkout@v5',
        with:
        {
          ref: '${{github.event.pull_request.head.ref}}',
          repository: '${{github.event.pull_request.head.repo.full_name}}',
        },
      },
      { name: 'Install dependencies', run: 'npm install' },
      { name: 'build', run: 'npx projen compile' },
      {
        name: 'Upload artifact',
        uses: 'actions/upload-artifact@v4.6.2',
        with: { name: 'integ-artifact', path: 'lib/\n.jsii', overwrite: true },
      },
    ],
  },
  'test-yarn-existing': {
    runsOn: ['ubuntu-latest'],
    needs: ['build'],
    permissions: {},
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v5' },
      { name: 'Download artifact', uses: 'actions/download-artifact@v5', with: { name: 'integ-artifact' } },
      { name: 'Run yalc', run: 'npx yalc publish' },
      { name: 'Add yalc', run: 'cd integ/existing && npx yalc add projen-pipelines' },
      { name: 'Run Test', run: 'cd integ/existing && npx yarn install' },
    ],
  },
  'test-npm-existing': {
    runsOn: ['ubuntu-latest'],
    needs: ['build'],
    permissions: {},
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v5' },
      { name: 'Download artifact', uses: 'actions/download-artifact@v5', with: { name: 'integ-artifact' } },
      { name: 'Run yalc', run: 'npx yalc publish' },
      { name: 'Add yalc', run: 'cd integ/existing && npx yalc add projen-pipelines' },
      { name: 'Run Test', run: 'cd integ/existing && npx npm install' },
    ],
  },
});

new GitHubAssignApprover(project, {
  approverMapping: [
    { author: 'hoegertn', approvers: ['Lock128'] },
    { author: 'Lock128', approvers: ['hoegertn'] },
  ],
  defaultApprovers: ['hoegertn', 'Lock128'],
});

project.synth();