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
project.synth();