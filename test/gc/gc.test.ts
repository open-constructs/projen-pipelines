import { Project } from 'projen';
import { GitHubProject } from 'projen/lib/github';
import { NodePackageManager, NodeProject } from 'projen/lib/javascript';
import { synthSnapshot } from 'projen/lib/util/synth';
import {
  GcAction,
  GcAssetType,
  GarbageCollectionStep,
  GitHubGarbageCollectionWorkflow,
  GitLabGarbageCollectionWorkflow,
  BashGarbageCollectionWorkflow,
} from '../../src/gc';
import { PnpmSetupStep, CorepackSetupStep } from '../../src/steps';

describe('GarbageCollectionStep', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      name: 'test-project',
    });
  });

  it('should generate correct GitHub job configuration', () => {
    const step = new GarbageCollectionStep(project, {
      stage: {
        name: 'dev',
        env: { account: '123456789012', region: 'eu-central-1' },
        roleArn: 'arn:aws:iam::123456789012:role/GcRole',
      },
      workflowGcOptions: {
        action: GcAction.FULL,
        type: GcAssetType.ALL,
        rollbackBufferDays: 30,
        createdBufferDays: 7,
      },
    });

    const config = step.toGithub();
    expect(config).toMatchSnapshot();
  });

  it('should generate correct GitLab configuration', () => {
    const step = new GarbageCollectionStep(project, {
      stage: {
        name: 'staging',
        env: { account: '123456789012', region: 'eu-west-1' },
        roleArn: 'arn:aws:iam::123456789012:role/GcRole',
      },
      workflowGcOptions: {
        action: GcAction.TAG,
        type: GcAssetType.S3,
      },
    });

    const config = step.toGitlab();
    expect(config).toMatchSnapshot();
  });

  it('should generate correct Bash configuration', () => {
    const step = new GarbageCollectionStep(project, {
      stage: {
        name: 'prod',
        env: { account: '987654321098', region: 'us-east-1' },
        roleArn: 'arn:aws:iam::987654321098:role/GcRole',
      },
      workflowGcOptions: {
        action: GcAction.PRINT,
        type: GcAssetType.ECR,
        rollbackBufferDays: 90,
        createdBufferDays: 14,
        bootstrapStackName: 'CustomBootstrap',
      },
    });

    const config = step.toBash();
    expect(config).toMatchSnapshot();
  });

  it('should always include --unstable=gc and --confirm=false in the projen task', () => {
    new GarbageCollectionStep(project, {
      stage: {
        name: 'dev',
        env: { account: '123456789012', region: 'eu-central-1' },
      },
    });

    const snapshot = synthSnapshot(project);
    const tasks = snapshot['.projen/tasks.json'];
    const exec = tasks.tasks['gc:dev'].steps[0].exec;
    expect(exec).toContain('--unstable=gc');
    expect(exec).toContain('--confirm=false');
  });

  it('should use aws://<account>/<region> as environment argument in the projen task', () => {
    new GarbageCollectionStep(project, {
      stage: {
        name: 'dev',
        env: { account: '111222333444', region: 'ap-southeast-1' },
      },
    });

    const snapshot = synthSnapshot(project);
    const tasks = snapshot['.projen/tasks.json'];
    const exec = tasks.tasks['gc:dev'].steps[0].exec;
    expect(exec).toContain('aws://111222333444/ap-southeast-1');
  });

  it('should shallow-merge stage gcOptions over workflow-level gcOptions', () => {
    new GarbageCollectionStep(project, {
      stage: {
        name: 'prod',
        env: { account: '123456789012', region: 'eu-central-1' },
        gcOptions: { action: GcAction.PRINT },
      },
      workflowGcOptions: {
        action: GcAction.FULL,
        type: GcAssetType.ALL,
        rollbackBufferDays: 30,
        createdBufferDays: 7,
      },
    });

    const snapshot = synthSnapshot(project);
    const tasks = snapshot['.projen/tasks.json'];
    const exec = tasks.tasks['gc:prod'].steps[0].exec;
    // Stage override wins
    expect(exec).toContain('--action=print');
    // Workflow defaults remain
    expect(exec).toContain('--type=all');
    expect(exec).toContain('--rollback-buffer-days=30');
    expect(exec).toContain('--created-buffer-days=7');
  });

  it('should register a projen task for the stage', () => {
    new GarbageCollectionStep(project, {
      stage: {
        name: 'dev',
        env: { account: '123456789012', region: 'eu-central-1' },
      },
      workflowGcOptions: {
        action: GcAction.FULL,
        type: GcAssetType.ALL,
      },
    });

    const snapshot = synthSnapshot(project);
    const tasks = snapshot['.projen/tasks.json'];
    expect(tasks.tasks['gc:dev']).toBeDefined();
    expect(tasks.tasks['gc:dev'].steps[0].exec).toContain('npx cdk gc');
    expect(tasks.tasks['gc:dev'].steps[0].exec).toContain('--unstable=gc');
    expect(tasks.tasks['gc:dev'].steps[0].exec).toContain('--confirm=false');
  });

  it('should include --bootstrap-stack-name when specified', () => {
    new GarbageCollectionStep(project, {
      stage: {
        name: 'dev',
        env: { account: '123456789012', region: 'eu-central-1' },
      },
      workflowGcOptions: {
        bootstrapStackName: 'CDKToolkit',
      },
    });

    const snapshot = synthSnapshot(project);
    const tasks = snapshot['.projen/tasks.json'];
    const exec = tasks.tasks['gc:dev'].steps[0].exec;
    expect(exec).toContain('--bootstrap-stack-name=CDKToolkit');
  });

  it('should support jump role', () => {
    const step = new GarbageCollectionStep(project, {
      stage: {
        name: 'dev',
        env: { account: '123456789012', region: 'eu-central-1' },
        roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        jumpRoleArn: 'arn:aws:iam::000000000000:role/JumpRole',
      },
    });

    const githubConfig = step.toGithub();
    expect(githubConfig).toMatchSnapshot();
  });
});

