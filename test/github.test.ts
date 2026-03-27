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
