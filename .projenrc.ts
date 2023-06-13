import { cdk, github, javascript } from 'projen';

const project = new cdk.JsiiProject({
  author: 'Taimos GmbH',
  authorAddress: 'info@taimos.de',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'projen-pipelines',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/taimos/projen-pipelines.git',
  licensed: true,
  license: 'Apache-2.0',
  devDeps: [
    'fs-extra',
    '@types/fs-extra',
    '@types/standard-version',
  ],
  deps: [
    'projen',
  ],
  peerDeps: [
    'projen',
  ],
  bundledDeps: [
    'standard-version',
  ],
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['hoegertn', 'taimos-projen[bot]'], secret: 'GITHUB_TOKEN' },
  depsUpgradeOptions: { workflowOptions: { schedule: javascript.UpgradeDependenciesSchedule.WEEKLY } },
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
  },
  bin: {
    'pipelines-release': 'lib/release.js',
  },
  releaseToNpm: true,
  copyrightOwner: 'Taimos GmbH',
  copyrightPeriod: '2023',
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
});

project.synth();