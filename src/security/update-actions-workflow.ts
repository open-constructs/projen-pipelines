import { Component } from 'projen';
import { GitHubProject } from 'projen/lib/github';
import { Job, JobPermission } from 'projen/lib/github/workflows-model';

/**
 * Options for the {@link UpdateActionsWorkflow} maintenance workflow.
 */
export interface UpdateActionsWorkflowOptions {
  /**
   * File or directory paths to scan for `uses: 'owner/repo@ref'` literals.
   *
   * Directories are walked recursively for `.ts`, `.js`, `.cjs`, `.mjs`,
   * `.json`, `.yml`, and `.yaml` files; individual files are scanned directly.
   * Non-existent paths are silently skipped so the default can cover both
   * TypeScript and JavaScript projen configurations.
   *
   * The default targets projen-managed files only, which is the right scope
   * for downstream consumers: their action references live in the projen
   * configuration rather than in application source. Projects that embed
   * action strings in hand-authored source (such as `projen-pipelines`
   * itself) should extend this list with `'src'`.
   *
   * @default ['.projen', '.projenrc.ts', '.projenrc.js']
   */
  readonly paths?: string[];

  /**
   * Cron expression for the scheduled run.
   *
   * @default '0 6 * * 1' (weekly on Monday at 06:00 UTC)
   */
  readonly schedule?: string;

  /**
   * Runner tags for both jobs in the workflow.
   *
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

  /**
   * Labels applied to the pull request created by the workflow.
   *
   * @default ['auto-approve', 'dependencies', 'github-actions']
   */
  readonly labels?: string[];

  /**
   * Branch name used for the pull request.
   *
   * @default 'github-actions/update-actions'
   */
  readonly branch?: string;

  /**
   * Include pre-releases when resolving the latest stable tag.
   *
   * @default false
   */
  readonly allowPrerelease?: boolean;

  /**
   * Shell command that invokes the pinning script.
   *
   * For projects that install `projen-pipelines` as a dependency, the default
   * `npx update-github-actions` resolves the bin exposed by the package. When
   * this library maintains itself, the source location is used instead.
   *
   * @default 'npx update-github-actions'
   */
  readonly command?: string;

  /**
   * Name of the GitHub secret holding the GitHub App ID used to create the PR.
   *
   * The app token is preferred over the default `GITHUB_TOKEN` so that CI runs
   * on the created PR. Set to an empty string to skip the app-token step and
   * fall back to the workflow's default token.
   *
   * @default 'PROJEN_APP_ID'
   */
  readonly tokenAppIdSecret?: string;

  /**
   * Name of the GitHub secret holding the GitHub App private key.
   *
   * @default 'PROJEN_APP_PRIVATE_KEY'
   */
  readonly tokenAppPrivateKeySecret?: string;
}

/**
 * Adds an `update-actions` workflow that pins GitHub Action references to the
 * latest stable release commit SHAs and opens a PR with the result.
 *
 * The workflow scans source files (TypeScript, JSON, YAML) for
 * `uses: 'owner/repo@ref'` literals, resolves each action's latest release to
 * a full commit SHA via the GitHub API, rewrites the literals in place, runs
 * `npx projen build` to regenerate outputs, and opens a single PR with the
 * results and a per-action summary.
 *
 * ```ts
 * import { UpdateActionsWorkflow } from 'projen-pipelines';
 *
 * new UpdateActionsWorkflow(project);
 * ```
 */
