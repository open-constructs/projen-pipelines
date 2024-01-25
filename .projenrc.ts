import { cdk, github, javascript } from 'projen';

const project = new cdk.JsiiProject({
  author: 'Taimos GmbH',
  authorAddress: 'info@taimos.de',
  authorOrganization: true,
  copyrightOwner: 'Taimos GmbH',
  copyrightPeriod: '2024',
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
    '@amazon-codecatalyst/blueprint-util.projen-blueprint',
    '@amazon-codecatalyst/blueprint-util.cli',
  ],
  deps: [
    'projen',
  ],
  bundledDeps: [
    'standard-version',
    '@amazon-codecatalyst/blueprints.blueprint',
    '@amazon-codecatalyst/blueprint-component.workflows',
    '@amazon-codecatalyst/blueprint-component.source-repositories',
    '@amazon-codecatalyst/blueprint-component.dev-environments',
    '@amazon-codecatalyst/blueprint-component.environments',
  ],
  peerDeps: [
    'projen',
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

project.package.addPackageResolutions('projen@0.79.3');

project.gitpod?.addCustomTask({
  init: 'yarn install --check-files --frozen-lockfile',
  command: 'npx projen build',
});

project.synth();