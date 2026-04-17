import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { UpdateActionsWorkflow } from '../src/security';

function newApp() {
  return new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'test-project',
  });
}

describe('UpdateActionsWorkflow', () => {
  test('registers an update-actions workflow on the project', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app);

    const workflow = app.github!.tryFindWorkflow('update-actions');
    expect(workflow).toBeDefined();
  });

  test('matches snapshot with defaults', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app);

    const snapshot = synthSnapshot(app);
    expect(snapshot['.github/workflows/update-actions.yml']).toMatchSnapshot();
  });

  test('default paths target projen-managed files only', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app);

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('npx update-github-actions .projen .projenrc.ts');
    expect(yaml).not.toMatch(/npx update-github-actions .*\bsrc\b/);
  });

  test('custom paths are forwarded to the script invocation', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, {
      paths: ['src', '.projen', '.projenrc.ts', 'custom/workflows'],
    });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('npx update-github-actions src .projen .projenrc.ts custom/workflows');
  });

  test('custom command replaces the default bin invocation', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, {
      command: 'npx tsx src/security/update-github-actions.ts',
    });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('npx tsx src/security/update-github-actions.ts .projen .projenrc.ts');
    expect(yaml).not.toContain('npx update-github-actions');
  });

  test('custom schedule sets the cron expression', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, { schedule: '30 3 * * *' });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('cron: 30 3 * * *');
  });

  test('custom runner tags are applied to both jobs', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, { runnerTags: ['self-hosted', 'linux'] });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    const runnerBlocks = yaml.match(/runs-on:\n(?:\s+- [^\n]+\n)+/g) ?? [];
    expect(runnerBlocks).toHaveLength(2);
    runnerBlocks.forEach((block: string) => {
      expect(block).toContain('- self-hosted');
      expect(block).toContain('- linux');
    });
  });

  test('custom labels and branch flow into the PR step', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, {
      labels: ['automated', 'deps'],
      branch: 'chore/pin-actions',
    });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('labels: automated,deps');
    expect(yaml).toContain('branch: chore/pin-actions');
  });

  test('allowPrerelease propagates to the step env', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, { allowPrerelease: true });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('ALLOW_PRERELEASE: "true"');
  });

  test('omits ALLOW_PRERELEASE by default', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app);

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).not.toContain('ALLOW_PRERELEASE');
  });

  test('uses the GitHub App token by default', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app);

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('actions/create-github-app-token');
    expect(yaml).toContain('app-id: ${{ secrets.PROJEN_APP_ID }}');
    expect(yaml).toContain('private-key: ${{ secrets.PROJEN_APP_PRIVATE_KEY }}');
    expect(yaml).toContain('token: ${{ steps.generate_token.outputs.token }}');
  });

  test('overriding secret names propagates to the token step', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, {
      tokenAppIdSecret: 'MY_APP_ID',
      tokenAppPrivateKeySecret: 'MY_APP_KEY',
    });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('app-id: ${{ secrets.MY_APP_ID }}');
    expect(yaml).toContain('private-key: ${{ secrets.MY_APP_KEY }}');
  });

  test('falls back to GITHUB_TOKEN when app-token secrets are empty', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app, {
      tokenAppIdSecret: '',
      tokenAppPrivateKeySecret: '',
    });

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).not.toContain('actions/create-github-app-token');
    expect(yaml).not.toContain('generate_token');
    expect(yaml).toContain('token: ${{ secrets.GITHUB_TOKEN }}');
  });

  test('upgrade job exposes patch_created output', () => {
    const app = newApp();
    new UpdateActionsWorkflow(app);

    const yaml = synthSnapshot(app)['.github/workflows/update-actions.yml'];
    expect(yaml).toContain('patch_created: ${{ steps.create_patch.outputs.patch_created }}');
    expect(yaml).toContain('if: ${{ needs.upgrade.outputs.patch_created }}');
  });

  test('throws when the project has no GitHub integration', () => {
    const app = new AwsCdkTypeScriptApp({
      cdkVersion: '2.102.0',
      defaultReleaseBranch: 'main',
      name: 'test-project',
      github: false,
    });

    expect(() => new UpdateActionsWorkflow(app)).toThrow(/GitHubProject/);
  });
});
