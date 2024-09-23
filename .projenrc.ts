import { ReleasableCommits, cdk, github, javascript } from 'projen';

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
  jsiiVersion: '~5.4',
  devDeps: [
    'constructs',
    'fs-extra',
    '@types/fs-extra',
    '@types/standard-version',
    '@amazon-codecatalyst/blueprint-util.projen-blueprint',
    '@amazon-codecatalyst/blueprint-util.cli',
  ],
  bundledDeps: [
    'standard-version',
    '@amazon-codecatalyst/blueprint-component.environments',
    '@amazon-codecatalyst/blueprint-component.workflows',
    '@amazon-codecatalyst/blueprints.blueprint',
  ],
  peerDeps: [
    'projen@>=0.86.7 <1.0.0',
    'constructs',
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

project.synth();