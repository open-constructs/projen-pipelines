import { DependencyType, ReleasableCommits, cdk, github, javascript } from 'projen';
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
  jsiiVersion: '~5.9',
  devDeps: [
    'constructs',
    'fs-extra',
    '@types/fs-extra',
    'tsx',
  ],
  deps: [
    'commit-and-tag-version',
  ],
  bundledDeps: [
    'commit-and-tag-version',
  ],
  peerDeps: [
    'projen@>=0.103.5 <1.0.0',
    'constructs@^10.5.1',
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
  releasableCommits: ReleasableCommits.ofType(['feat', 'fix', 'revert', 'Revert', 'docs', 'chore']),
  keywords: [
    'aws',
    'cdk',
    'projen',
  ],
  bin: {
    'pipelines-release': 'lib/release.js',
    'detect-drift': 'lib/drift/detect-drift.js',
  },
  releaseToNpm: true,
  npmTrustedPublishing: true,
  gitpod: true,
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
});

project.deps.removeDependency('commit-and-tag-version', DependencyType.BUILD);

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
        uses: 'actions/checkout@v6',
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
        uses: 'actions/upload-artifact@v7',
        with: { name: 'integ-artifact', path: 'lib/\n.jsii', overwrite: true },
      },
    ],
  },
  'test-yarn-existing': {
    runsOn: ['ubuntu-latest'],
    needs: ['build'],
    permissions: {},
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      { name: 'Download artifact', uses: 'actions/download-artifact@v8', with: { name: 'integ-artifact' } },
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
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      { name: 'Download artifact', uses: 'actions/download-artifact@v8', with: { name: 'integ-artifact' } },
      { name: 'Run yalc', run: 'npx yalc publish' },
      { name: 'Add yalc', run: 'cd integ/existing && npx yalc add projen-pipelines' },
      { name: 'Run Test', run: 'cd integ/existing && npx npm install' },
    ],
  },
});

// Automated pinning of GitHub Action references in generated workflows.
// Generated `uses: 'owner/repo@ref'` literals are not tracked by Dependabot or
// Renovate, so this scheduled workflow keeps them pinned to the latest stable
// release SHA.
const updateActionsWf = project.github?.addWorkflow('update-actions');
updateActionsWf?.on({
  schedule: [{ cron: '0 6 * * 1' }],
  workflowDispatch: {},
});
updateActionsWf?.addJobs({
  upgrade: {
    runsOn: ['ubuntu-latest'],
    permissions: { contents: JobPermission.READ },
    env: { GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      { name: 'Setup Node.js', uses: 'actions/setup-node@v6', with: { 'node-version': '20' } },
      { name: 'Install dependencies', run: 'npm ci' },
      {
        name: 'Pin GitHub Actions',
        run: 'npx tsx src/security/update-github-actions.ts src .projen .projenrc.ts',
      },
      { name: 'Regenerate project', run: 'npx projen' },
      {
        name: 'Create patch',
        id: 'diff',
        run: 'git diff --patch --exit-code > .repo.patch || echo "patch_created=true" >> $GITHUB_OUTPUT',
      },
      {
        name: 'Upload patch',
        if: "steps.diff.outputs.patch_created == 'true'",
        uses: 'actions/upload-artifact@v7',
        with: { name: 'repo.patch', path: '.repo.patch' },
      },
    ],
  },
  pr: {
    runsOn: ['ubuntu-latest'],
    needs: ['upgrade'],
    permissions: { contents: JobPermission.WRITE, pullRequests: JobPermission.WRITE },
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      {
        name: 'Download patch',
        uses: 'actions/download-artifact@v8',
        with: { name: 'repo.patch' },
      },
      { name: 'Apply patch', run: '[ -f .repo.patch ] && git apply .repo.patch || echo "No patch to apply"' },
      {
        name: 'Create Pull Request',
        uses: 'peter-evans/create-pull-request@v7',
        with: {
          'token': '${{ secrets.PROJEN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}',
          'commit-message': 'chore: pin GitHub Actions to latest release SHAs',
          'branch': 'auto/pin-github-actions',
          'title': 'chore: pin GitHub Actions to latest release SHAs',
          'body': 'Automated update of pinned GitHub Action references to their latest stable release commit SHAs.',
        },
      },
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