import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { NodePackageManager } from 'projen/lib/javascript';
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
        'prod': 'prodRole',
      },
    },
    pkgNamespace: '@assembly',
    stages: [{
      name: 'my-dev',
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
        'prod': 'prodRole',
        'independent': 'independentRole',
      },
    },
    useGithubEnvironments: true,
    pkgNamespace: '@assembly',
    stages: [{
      name: 'my-dev',
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
    independentStages: [{
      name: 'independent',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
});

test('Github snapshot with custom github environment name', () => {
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
        'prod': 'prodRole',
      },
    },
    useGithubEnvironments: true,
    pkgNamespace: '@assembly',
    stages: [{
      name: 'my-dev',
      githubEnvironment: 'development',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }, {
      name: 'prod',
      githubEnvironment: 'production',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployWorkflow = snapshot['.github/workflows/deploy.yml'];
  const releaseWorkflow = snapshot['.github/workflows/release-prod.yml'];

  expect(deployWorkflow).toContain('environment: development');
  expect(deployWorkflow).not.toContain('environment: my-dev');
  expect(releaseWorkflow).toContain('environment: production');
  // 'environment: prod' is a substring of 'environment: production', so check exact match via regex
  expect(releaseWorkflow).not.toMatch(/environment: prod\b(?!uction)/);
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
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
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
    stages: [{
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
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
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
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
        steps: [{
          run: 'echo Login',
        }],
      };
    }
  }

  new GithubCDKPipeline(p, {
    iamRoleArns: {
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
        steps: [{
          run: 'echo Post Deploy',
        }],
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
    independentStages: [{
      name: 'independent1',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
      postDeploySteps: [new TestStep(p)],
    }, {
      name: 'independent2',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
      postDeploySteps: [new TestStep(p)],
      deployOnPush: true,
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['.github/workflows/deploy-independent1.yml']).toMatchSnapshot();
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
        steps: [{
          run: 'echo Post Deploy',
        }],
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
    stages: [{
      name: 'stage1',
      env: {
        account: '123456789012',
        region: 'eu-west-2',
      },
      postDeploySteps: [],
    }, {
      name: 'stage2',
      env: {
        account: '123456789012',
        region: 'us-central-2',
      },
      postDeploySteps: [new TestStep(p)],
    }],
  });

  const snapshot = synthSnapshot(p);
  const deploySnapshot = snapshot['.github/workflows/deploy.yml'];
  const deployStage1Snapshot = snapshot['.github/workflows/deploy-independent1.yml'];
  const deployStage2Snapshot = snapshot['.github/workflows/deploy-independent2.yml'];
  const appTsSnapshot = snapshot['src/app.ts'];

  expect(deploySnapshot).toMatchSnapshot();
  expect(deployStage1Snapshot).toMatchSnapshot();
  expect(deployStage2Snapshot).toMatchSnapshot();

  // Check that the app.ts file contains the correct stack names and stage names
  // The stack name and stack identifier should match the stage name
  expect(appTsSnapshot).toMatchSnapshot();
  expect(appTsSnapshot.includes('this, \'stage1\'')).toBeTruthy();
  expect(appTsSnapshot.includes('this, \'stage2\'')).toBeTruthy();
  expect(appTsSnapshot.includes('stackName: \'stage1\', stageName: \'stage1\'')).toBeTruthy();
  expect(appTsSnapshot.includes('stackName: \'stage2\', stageName: \'stage2\'')).toBeTruthy();


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
        steps: [{
          run: 'echo Post Deploy',
        }],
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
    independentStages: [{
      name: 'independent1',
      env: {
        account: '123456789012',
        region: 'eu-west-2',
      },
      postDeploySteps: [new TestStep(p)],
    }, {
      name: 'independent2',
      env: {
        account: '123456789012',
        region: 'eu-central-2',
      },
      postDeploySteps: [new TestStep(p)],
      deployOnPush: true,
    }],
  });

  const snapshot = synthSnapshot(p);
  const deploySnapshot = snapshot['.github/workflows/deploy.yml'];
  const deployIndependent1Snapshot = snapshot['.github/workflows/deploy-independent1.yml'];
  const deployIndependent2Snapshot = snapshot['.github/workflows/deploy-independent2.yml'];
  const appTsSnapshot = snapshot['src/app.ts'];

  expect(deploySnapshot).toMatchSnapshot();
  expect(deployIndependent1Snapshot).toMatchSnapshot();
  expect(deployIndependent2Snapshot).toMatchSnapshot();

  // Check that the app.ts file contains the correct stack names and stage names
  // The stack name and stack identifier should match the stage name
  expect(appTsSnapshot).toMatchSnapshot();
  expect(appTsSnapshot.includes('this, \'independent1\'')).toBeTruthy();
  expect(appTsSnapshot.includes('this, \'independent2\'')).toBeTruthy();
  expect(appTsSnapshot.includes('stackName: \'independent1\', stageName: \'independent1\'')).toBeTruthy();
  expect(appTsSnapshot.includes('stackName: \'independent2\', stageName: \'independent2\'')).toBeTruthy();
});

test('Github snapshot with manual approval and no pkgNamespace', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  expect(() => new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
    },
    pkgNamespace: undefined,
    stages: [{
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  })).toThrow('pkgNamespace is required when using versioned artifacts (e.g. manual approvals)');
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
      outputs: VersioningOutputs.standard({ parameterName: '/{stackName}/version' }),
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

test('Github snapshot with explicit pipelineName', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    pipelineName: 'backend',
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
    featureStages: {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    },
    independentStages: [{
      name: 'sandbox',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);

  // Workflow files should be prefixed
  expect(snapshot['.github/workflows/backend-deploy.yml']).toBeDefined();
  expect(snapshot['.github/workflows/backend-deploy-feature.yml']).toBeDefined();
  expect(snapshot['.github/workflows/backend-destroy-feature.yml']).toBeDefined();
  expect(snapshot['.github/workflows/backend-release-prod.yml']).toBeDefined();
  expect(snapshot['.github/workflows/backend-deploy-sandbox.yml']).toBeDefined();

  // Old unprefixed files should not exist
  expect(snapshot['.github/workflows/deploy.yml']).toBeUndefined();
  expect(snapshot['.github/workflows/deploy-feature.yml']).toBeUndefined();
  expect(snapshot['.github/workflows/destroy-feature.yml']).toBeUndefined();
  expect(snapshot['.github/workflows/release-prod.yml']).toBeUndefined();
  expect(snapshot['.github/workflows/deploy-sandbox.yml']).toBeUndefined();

  // Verify artifact names and concurrency groups are prefixed
  const deployYml = snapshot['.github/workflows/backend-deploy.yml'];
  expect(deployYml).toContain('backend-cloud-assembly');
  expect(deployYml).toContain('backend-cdk-outputs-dev');
  expect(deployYml).toContain('backend-deploy-dev');

  const featureDeployYml = snapshot['.github/workflows/backend-deploy-feature.yml'];
  expect(featureDeployYml).toContain('backend-cdk-outputs-feature');
  expect(featureDeployYml).toContain('backend-deploy-feature-');

  const featureDestroyYml = snapshot['.github/workflows/backend-destroy-feature.yml'];
  expect(featureDestroyYml).toContain('backend-destroy-feature-');

  const releaseYml = snapshot['.github/workflows/backend-release-prod.yml'];
  expect(releaseYml).toContain('backend-cdk-outputs-prod');
  expect(releaseYml).toContain('backend-deploy-prod');

  const sandboxYml = snapshot['.github/workflows/backend-deploy-sandbox.yml'];
  expect(sandboxYml).toContain('backend-cdk-outputs-sandbox');
  expect(sandboxYml).toContain('backend-deploy-sandbox');

  expect(deployYml).toMatchSnapshot();
  expect(featureDeployYml).toMatchSnapshot();
  expect(featureDestroyYml).toMatchSnapshot();
  expect(releaseYml).toMatchSnapshot();
  expect(sandboxYml).toMatchSnapshot();
});

test('Github snapshot with no pipelineName on standalone project', () => {
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
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);

  // Standalone project without parent should have no prefix
  expect(snapshot['.github/workflows/deploy.yml']).toBeDefined();
  expect(snapshot['.github/workflows/deploy.yml']).toContain('cloud-assembly');
  expect(snapshot['.github/workflows/deploy.yml']).not.toContain('testapp-cloud-assembly');
});