describe('GitHubGarbageCollectionWorkflow', () => {
  let project: Project;

  beforeEach(() => {
    project = new GitHubProject({
      name: 'test-project',
      github: true,
    });
  });

  it('should create GitHub workflow with basic configuration', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
        {
          name: 'prod',
          env: { account: '987654321098', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::987654321098:role/GcRole',
          gcOptions: { action: GcAction.PRINT },
        },
      ],
      gcOptions: {
        action: GcAction.FULL,
        type: GcAssetType.ALL,
        rollbackBufferDays: 30,
        createdBufferDays: 7,
      },
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/cdk-gc.yml']).toMatchSnapshot();
  });

  it('should support custom schedule', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      schedule: '0 0 * * *',
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('0 0 * * *');
    expect(workflow).toMatchSnapshot();
  });

  it('should deduplicate stages sharing the same account/region', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
        {
          name: 'staging',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
        {
          name: 'prod',
          env: { account: '987654321098', region: 'us-east-1' },
          roleArn: 'arn:aws:iam::987654321098:role/GcRole',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    // Only dev and prod jobs should exist (staging deduplicated)
    expect(workflow).toContain('gc-dev');
    expect(workflow).toContain('gc-prod');
    expect(workflow).not.toContain('gc-staging');
    expect(workflow).toMatchSnapshot();
  });

  it('should include concurrency group', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('concurrency');
    expect(workflow).toContain('cdk-gc-dev');
    expect(workflow).toMatchSnapshot();
  });

  it('should include workflow_dispatch trigger', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toMatchSnapshot();
  });

  it('should support timeoutMinutes per job', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          timeoutMinutes: 60,
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('timeout-minutes: 60');
    expect(workflow).toMatchSnapshot();
  });

  it('should prefix workflow name with pipelineName', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      pipelineName: 'backend',
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/backend-cdk-gc.yml']).toBeDefined();
    expect(snapshot['.github/workflows/cdk-gc.yml']).toBeUndefined();
    expect(snapshot['.github/workflows/backend-cdk-gc.yml']).toMatchSnapshot();
  });

  it('should include OIDC role assumption', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('id-token: write');
    expect(workflow).toContain('aws-actions/configure-aws-credentials');
    expect(workflow).toContain('arn:aws:iam::123456789012:role/GcRole');
    expect(workflow).toMatchSnapshot();
  });

  it('should include pnpm setup step when preInstallSteps contains PnpmSetupStep', () => {
    new GitHubGarbageCollectionWorkflow(project, {
      preInstallSteps: [new PnpmSetupStep(project, { version: '9' })],
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('pnpm/action-setup@v4');
    expect(workflow).toMatchSnapshot();
  });

  it('should auto-detect pnpm for NodeProject with pnpm', () => {
    const pnpmProject = new NodeProject({
      name: 'pnpm-project',
      defaultReleaseBranch: 'main',
      packageManager: NodePackageManager.PNPM,
      pnpmVersion: '9',
    });

    new GitHubGarbageCollectionWorkflow(pnpmProject, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(pnpmProject);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('pnpm/action-setup@v4');
    expect(workflow).toMatchSnapshot();
  });

  it('should auto-detect yarn berry and include corepack setup', () => {
    const yarnProject = new NodeProject({
      name: 'yarn-berry-project',
      defaultReleaseBranch: 'main',
      packageManager: NodePackageManager.YARN_BERRY,
    });

    new GitHubGarbageCollectionWorkflow(yarnProject, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(yarnProject);
    const workflow = snapshot['.github/workflows/cdk-gc.yml'];
    expect(workflow).toContain('corepack enable');
    expect(workflow).toMatchSnapshot();
  });
});

describe('GitLabGarbageCollectionWorkflow', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      name: 'test-project',
    });
  });

  it('should create GitLab pipeline', () => {
    new GitLabGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
      ],
      gcOptions: {
        action: GcAction.FULL,
        type: GcAssetType.ALL,
      },
    });

    const snapshot = synthSnapshot(project);
    const gitlabCiKey = Object.keys(snapshot).find(k => k.includes('gitlab'));
    expect(gitlabCiKey).toBeDefined();
    expect(snapshot[gitlabCiKey!]).toMatchSnapshot();
  });

  it('should include OIDC token configuration', () => {
    new GitLabGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const gitlabCiKey = Object.keys(snapshot).find(k => k.includes('gitlab'));
    expect(gitlabCiKey).toBeDefined();
    const gitlabCi = snapshot[gitlabCiKey!];
    expect(gitlabCi).toContain('AWS_TOKEN');
    expect(gitlabCi).toContain('sts.amazonaws.com');
    expect(gitlabCi).toMatchSnapshot();
  });

  it('should add runner tags when specified', () => {
    new GitLabGarbageCollectionWorkflow(project, {
      runnerTags: ['docker', 'aws'],
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const gitlabCiKey = Object.keys(snapshot).find(k => k.includes('gitlab'));
    expect(gitlabCiKey).toBeDefined();
    const gitlabCi = snapshot[gitlabCiKey!];
    expect(gitlabCi).toContain('docker');
    expect(gitlabCi).toContain('aws');
    expect(gitlabCi).toMatchSnapshot();
  });

  it('should support custom docker image', () => {
    new GitLabGarbageCollectionWorkflow(project, {
      image: 'custom/node:20-aws',
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const gitlabCiKey = Object.keys(snapshot).find(k => k.includes('gitlab'));
    expect(gitlabCiKey).toBeDefined();
    const gitlabCi = snapshot[gitlabCiKey!];
    expect(gitlabCi).toContain('custom/node:20-aws');
    expect(gitlabCi).toMatchSnapshot();
  });

  it('should prefix job names with pipelineName', () => {
    new GitLabGarbageCollectionWorkflow(project, {
      pipelineName: 'backend',
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const gitlabCiKey = Object.keys(snapshot).find(k => k.includes('gitlab'));
    expect(gitlabCiKey).toBeDefined();
    const gitlabCi = snapshot[gitlabCiKey!];
    expect(gitlabCi).toContain('.backend-cdk-gc');
    expect(gitlabCi).toContain('backend-gc:dev');
    expect(gitlabCi).toMatchSnapshot();
  });

  it('should include corepack setup in beforeScript when preInstallSteps contains CorepackSetupStep', () => {
    new GitLabGarbageCollectionWorkflow(project, {
      preInstallSteps: [new CorepackSetupStep(project)],
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const gitlabCiKey = Object.keys(snapshot).find(k => k.includes('gitlab'));
    expect(gitlabCiKey).toBeDefined();
    const gitlabCi = snapshot[gitlabCiKey!];
    expect(gitlabCi).toContain('corepack enable');
    expect(gitlabCi).toMatchSnapshot();
  });
});

describe('BashGarbageCollectionWorkflow', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      name: 'test-project',
    });
  });

  it('should create bash script', () => {
    new BashGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
          roleArn: 'arn:aws:iam::123456789012:role/GcRole',
        },
        {
          name: 'prod',
          env: { account: '987654321098', region: 'us-east-1' },
        },
      ],
      gcOptions: {
        action: GcAction.FULL,
        type: GcAssetType.ALL,
        rollbackBufferDays: 30,
      },
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['cdk-gc.sh']).toMatchSnapshot();
  });

  it('should support custom script path', () => {
    new BashGarbageCollectionWorkflow(project, {
      scriptPath: 'scripts/gc.sh',
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['scripts/gc.sh']).toMatchSnapshot();
  });

  it('should support --stage argument', () => {
    new BashGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
        {
          name: 'prod',
          env: { account: '987654321098', region: 'us-east-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const script = snapshot['cdk-gc.sh'];
    expect(script).toContain('--stage');
    expect(script).toContain('run_stage_dev');
    expect(script).toContain('run_stage_prod');
    expect(script).toMatchSnapshot();
  });

  it('should include corepack setup when preInstallSteps contains CorepackSetupStep', () => {
    new BashGarbageCollectionWorkflow(project, {
      preInstallSteps: [new CorepackSetupStep(project)],
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const script = snapshot['cdk-gc.sh'];
    expect(script).toContain('corepack enable');
    expect(script).toMatchSnapshot();
  });

  it('should auto-detect pnpm and include pnpm install for NodeProject', () => {
    const pnpmProject = new NodeProject({
      name: 'pnpm-project',
      defaultReleaseBranch: 'main',
      packageManager: NodePackageManager.PNPM,
      pnpmVersion: '9',
    });

    new BashGarbageCollectionWorkflow(pnpmProject, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(pnpmProject);
    const script = snapshot['cdk-gc.sh'];
    expect(script).toContain('npm install -g pnpm@9');
    expect(script).toMatchSnapshot();
  });

  it('should run all stages when no --stage argument provided', () => {
    new BashGarbageCollectionWorkflow(project, {
      stages: [
        {
          name: 'dev',
          env: { account: '123456789012', region: 'eu-central-1' },
        },
        {
          name: 'prod',
          env: { account: '987654321098', region: 'us-east-1' },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    const script = snapshot['cdk-gc.sh'];
    // Should have code to run all stages
    expect(script).toContain('# Run all stages');
    expect(script).toContain('run_stage_dev || FAILED_STAGES+=("dev")');
    expect(script).toContain('run_stage_prod || FAILED_STAGES+=("prod")');
  });
});