export class UpdateActionsWorkflow extends Component {
  constructor(scope: GitHubProject, options: UpdateActionsWorkflowOptions = {}) {
    super(scope);

    if (!scope.github) {
      throw new Error('UpdateActionsWorkflow requires a GitHubProject with github integration enabled.');
    }

    const paths = options.paths ?? ['.projen', '.projenrc.ts', '.projenrc.js'];
    const schedule = options.schedule ?? '0 6 * * 1';
    const runsOn = options.runnerTags ?? ['ubuntu-latest'];
    const labels = options.labels ?? ['auto-approve', 'dependencies', 'github-actions'];
    const branch = options.branch ?? 'github-actions/update-actions';
    const command = options.command ?? 'npx update-github-actions';
    const appIdSecret = options.tokenAppIdSecret ?? 'PROJEN_APP_ID';
    const appKeySecret = options.tokenAppPrivateKeySecret ?? 'PROJEN_APP_PRIVATE_KEY';
    const useAppToken = appIdSecret !== '' && appKeySecret !== '';

    const workflow = scope.github.addWorkflow('update-actions');
    workflow.on({
      workflowDispatch: {},
      schedule: [{ cron: schedule }],
    });

    const env: Record<string, string> = { GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}' };
    if (options.allowPrerelease) env.ALLOW_PRERELEASE = 'true';

    const upgrade: Job = {
      name: 'Upgrade GitHub Actions',
      runsOn: runsOn,
      permissions: { contents: JobPermission.READ },
      outputs: {
        patch_created: { stepId: 'create_patch', outputName: 'patch_created' },
      },
      steps: [
        { name: 'Checkout', uses: 'actions/checkout@v6' },
        {
          name: 'Setup Node',
          uses: 'actions/setup-node@v6',
          with: { 'node-version': '22' },
        },
        { name: 'Install dependencies', run: 'npm ci' },
        {
          name: 'Pin actions to latest release SHAs',
          env,
          run: `${command} ${paths.join(' ')}`,
        },
        { name: 'Regenerate project', run: 'npx projen build' },
        {
          name: 'Find mutations',
          id: 'create_patch',
          shell: 'bash',
          run: [
            'git add .',
            'git diff --staged --patch --exit-code > repo.patch || echo "patch_created=true" >> $GITHUB_OUTPUT',
          ].join('\n'),
        },
        {
          name: 'Upload patch',
          if: 'steps.create_patch.outputs.patch_created',
          uses: 'actions/upload-artifact@v7',
          with: { name: 'repo.patch', path: 'repo.patch', overwrite: true },
        },
      ],
    };

    const prSteps = [];
    if (useAppToken) {
      prSteps.push({
        name: 'Generate token',
        id: 'generate_token',
        uses: 'actions/create-github-app-token@v2',
        with: {
          'app-id': `\${{ secrets.${appIdSecret} }}`,
          'private-key': `\${{ secrets.${appKeySecret} }}`,
        },
      });
    }
    prSteps.push(
      { name: 'Checkout', uses: 'actions/checkout@v6' },
      {
        name: 'Download patch',
        uses: 'actions/download-artifact@v8',
        with: { name: 'repo.patch', path: '${{ runner.temp }}' },
      },
      {
        name: 'Apply patch',
        run: '[ -s ${{ runner.temp }}/repo.patch ] && git apply ${{ runner.temp }}/repo.patch || echo "Empty patch. Skipping."',
      },
      {
        name: 'Set git identity',
        run: [
          'git config user.name "github-actions[bot]"',
          'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
        ].join('\n'),
      },
      {
        name: 'Create Pull Request',
        uses: 'peter-evans/create-pull-request@v8',
        with: {
          'token': useAppToken
            ? '${{ steps.generate_token.outputs.token }}'
            : '${{ secrets.GITHUB_TOKEN }}',
          'commit-message': 'chore(deps): pin github actions to latest release SHAs',
          'branch': branch,
          'title': 'chore(deps): update pinned GitHub Actions',
          'labels': labels.join(','),
          'body': [
            'Pins action references to the latest stable release commit SHAs.',
            '',
            'See the job summary of the [workflow run] for a per-action diff.',
            '',
            '[Workflow Run]: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}',
            '',
            '------',
            '',
            '*Automatically created by the `update-actions` workflow.*',
          ].join('\n'),
          'author': 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
          'committer': 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
          'signoff': true,
        },
      },
    );

    const pr: Job = {
      name: 'Create Pull Request',
      needs: ['upgrade'],
      runsOn: runsOn,
      permissions: { contents: JobPermission.READ },
      if: '${{ needs.upgrade.outputs.patch_created }}',
      steps: prSteps,
    };

    workflow.addJobs({ upgrade, pr });
  }
}
