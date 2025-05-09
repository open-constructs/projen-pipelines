import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { CdkDiffType, GitlabCDKPipeline, GitlabStepConfig, PipelineStep } from '../src';

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
      assetPublishingPerStage: {
        prod: 'prodPublishRole',
      },
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    stages: [{
      name: 'dev',
      diffType: CdkDiffType.FAST,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      manualApproval: true,
      diffType: CdkDiffType.FULL,
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

test('Gitlab snapshot with preInstallStep', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  class TestStep extends PipelineStep {
    public toGitlab(): GitlabStepConfig {
      return {
        env: {
          FOO: 'bar',
        },
        needs: [],
        commands: ['echo Login'],
        extensions: [],
      };
    }
  }

  new GitlabCDKPipeline(p, {
    iamRoleArns: {
      default: 'defaultRole',
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    preInstallSteps: [new TestStep(p)],
    stages: [{
      name: 'prod',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.npmrc']).toMatchSnapshot();
  expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
});

test('Gitlab snapshot with independent stage', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  class TestStep extends PipelineStep {
    public toGitlab(): GitlabStepConfig {
      return {
        env: {
          FOO: 'bar',
        },
        needs: [],
        commands: [
          'echo Post Deploy',
        ],
        extensions: [],
      };
    }
  }

  new GitlabCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        independent1: 'deployRole',
        independent2: 'deployRole',
      },
    },
    stages: [],
    independentStages: [{
      name: 'independent1',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
      diffType: CdkDiffType.FULL,
      postDeploySteps: [new TestStep(p)],
    }, {
      name: 'independent2',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
      diffType: CdkDiffType.NONE,
      postDeploySteps: [new TestStep(p)],
      deployOnPush: true,
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
});