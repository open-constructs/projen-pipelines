import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GitlabCDKPipeline } from '../src';

test('Gitlab snapshot', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GitlabCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    pkgNamespace: '@assembly',
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
});


test('Gitlab snapshot with runner tags', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GitlabCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    runnerTags: {
      synth: ['synthTag'],
      assetPublishing: ['assetTag'],
      diff: {
        dev: ['devDiffTag'],
      },
      deployment: {
        dev: ['devTag'],
        prod: ['prodTag'],
      },
    },
    pkgNamespace: '@assembly',
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
});


test('Gitlab snapshot with runner default tags', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GitlabCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    runnerTags: {
      default: ['defaultTag'],
    },
    pkgNamespace: '@assembly',
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
});