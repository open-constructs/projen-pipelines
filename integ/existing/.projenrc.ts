import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.160.0',
  defaultReleaseBranch: 'main',
  name: 'existing',
  projenrcTs: true,
  github: false,
  devDeps: [
    'projen',
    'projen-pipelines',
  ],
});
project.gitignore.addPatterns('yarn.lock', 'package-lock.json');

// This needs to go away after fixing yarn
project.package.addPackageResolutions('projen@0.88.3');

project.synth();