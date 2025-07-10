import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { BashCDKPipeline, VersioningOutputs, VersioningStrategy } from '../src';

test('Bash snapshot', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new BashCDKPipeline(p, {
    iamRoleArns: {},
    personalStage: {
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    },
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
  expect(snapshot['.github/workflows/deploy.yml']).toBeUndefined();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['pipeline.md']).toMatchSnapshot();
});

test('Bash snapshot with pkgNamespace', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new BashCDKPipeline(p, {
    iamRoleArns: {},
    pkgNamespace: '@assembly',
    personalStage: {
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    },
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
  expect(snapshot['pipeline.md']).toMatchSnapshot();
});

test('Bash snapshot with versioning enabled', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new BashCDKPipeline(p, {
    iamRoleArns: {},
    versioning: {
      enabled: true,
      outputs: VersioningOutputs.standard(),
      strategy: VersioningStrategy.commitCount(),
    },
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['pipeline.md']).toMatchSnapshot();
  expect(snapshot['src/app.ts']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
  expect(snapshot['.gitignore']).toContain('~version.json');

  // Verify versioning code is generated in app.ts
  expect(snapshot['src/app.ts']).toContain('loadVersionInfo');
  expect(snapshot['src/app.ts']).toContain('addVersioningToStack');
  expect(snapshot['src/app.ts']).toContain('CfnOutput');
  expect(snapshot['src/app.ts']).toContain('StringParameter');
});