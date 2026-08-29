import { GitHubProject } from 'projen/lib/github';
import { synthSnapshot } from 'projen/lib/util/synth';
import {
  resolveRemediation,
  DEFAULT_EXCLUDE_RESOURCE_TYPES,
  GitHubDriftDetectionWorkflow,
  GitLabDriftDetectionWorkflow,
  BashDriftDetectionWorkflow,
} from '../../src/drift';
import { classifyDrift } from '../../src/drift/revert-drift';

describe('resolveRemediation', () => {
  it('uses the workflow default when the stage does not override', () => {
    expect(resolveRemediation({ name: 'dev', region: 'us-east-1' }, 'auto')).toBe('auto');
  });

  it('prefers the stage-level override', () => {
    expect(
      resolveRemediation({ name: 'prod', region: 'us-east-1', remediation: 'manual' }, 'auto'),
    ).toBe('manual');
  });
});

describe('classifyDrift', () => {
  const r = (logicalResourceId: string, resourceType: string, status = 'MODIFIED') => ({
    logicalResourceId,
    resourceType,
    stackResourceDriftStatus: status,
  });

  it('marks non-sensitive modified resources as revertable', () => {
    const out = classifyDrift([r('Fn', 'AWS::Lambda::Function')]);
    expect(out.revertable).toHaveLength(1);
    expect(out.excluded).toHaveLength(0);
    expect(out.deletions).toHaveLength(0);
  });

  it('excludes sensitive resource types by default (RDS glob, DynamoDB table)', () => {
    const out = classifyDrift([
      r('Db', 'AWS::RDS::DBInstance'),
      r('Table', 'AWS::DynamoDB::Table'),
      r('Fn', 'AWS::Lambda::Function'),
    ]);
    expect(out.excluded.map(e => e.resourceType).sort()).toEqual([
      'AWS::DynamoDB::Table',
      'AWS::RDS::DBInstance',
    ]);
    expect(out.revertable).toHaveLength(1);
  });

  it('treats deleted resources as non-revertable', () => {
    const out = classifyDrift([r('Fn', 'AWS::Lambda::Function', 'DELETED')]);
    expect(out.deletions).toHaveLength(1);
    expect(out.revertable).toHaveLength(0);
  });

  it('honours an explicit include allow-list', () => {
    const out = classifyDrift(
      [r('Fn', 'AWS::Lambda::Function'), r('Bucket', 'AWS::S3::Bucket')],
      { includeResourceTypes: ['AWS::Lambda::*'], excludeResourceTypes: [] },
    );
    expect(out.revertable.map(x => x.resourceType)).toEqual(['AWS::Lambda::Function']);
  });

  it('exposes the default exclusion list', () => {
    expect(DEFAULT_EXCLUDE_RESOURCE_TYPES).toEqual(['AWS::RDS::*', 'AWS::DynamoDB::Table']);
  });
});

describe('remediation workflows', () => {
  function ghProject() {
    return new GitHubProject({ name: 'test-project' });
  }

  it('GitHub: adds gated remediate + verify jobs for a manual stage', () => {
    const project = ghProject();
    new GitHubDriftDetectionWorkflow(project, {
      defaultRemediation: 'manual',
      stages: [{ name: 'prod', region: 'us-east-1' }],
    });
    const snap = synthSnapshot(project);
    const wf = snap['.github/workflows/drift-detection.yml'];
    expect(wf).toContain('remediate-prod');
    expect(wf).toContain('verify-prod');
    expect(wf).toContain('drift-remediation-prod');
    expect(wf).toMatchSnapshot();
  });

  it('GitHub: auto stage has no environment gate', () => {
    const project = ghProject();
    new GitHubDriftDetectionWorkflow(project, {
      defaultRemediation: 'auto',
      stages: [{ name: 'dev', region: 'us-east-1' }],
    });
    const wf = synthSnapshot(project)['.github/workflows/drift-detection.yml'];
    expect(wf).toContain('remediate-dev');
    expect(wf).not.toContain('drift-remediation-dev');
  });

  it('GitLab: adds remediation and verify stages when enabled', () => {
    const project = ghProject();
    new GitLabDriftDetectionWorkflow(project, {
      defaultRemediation: 'auto',
      stages: [{ name: 'dev', region: 'us-east-1' }],
    });
    const snap = synthSnapshot(project);
    const ci = snap['.gitlab-ci.yml'];
    expect(ci).toContain('remediation');
    expect(ci).toContain('verify');
    expect(ci).toMatchSnapshot();
  });

  it('Bash: emits run_remediation and run_verify functions with --yes support', () => {
    const project = ghProject();
    new BashDriftDetectionWorkflow(project, {
      defaultRemediation: 'manual',
      stages: [{ name: 'prod', region: 'us-east-1' }],
    });
    const script = synthSnapshot(project)['drift-detection.sh'];
    expect(script).toContain('run_remediation_prod()');
    expect(script).toContain('run_verify_prod()');
    expect(script).toContain('AUTO_YES');
    expect(script).toMatchSnapshot();
  });
});
