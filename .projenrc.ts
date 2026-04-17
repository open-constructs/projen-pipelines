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
  ],
  deps: [
    'commit-and-tag-version',
  ],
  bundledDeps: [
    'commit-and-tag-version',
  ],
  peerDeps: [
    'projen@>=0.99.49 <1.0.0',
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

new GitHubAssignApprover(project, {
  approverMapping: [
    { author: 'hoegertn', approvers: ['Lock128'] },
    { author: 'Lock128', approvers: ['hoegertn'] },
  ],
  defaultApprovers: ['hoegertn', 'Lock128'],
});

// Weekly maintenance: scan TypeScript source for `uses:` action references,
// pin them to the latest stable release's commit SHA, and open a PR with the
// result. Keeps generated pipelines on current, security-patched actions
// despite them living as string literals (invisible to Dependabot/Renovate).
const updateActionsWf = project.github?.addWorkflow('update-actions');
updateActionsWf?.on({
  workflowDispatch: {},
  schedule: [{ cron: '0 6 * * 1' }],
});
updateActionsWf?.addJobs({
  upgrade: {
    name: 'Upgrade GitHub Actions',
    runsOn: ['ubuntu-latest'],
    permissions: { contents: JobPermission.READ },
    outputs: {
      patch_created: { stepId: 'create_patch', outputName: 'patch_created' },
    },
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      {
        name: 'Setup Node',
        uses: 'actions/setup-node@v6',
        with: { 'node-version': '22' },
      },
      { name: 'Install dependencies', run: 'npm ci' },
      {
        name: 'Pin actions to latest release SHAs',
        env: { GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
        run: 'node scripts/update-github-actions.mjs',
      },
      { name: 'Regenerate project', run: 'npx projen build' },
      {
        name: 'Find mutations',
        id: 'create_patch',
        shell: 'bash',
        run: [
          'git add .',
          'git diff --staged --patch --exit-code > repo.patch || echo "patch_created=true" >> $GITHUB_OUTPUT',
        ].join('\n'),
      },
      {
        name: 'Upload patch',
        if: 'steps.create_patch.outputs.patch_created',
        uses: 'actions/upload-artifact@v7',
        with: { name: 'repo.patch', path: 'repo.patch', overwrite: true },
      },
    ],
  },
  pr: {
    name: 'Create Pull Request',
    needs: ['upgrade'],
    runsOn: ['ubuntu-latest'],
    permissions: { contents: JobPermission.READ },
    if: '${{ needs.upgrade.outputs.patch_created }}',
    steps: [
      {
        name: 'Generate token',
        id: 'generate_token',
        uses: 'actions/create-github-app-token@v2',
        with: {
          'app-id': '${{ secrets.PROJEN_APP_ID }}',
          'private-key': '${{ secrets.PROJEN_APP_PRIVATE_KEY }}',
        },
      },
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      {
        name: 'Download patch',
        uses: 'actions/download-artifact@v8',
        with: { name: 'repo.patch', path: '${{ runner.temp }}' },
      },
      {
        name: 'Apply patch',
        run: '[ -s ${{ runner.temp }}/repo.patch ] && git apply ${{ runner.temp }}/repo.patch || echo "Empty patch. Skipping."',
      },
      {
        name: 'Set git identity',
        run: [
          'git config user.name "github-actions[bot]"',
          'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
        ].join('\n'),
      },
      {
        name: 'Create Pull Request',
        uses: 'peter-evans/create-pull-request@v8',
        with: {
          'token': '${{ steps.generate_token.outputs.token }}',
          'commit-message': 'chore(deps): pin github actions to latest release SHAs',
          'branch': 'github-actions/update-actions',
          'title': 'chore(deps): update pinned GitHub Actions',
          'labels': 'auto-approve,dependencies,github-actions',
          'body': [
            'Pins action references in `src/` to the latest stable release commit SHAs.',
            '',
            'See the job summary of the [workflow run] for a per-action diff.',
            '',
            '[Workflow Run]: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}',
            '',
            '------',
            '',
            '*Automatically created by the `update-actions` workflow.*',
          ].join('\n'),
          'author': 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
          'committer': 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
          'signoff': true,
        },
      },
    ],
  },
});

project.synth();