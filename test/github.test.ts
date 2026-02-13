import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GithubCDKPipeline, GithubStepConfig, PipelineStep, VersioningOutputs, VersioningStrategy } from '../src';

test('Github snapshot', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      assetPublishingPerStage: {
        prod: 'prodPublishRole',
      },
      deployment: {
        'my-dev': 'devRole',
        prod: 'prodRole',
      },
    },
    pkgNamespace: '@assembly',
    stages: [
      {
        name: 'my-dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
      {
        name: 'prod',
        manualApproval: true,
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['src/app.ts']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});

test('Github snapshot with environment', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        'my-dev': 'devRole',
        prod: 'prodRole',
        independent: 'independentRole',
      },
    },
    useGithubEnvironments: true,
    pkgNamespace: '@assembly',
    stages: [
      {
        name: 'my-dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
      {
        name: 'prod',
        manualApproval: true,
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
    independentStages: [
      {
        name: 'independent',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
});

test('Github snapshot with multi stack', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    deploySubStacks: true,
    stages: [
      {
        name: 'dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});

test('Github snapshot with custom runner', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    deploySubStacks: true,
    stages: [],
    runnerTags: ['custom-runner'],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
});

test('Github snapshot with custom node version', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
    minNodeVersion: '22.0.0',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    stages: [],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
});

test('Github snapshot with manual approval and GH packages', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    useGithubPackagesForAssembly: true,
    pkgNamespace: '@assembly',
    stages: [
      {
        name: 'prod',
        manualApproval: true,
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.npmrc']).toMatchSnapshot();
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
});

test('Github snapshot with feature stages', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        feature: 'featureRole',
      },
    },
    stages: [
      {
        name: 'dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
    featureStages: {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    },
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy-feature.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/destroy-feature.yml']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});

test('Github snapshot with preInstallStep', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  class TestStep extends PipelineStep {
    public toGithub(): GithubStepConfig {
      return {
        env: {
          FOO: 'bar',
        },
        needs: [],
        steps: [
          {
            run: 'echo Login',
          },
        ],
      };
    }
  }

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    preInstallSteps: [new TestStep(p)],
    stages: [
      {
        name: 'prod',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.npmrc']).toMatchSnapshot();
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
});

test('Github snapshot with independent stage', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  class TestStep extends PipelineStep {
    public toGithub(): GithubStepConfig {
      return {
        env: {
          FOO: 'bar',
        },
        needs: [],
        steps: [
          {
            run: 'echo Post Deploy',
          },
        ],
      };
    }
  }

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        independent1: 'deployRole',
      },
    },
    stages: [],
    independentStages: [
      {
        name: 'independent1',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
        postDeploySteps: [new TestStep(p)],
      },
      {
        name: 'independent2',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
        postDeploySteps: [new TestStep(p)],
        deployOnPush: true,
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(
    snapshot['.github/workflows/deploy-independent1.yml'],
  ).toMatchSnapshot();
});

test('Github snapshot with empty prefix for stages', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  class TestStep extends PipelineStep {
    public toGithub(): GithubStepConfig {
      return {
        env: {
          TEST: 'me',
        },
        needs: [],
        steps: [
          {
            run: 'echo Post Deploy',
          },
        ],
      };
    }
  }

  new GithubCDKPipeline(p, {
    stackPrefix: '', // Testing an empty prefix
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        stage1: 'deployRole1',
        stage2: 'deployRole2',
      },
    },
    stages: [
      {
        name: 'stage1',
        env: {
          account: '123456789012',
          region: 'eu-west-2',
        },
        postDeploySteps: [],
      },
      {
        name: 'stage2',
        env: {
          account: '123456789012',
          region: 'us-central-2',
        },
        postDeploySteps: [new TestStep(p)],
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  const deploySnapshot = snapshot['.github/workflows/deploy.yml'];
  const deployStage1Snapshot =
    snapshot['.github/workflows/deploy-independent1.yml'];
  const deployStage2Snapshot =
    snapshot['.github/workflows/deploy-independent2.yml'];
  const appTsSnapshot = snapshot['src/app.ts'];

  expect(deploySnapshot).toMatchSnapshot();
  expect(deployStage1Snapshot).toMatchSnapshot();
  expect(deployStage2Snapshot).toMatchSnapshot();

  // Check that the app.ts file contains the correct stack names and stage names
  // The stack name and stack identifier should match the stage name
  expect(appTsSnapshot).toMatchSnapshot();
  expect(appTsSnapshot.includes('this, 'stage1'')).toBeTruthy();
  expect(appTsSnapshot.includes('this, 'stage2'')).toBeTruthy();
  expect(
    appTsSnapshot.includes('stackName: 'stage1', stageName: 'stage1''),
  ).toBeTruthy();
  expect(
    appTsSnapshot.includes('stackName: 'stage2', stageName: 'stage2''),
  ).toBeTruthy();
});

test('Github snapshot with empty prefix for independent stages', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  class TestStep extends PipelineStep {
    public toGithub(): GithubStepConfig {
      return {
        env: {
          TEST: 'me',
        },
        needs: [],
        steps: [
          {
            run: 'echo Post Deploy',
          },
        ],
      };
    }
  }

  new GithubCDKPipeline(p, {
    stackPrefix: '', // Testing an empty prefix
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        independent1: 'deployRole',
      },
    },
    stages: [],
    independentStages: [
      {
        name: 'independent1',
        env: {
          account: '123456789012',
          region: 'eu-west-2',
        },
        postDeploySteps: [new TestStep(p)],
      },
      {
        name: 'independent2',
        env: {
          account: '123456789012',
          region: 'eu-central-2',
        },
        postDeploySteps: [new TestStep(p)],
        deployOnPush: true,
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  const deploySnapshot = snapshot['.github/workflows/deploy.yml'];
  const deployIndependent1Snapshot =
    snapshot['.github/workflows/deploy-independent1.yml'];
  const deployIndependent2Snapshot =
    snapshot['.github/workflows/deploy-independent2.yml'];
  const appTsSnapshot = snapshot['src/app.ts'];

  expect(deploySnapshot).toMatchSnapshot();
  expect(deployIndependent1Snapshot).toMatchSnapshot();
  expect(deployIndependent2Snapshot).toMatchSnapshot();

  // Check that the app.ts file contains the correct stack names and stage names
  // The stack name and stack identifier should match the stage name
  expect(appTsSnapshot).toMatchSnapshot();
  expect(appTsSnapshot.includes('this, 'independent1'')).toBeTruthy();
  expect(appTsSnapshot.includes('this, 'independent2'')).toBeTruthy();
  expect(
    appTsSnapshot.includes(
      'stackName: 'independent1', stageName: 'independent1'',
    ),
  ).toBeTruthy();
  expect(
    appTsSnapshot.includes(
      'stackName: 'independent2', stageName: 'independent2'',
    ),
  ).toBeTruthy();
});

test('Github snapshot with manual approval and no pkgNamespace', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  expect(
    () =>
      new GithubCDKPipeline(p, {
        iamRoleArns: {
          synth: 'synthRole',
          assetPublishing: 'publishRole',
        },
        pkgNamespace: undefined,
        stages: [
          {
            name: 'prod',
            manualApproval: true,
            env: {
              account: '123456789012',
              region: 'eu-central-1',
            },
          },
        ],
      }),
  ).toThrow(
    'pkgNamespace is required when using versioned artifacts (e.g. manual approvals)',
  );
});

test('Github snapshot with versioning enabled', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    versioning: {
      enabled: true,
      outputs: VersioningOutputs.standard({
        parameterName: '/{stackName}/version',
      }),
      strategy: VersioningStrategy.commitCount(),
    },
    stages: [
      {
        name: 'dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
      {
        name: 'prod',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['src/app.ts']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();

  // Verify versioning code is generated in app.ts
  expect(snapshot['src/app.ts']).toContain('loadVersionInfo');
  expect(snapshot['src/app.ts']).toContain('addVersioningToStack');
  expect(snapshot['src/app.ts']).toContain('CfnOutput');
  expect(snapshot['src/app.ts']).toContain('StringParameter');
});

test('Github snapshot with separate asset upload jobs', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    useGithubEnvironmentsForAssetUpload: true,
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      assetPublishingPerStage: {
        dev: 'devPublishRole',
        prod: 'prodPublishRole',
      },
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
    },
    versioning: {
      enabled: true,
      outputs: VersioningOutputs.standard({
        parameterName: '/{stackName}/version',
      }),
      strategy: VersioningStrategy.commitCount(),
    },
    stages: [
      {
        name: 'dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
      {
        name: 'prod',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['src/app.ts']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();

  // Verify versioning code is generated in app.ts
  expect(snapshot['src/app.ts']).toContain('loadVersionInfo');
  expect(snapshot['src/app.ts']).toContain('addVersioningToStack');
  expect(snapshot['src/app.ts']).toContain('CfnOutput');
  expect(snapshot['src/app.ts']).toContain('StringParameter');
});

test('Github snapshot with jump roles', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
      },
      jump: {
        dev: 'devJumpRole',
        prod: 'prodJumpRole',
        assetPublishing: 'publishJumpRole',
        synth: 'synthJumpRole',
      },
    },
    versioning: {
      enabled: true,
      outputs: VersioningOutputs.standard({
        parameterName: '/{stackName}/version',
      }),
      strategy: VersioningStrategy.commitCount(),
    },
    stages: [
      {
        name: 'dev',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
      {
        name: 'prod',
        env: {
          account: '123456789012',
          region: 'eu-central-1',
        },
      },
    ],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['src/app.ts']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();

  // Verify versioning code is generated in app.ts
  expect(snapshot['src/app.ts']).toContain('loadVersionInfo');
  expect(snapshot['src/app.ts']).toContain('addVersioningToStack');
  expect(snapshot['src/app.ts']).toContain('CfnOutput');
  expect(snapshot['src/app.ts']).toContain('StringParameter');
});
