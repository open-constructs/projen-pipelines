import { cdk, github, javascript } from 'projen';

const project = new cdk.JsiiProject({
  author: 'Taimos GmbH',
  authorAddress: 'info@taimos.de',
  authorOrganization: true,
  copyrightOwner: 'Taimos GmbH',
  copyrightPeriod: '2021',
  defaultReleaseBranch: 'main',
  name: 'projen-pipelines',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/taimos/projen-pipelines.git',
  licensed: true,
  license: 'Apache-2.0',
  devDeps: [
    'constructs',
    'fs-extra',
    '@types/fs-extra',
    '@types/standard-version',
  ],
  deps: [
    'projen',
  ],
  bundledDeps: [
    'standard-version',
  ],
  peerDeps: [
    'projen@>=0.81.0 <1.0.0',
    'constructs',
  ],
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['hoegertn', 'Lock128', 'taimos-projen[bot]'], secret: 'GITHUB_TOKEN' },
  depsUpgradeOptions: { workflowOptions: { schedule: javascript.UpgradeDependenciesSchedule.WEEKLY } },
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
  },
  keywords: [
    'aws',
    'cdk',
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

project.gitpod?.addCustomTask({
  init: 'yarn install --check-files --frozen-lockfile',
  command: 'npx projen build',
});

project.synth();