test('Github snapshot with pnpm package manager', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
    packageManager: NodePackageManager.PNPM,
    pnpmVersion: '9',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
      },
    },
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];

  expect(deployYml).toMatchSnapshot();

  // Verify pnpm setup step is present
  expect(deployYml).toContain('pnpm/action-setup@v4');
  expect(deployYml).toContain('Setup pnpm');

  // Verify pnpm setup appears in all jobs (synth, assetUpload, deploy)
  const pnpmSetupCount = (deployYml.match(/pnpm\/action-setup@v4/g) || []).length;
  expect(pnpmSetupCount).toBe(3);
});

test('Github snapshot with path filters', () => {
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
      },
    },
    paths: ['packages/my-app/**', 'shared-libs/**'],
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];

  expect(deployYml).toMatchSnapshot();

  // Verify path filters are present in the workflow trigger
  expect(deployYml).toContain('packages/my-app/**');
  expect(deployYml).toContain('shared-libs/**');
});

test('Github snapshot with path filters and feature stages', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      default: 'defaultRole',
    },
    paths: ['packages/my-app/**'],
    featureStages: {
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
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];
  const deployFeatureYml = snapshot['.github/workflows/deploy-feature.yml'];
  const destroyFeatureYml = snapshot['.github/workflows/destroy-feature.yml'];

  expect(deployYml).toMatchSnapshot();
  expect(deployFeatureYml).toMatchSnapshot();
  expect(destroyFeatureYml).toMatchSnapshot();

  // Verify path filters are present in all workflows
  expect(deployYml).toContain('packages/my-app/**');
  expect(deployFeatureYml).toContain('packages/my-app/**');
  expect(destroyFeatureYml).toContain('packages/my-app/**');
});

