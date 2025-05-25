import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GitHubAssignApprover } from '../src/assign-approver';

describe('GitHubAssignApprover', () => {
  test('creates workflow with correct configuration', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.102.0',
      defaultReleaseBranch: 'main',
      name: 'test-project',
    });

    new GitHubAssignApprover(app, {
      approverMapping: [
        { author: 'user1', approvers: ['user2', 'user3'] },
        { author: 'user2', approvers: ['user1', 'user3'] },
      ],
      defaultApprovers: ['admin1', 'admin2'],
    });

    const workflow = app.github!.tryFindWorkflow('assign-approver');
    expect(workflow).toBeDefined();

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/assign-approver.yml']).toMatchSnapshot();
  });

  test('generates correct approver mapping script', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.102.0',
      defaultReleaseBranch: 'main',
      name: 'test-project',
    });

    new GitHubAssignApprover(app, {
      approverMapping: [
        { author: 'user1', approvers: ['user2'] },
        { author: 'user2', approvers: ['user1'] },
        { author: 'user3', approvers: ['user1', 'user2'] },
      ],
      defaultApprovers: ['user1', 'user2'],
    });

    const snapshot = synthSnapshot(app);
    const workflow = snapshot['.github/workflows/assign-approver.yml'];

    // Check that the workflow contains the expected script structure
    expect(workflow).toContain("'user1': ['user2']");
    expect(workflow).toContain("'user2': ['user1']");
    expect(workflow).toContain("'user3': ['user1', 'user2']");
    expect(workflow).toContain("'default': ['user1', 'user2']");
  });

  test('sets correct permissions', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.102.0',
      defaultReleaseBranch: 'main',
      name: 'test-project',
    });

    const approver = new GitHubAssignApprover(app, {
      approverMapping: [],
      defaultApprovers: ['admin'],
    });

    const permissions = approver.renderPermissions();
    expect(permissions).toEqual({
      pullRequests: 'write',
    });
  });

  test('uses custom runner tags when provided', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.102.0',
      defaultReleaseBranch: 'main',
      name: 'test-project',
    });

    new GitHubAssignApprover(app, {
      approverMapping: [],
      defaultApprovers: ['admin'],
      runnerTags: ['self-hosted', 'linux'],
    });

    const snapshot = synthSnapshot(app);
    const workflow = snapshot['.github/workflows/assign-approver.yml'];

    expect(workflow).toContain('runs-on:\n      - self-hosted\n      - linux');
  });
});