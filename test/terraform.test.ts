import { GitHubProject } from 'projen/lib/github';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GithubTerraformPipeline, GitlabTerraformPipeline } from '../src';

test('Github snapshot', () => {
  const p = new GitHubProject({
    name: 'testapp',
  });

  new GithubTerraformPipeline(p, {
    iamRoleArns: {
      default: 'defaultRole',
    },
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});

test('Github snapshot with name', () => {
  const p = new GitHubProject({
    name: 'testapp',
  });

  new GithubTerraformPipeline(p, {
    name: 'foo',
    iamRoleArns: {
      default: 'defaultRole',
    },
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy-foo.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/deploy.yml']).toBeUndefined();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});

test('Gitlab snapshot', () => {
  const p = new GitHubProject({
    name: 'testapp',
  });

  new GitlabTerraformPipeline(p, {
    iamRoleArns: {
      default: 'defaultRole',
    },
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
});