test('Github snapshot with monorepo subproject', () => {
  const root = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'root-app',
  });

  const sub = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'backend',
    parent: root,
    outdir: 'packages/backend',
  });

  new GithubCDKPipeline(sub, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
        prod: 'prodRole',
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
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(root);

  // Workflow should exist in root .github/workflows/ with prefix
  const deployYml = snapshot['.github/workflows/backend-deploy.yml'];
  expect(deployYml).toBeDefined();

  // Each job should have defaults.run.working-directory
  expect(deployYml).toContain('working-directory: packages/backend');

  // Artifact upload/download paths should be prefixed with packages/backend/
  expect(deployYml).toContain('path: packages/backend/cdk.out/');
  expect(deployYml).toContain('path: packages/backend/cdk-outputs-dev.json');
  expect(deployYml).toContain('path: packages/backend/cdk-outputs-prod.json');

  // Artifact names should use the prefix
  expect(deployYml).toContain('name: backend-cloud-assembly');
  expect(deployYml).toContain('name: backend-cdk-outputs-dev');
  expect(deployYml).toContain('name: backend-cdk-outputs-prod');

  expect(deployYml).toMatchSnapshot();
});

test('Github snapshot with monorepo subproject and preBuildCommand', () => {
  const root = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'root-app',
  });

  const sub = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'backend',
    parent: root,
    outdir: 'packages/backend',
  });

  new GithubCDKPipeline(sub, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
      },
    },
    preBuildCommand: 'pnpm -r --filter backend^... run build',
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(root);
  const deployYml = snapshot['.github/workflows/backend-deploy.yml'];
  expect(deployYml).toBeDefined();

  // The pre-build command should appear before the build step
  expect(deployYml).toContain('pnpm -r --filter backend^... run build');

  // Should still have working-directory set
  expect(deployYml).toContain('working-directory: packages/backend');

  expect(deployYml).toMatchSnapshot();
});

test('Github snapshot with monorepo subproject and manualApproval', () => {
  const root = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'root-app',
  });

  const sub = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'backend',
    parent: root,
    outdir: 'packages/backend',
  });

  new GithubCDKPipeline(sub, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        prod: 'prodRole',
      },
    },
    pkgNamespace: '@myorg',
    stages: [{
      name: 'prod',
      manualApproval: true,
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(root);
  const releaseYml = snapshot['.github/workflows/backend-release-prod.yml'];
  expect(releaseYml).toBeDefined();

  // The release workflow should have working-directory set
  expect(releaseYml).toContain('working-directory: packages/backend');

  // The mv command should work relative to working directory (no prefix needed)
  expect(releaseYml).toContain('mv ./node_modules/@myorg/backend cdk.out');

  // The cdk-outputs artifact path should be prefixed for upload
  expect(releaseYml).toContain('path: packages/backend/cdk-outputs-prod.json');
});

