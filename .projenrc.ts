import { github, javascript, typescript } from 'projen';

const project = new typescript.TypeScriptProject({
  authorName: 'Taimos GmbH',
  authorEmail: 'info@taimos.de',
  authorOrganization: true,
  authorUrl: 'https://taimos.de',
  copyrightOwner: 'Taimos GmbH',
  copyrightPeriod: '2021',
  defaultReleaseBranch: 'main',
  name: 'projen-pipelines',
  projenrcTs: true,
  repository: 'https://github.com/taimos/projen-pipelines.git',
  licensed: true,
  license: 'Apache-2.0',
  devDeps: [
    'fs-extra',
    '@types/fs-extra',
    '@types/standard-version',
  ],
  deps: [
    'projen',
    'standard-version',
    'case',
  ],
  peerDeps: [
    'projen',
  ],
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['hoegertn', 'taimos-projen[bot]'], secret: 'GITHUB_TOKEN' },
  depsUpgradeOptions: { workflowOptions: { schedule: javascript.UpgradeDependenciesSchedule.WEEKLY } },
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
  },
  keywords: [
    'aws',
    'cdk',
    'projen',
    'cicd',
    'pipelines',
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


const yacl_publish = project.addTask('yacl-publish', {
  description: 'publishes to local yacl repostory',
  exec: 'npx projen build',
});
yacl_publish.exec('npx yalc push --replace');

project.synth();