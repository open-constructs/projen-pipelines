import { Project } from 'projen';
import { GitHubProject } from 'projen/lib/github';
import { synthSnapshot } from 'projen/lib/util/synth';
import {
  DriftDetectionStep,
  GitHubDriftDetectionWorkflow,
  GitLabDriftDetectionWorkflow,
  BashDriftDetectionWorkflow,
} from '../../src/drift';

describe('DriftDetectionStep', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      name: 'test-project',
    });
  });

  it('should generate correct GitHub job configuration', () => {
    const step = new DriftDetectionStep(project, {
      name: 'drift-check',
      region: 'us-east-1',
      roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
      stackNames: ['Stack1', 'Stack2'],
      failOnDrift: true,
    });

    const config = step.toGithub();

    expect(config).toMatchSnapshot();
  });

  it('should generate correct GitLab configuration', () => {
    const step = new DriftDetectionStep(project, {
      name: 'drift-check',
      region: 'eu-west-1',
      roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
      stackNames: ['MyStack'],
      failOnDrift: false,
    });

    const config = step.toGitlab();

    expect(config.env).toEqual({
      AWS_DEFAULT_REGION: 'eu-west-1',
      AWS_REGION: 'eu-west-1',
      STAGE_NAME: 'drift-check',
      DRIFT_DETECTION_OUTPUT: 'drift-results-drift-check.json',
    });
    expect(config).toMatchSnapshot();
  });

  it('should check all stacks when stackNames not provided', () => {
    const step = new DriftDetectionStep(project, {
      name: 'drift-check',
      region: 'us-east-1',
    });

    const bashConfig = step.toBash();
    const command = bashConfig.commands.find(cmd => cmd.includes('detect-drift'));
    expect(command).not.toContain('--stacks');
  });

  it('should respect timeout configuration', () => {
    const step = new DriftDetectionStep(project, {
      name: 'drift-check',
      region: 'us-east-1',
      timeout: 60,
    });

    const bashConfig = step.toBash();
    const command = bashConfig.commands.find(cmd => cmd.includes('detect-drift'));
    expect(command).toContain('--timeout 60');
  });
});

describe('GitHubDriftDetectionWorkflow', () => {
  let project: Project;

  beforeEach(() => {
    project = new GitHubProject({
      name: 'test-project',
      github: true,
    });
  });

  it('should create GitHub workflow', () => {
    new GitHubDriftDetectionWorkflow(project, {
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
          roleArn: 'arn:aws:iam::123456789012:role/ProdRole',
        },
        {
          name: 'staging',
          region: 'eu-west-1',
          roleArn: 'arn:aws:iam::123456789012:role/StagingRole',
          failOnDrift: false,
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/drift-detection.yml']).toMatchSnapshot();
  });

  it('should support custom schedule', () => {
    new GitHubDriftDetectionWorkflow(project, {
      schedule: '0 */6 * * *', // Every 6 hours
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/drift-detection.yml']).toMatchSnapshot();
  });

  it('should include environment variables in stages', () => {
    new GitHubDriftDetectionWorkflow(project, {
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
          environment: {
            CUSTOM_VAR: 'value',
            ANOTHER_VAR: 'another-value',
          },
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/drift-detection.yml']).toMatchSnapshot();
  });

  it('should support disabling issue creation', () => {
    new GitHubDriftDetectionWorkflow(project, {
      createIssues: false,
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.github/workflows/drift-detection.yml']).toMatchSnapshot();
  });
});

describe('GitLabDriftDetectionWorkflow', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      name: 'test-project',
    });
  });

  it('should create GitLab pipeline', () => {
    new GitLabDriftDetectionWorkflow(project, {
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
          roleArn: 'arn:aws:iam::123456789012:role/ProdRole',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.gitlab/drift-detection.yml']).toMatchSnapshot();
  });

  it('should add GitLab runner tags when specified', () => {
    new GitLabDriftDetectionWorkflow(project, {
      runnerTags: ['docker', 'aws'],
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.gitlab/drift-detection.yml']).toMatchSnapshot();
  });

  it('should support custom docker image', () => {
    new GitLabDriftDetectionWorkflow(project, {
      image: 'custom/node:18-aws',
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['.gitlab/drift-detection.yml']).toMatchSnapshot();
  });
});

describe('BashDriftDetectionWorkflow', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      name: 'test-project',
    });
  });

  it('should create bash script', () => {
    new BashDriftDetectionWorkflow(project, {
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
          roleArn: 'arn:aws:iam::123456789012:role/ProdRole',
        },
        {
          name: 'staging',
          region: 'eu-west-1',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['drift-detection.sh']).toMatchSnapshot();
  });

  it('should support custom script path', () => {
    new BashDriftDetectionWorkflow(project, {
      scriptPath: 'scripts/check-drift.sh',
      stages: [
        {
          name: 'production',
          region: 'us-east-1',
        },
      ],
    });

    const snapshot = synthSnapshot(project);
    expect(snapshot['scripts/check-drift.sh']).toMatchSnapshot();
  });
});