test('Github snapshot with monorepo subproject and feature stages', () => {
  const root = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'root-app',
  });

  const sub = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'backend',
    parent: root,
    outdir: 'packages/backend',
  });

  new GithubCDKPipeline(sub, {
    iamRoleArns: {
      default: 'defaultRole',
    },
    featureStages: {
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
    }],
  });

  const snapshot = synthSnapshot(root);

  // Feature workflows should be in root .github/workflows/ with prefix
  const featureDeployYml = snapshot['.github/workflows/backend-deploy-feature.yml'];
  const featureDestroyYml = snapshot['.github/workflows/backend-destroy-feature.yml'];
  expect(featureDeployYml).toBeDefined();
  expect(featureDestroyYml).toBeDefined();

  // Should have working-directory set
  expect(featureDeployYml).toContain('working-directory: packages/backend');
  expect(featureDestroyYml).toContain('working-directory: packages/backend');

  // Artifact paths should be prefixed
  expect(featureDeployYml).toContain('path: packages/backend/backend-cdk-outputs-feature.json');
});

test('Github snapshot with explicit workingDirectory override', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.132.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    workingDirectory: 'apps/my-app',
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        dev: 'devRole',
      },
    },
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];
  expect(deployYml).toBeDefined();

  // Should have the explicitly set working-directory
  expect(deployYml).toContain('working-directory: apps/my-app');

  // Artifact paths should be prefixed
  expect(deployYml).toContain('path: apps/my-app/cdk.out/');
  expect(deployYml).toContain('path: apps/my-app/cdk-outputs-dev.json');
});

test('Github snapshot with resource counting enabled (default)', () => {
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
      },
    },
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];
  expect(deployYml).toBeDefined();

  // Deploy workflow should contain count-resources command (for GitHub summary)
  expect(deployYml).toContain('count-resources');

  // Deploy workflow should NOT have pull_request trigger
  expect(deployYml).not.toContain('pull_request');

  // Deploy workflow should NOT have PR comment steps
  expect(deployYml).not.toContain('Post PR comment with resource counts');

  // Deploy workflow should NOT have the if condition to skip on PRs
  expect(deployYml).not.toContain("github.event_name != 'pull_request'");

  expect(deployYml).toMatchSnapshot();

  // Separate resource-count workflow should exist for PRs
  const rcYml = snapshot['.github/workflows/resource-count.yml'];
  expect(rcYml).toBeDefined();

  // Should have pull_request trigger
  expect(rcYml).toContain('pull_request');

  // Should have PR comment step
  expect(rcYml).toContain('Post PR comment with resource counts');
  expect(rcYml).toContain('actions/github-script@v7');

  // Should have pull-requests write permission for PR comments
  expect(rcYml).toContain('pull-requests: write');

  // Should have count-resources command
  expect(rcYml).toContain('count-resources');

  expect(rcYml).toMatchSnapshot();
});

test('Github snapshot with resource counting disabled', () => {
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
      },
    },
    enableResourceCounting: false,
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];
  expect(deployYml).toBeDefined();

  // Should NOT contain count-resources command
  expect(deployYml).not.toContain('count-resources');

  // Should NOT have pull_request trigger
  expect(deployYml).not.toContain('pull_request');

  // Should NOT have PR comment step
  expect(deployYml).not.toContain('Post PR comment with resource counts');

  // Should NOT have the if condition to skip PRs
  expect(deployYml).not.toContain("github.event_name != 'pull_request'");

  // Should NOT have a separate resource-count workflow
  const rcYml = snapshot['.github/workflows/resource-count.yml'];
  expect(rcYml).not.toBeDefined();

  expect(deployYml).toMatchSnapshot();
});

test('Github snapshot with custom resource count limits', () => {
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
      },
    },
    resourceCountWarningThreshold: 400,
    resourceCountLimit: 1000,
    stages: [{
      name: 'dev',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    }],
  });

  const snapshot = synthSnapshot(p);
  const deployYml = snapshot['.github/workflows/deploy.yml'];
  expect(deployYml).toBeDefined();

  // Should contain custom threshold and limit values in deploy workflow
  expect(deployYml).toContain('--warning-threshold 400');
  expect(deployYml).toContain('--resource-limit 1000');

  // Separate resource-count workflow should also have custom limits
  const rcYml = snapshot['.github/workflows/resource-count.yml'];
  expect(rcYml).toBeDefined();
  expect(rcYml).toContain('--warning-threshold 400');
  expect(rcYml).toContain('--resource-limit 1000');

  expect(deployYml).toMatchSnapshot();
  expect(rcYml).toMatchSnapshot();
});