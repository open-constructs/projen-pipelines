import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { BashCDKPipeline } from '../src';

test('Bash snapshot', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new BashCDKPipeline(p, {
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
  expect(snapshot['.gitlab-ci.yml']).toBeUndefined();
  expect(snapshot['package.json']).toMatchSnapshot();
});