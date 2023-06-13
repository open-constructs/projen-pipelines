import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Thorsten Hoeger',
  authorAddress: 'thorsten.hoeger@taimos.de',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'projen-pipelines',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/hoegertn/projen-pipelines.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();