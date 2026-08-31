import { Component, awscdk } from 'projen';
import { GitHub, GithubWorkflow } from 'projen/lib/github';
import { JobPermission, JobPermissions } from 'projen/lib/github/workflows-model';
import { NodePackageManager } from 'projen/lib/javascript';
import { mergeJobPermissions } from '../engines';
import { AwsAssumeRoleStep, PipelineStep, SimpleCommandStep, StepSequence, PnpmSetupStep, CorepackSetupStep } from '../steps';
import { ResourceCountStep } from './resource-count-step';

/**
 * Options for GithubResourceCountPRWorkflow.
 */
export interface GithubResourceCountPRWorkflowOptions {

  /**
   * The branch that pull requests target. The workflow will trigger on PRs
   * targeting this branch.
   *
   * @default 'main'
   */
  readonly branchName?: string;

  /**
   * Runner tags to use to select GitHub Actions runners.
   *
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

  /**
   * The Node.js version to use in the workflow.
   *
   * @default '20'
   */
  readonly nodeVersion?: string;

  /**
   * The warning threshold for resource count. When a stack's resource count
   * reaches this number, a warning is emitted.
   *
   * @default 450
   */
  readonly resourceCountWarningThreshold?: number;

  /**
   * The hard limit for resource count per stack. This should match the
   * CloudFormation resource limit for the account (default 500, can be increased).
   *
   * @default 500
   */
  readonly resourceCountLimit?: number;

  /**
   * File path patterns that should trigger the workflow when changed.
   * This is useful for monorepos where you only want to run the workflow
   * when files in a specific subproject are modified.
   *
   * @default - all paths trigger the workflow
   */
  readonly paths?: string[];

  /**
   * The working directory for the workflow relative to the repository root.
   * When set, CI jobs will run commands in this directory and artifact paths
   * will be prefixed accordingly.
   *
   * @default - repository root
   */
  readonly workingDirectory?: string;

  /**
   * The CDK output directory (cloud assembly directory).
   *
   * @default - uses the app's cdkConfig.cdkout
   */
  readonly cdkoutDir?: string;

  /**
   * A unique name prefix for the workflow file and job names
   * to prevent collisions in monorepos.
   *
   * @default - no prefix
   */
  readonly pipelineName?: string;

  /**
   * Commands to run before installing dependencies.
   */
  readonly preInstallCommands?: string[];

  /**
   * Steps to run before installing dependencies.
   */
  readonly preInstallSteps?: PipelineStep[];

  /**
   * Commands to run before the synth step.
   */
  readonly preSynthCommands?: string[];

  /**
   * Steps to run before the synth step.
   */
  readonly preSynthSteps?: PipelineStep[];

  /**
   * Commands to run after the synth step.
   */
  readonly postSynthCommands?: string[];

  /**
   * Steps to run after the synth step.
   */
  readonly postSynthSteps?: PipelineStep[];

  /**
   * A command to run before the build step, executed from the repository root.
   * When a workingDirectory is set (monorepo subproject), the command is
   * automatically wrapped to execute from the repository root.
   *
   * @default - no pre-build command
   */
  readonly preBuildCommand?: string;

  /**
   * IAM role ARN to assume before synth. If set, the workflow will assume this
   * role before running the build/synth step.
   *
   * @default - no role assumption
   */
  readonly synthRoleArn?: string;

  /**
   * Jump role ARN to assume before the synth role.
   *
   * @default - no jump role
   */
  readonly synthJumpRoleArn?: string;
}

const DEFAULT_RUNNER_TAGS = ['ubuntu-latest'];
const WORKFLOW_DIR = '.github/workflows';

/**
 * A standalone Component that creates a GitHub Actions workflow to count CloudFormation
 * resources on pull requests. It synthesizes the CDK app, counts resources, compares
 * against a baseline from the target branch, and posts a PR comment with the results.
 *
 * This can be used independently or is automatically created by GithubCDKPipeline when
 * `enableResourceCounting` is not set to false.
 */
export class GithubResourceCountPRWorkflow extends Component {

  private readonly gh: GitHub;
  private readonly app: awscdk.AwsCdkTypeScriptApp;
  private readonly options: GithubResourceCountPRWorkflowOptions;
  private readonly namePrefix: string;
  private readonly branchName: string;
  private readonly workingDirectory: string | undefined;
  private readonly cdkoutDir: string;

  constructor(app: awscdk.AwsCdkTypeScriptApp, options: GithubResourceCountPRWorkflowOptions = {}) {
    super(app);
    this.app = app;
    this.options = options;

    this.branchName = options.branchName ?? 'main';
    this.workingDirectory = options.workingDirectory;
    this.cdkoutDir = options.cdkoutDir ?? app.cdkConfig.cdkout;

    const pipelineName = options.pipelineName ?? (app.parent ? app.name : undefined);
    this.namePrefix = pipelineName ? `${pipelineName}-` : '';

    // For subprojects, use the root project's GitHub component since
    // GitHub Actions only discovers workflows in the repo-root .github/workflows/
    const gh = this.workingDirectory ? GitHub.of(this.app.root) : this.app.github;
    if (!gh) {
      throw new Error('GitHub component not found. For subprojects, ensure the root project has a GitHub component.');
    }
    this.gh = gh;

    this.createWorkflow();
  }

  /**
   * Returns the paths filter array with the workflow file itself included.
   */
  private pathsWithWorkflowFile(): string[] {
    const workflowFilePath = `${WORKFLOW_DIR}/${this.namePrefix}resource-count.yml`;
    return [...this.options.paths!, workflowFilePath];
  }

  /**
   * Returns job defaults for working directory when set.
   */
  private jobDefaults(): object | undefined {
    if (this.workingDirectory) {
      return {
        run: {
          'working-directory': this.workingDirectory,
        },
      };
    }
    return undefined;
  }

  /**
   * Provides the install step for the workflow.
   */
  private provideInstallStep(): PipelineStep {
    const seq = new StepSequence(this.project, this.options.preInstallSteps ?? []);

    // Detect and add pnpm setup if needed
    if (this.app.package.packageManager === NodePackageManager.PNPM) {
      seq.addSteps(new PnpmSetupStep(this.project, {
        version: (this.app.package as any).pnpmVersion,
      }));
    }

    // Detect and add corepack enable for Yarn Berry
    if (this.app.package.packageManager === NodePackageManager.YARN_BERRY) {
      seq.addSteps(new CorepackSetupStep(this.project));
    }

    if (this.options.preInstallCommands) {
      seq.addSteps(new SimpleCommandStep(this.project, this.options.preInstallCommands));
    }
    seq.addSteps(new SimpleCommandStep(this.project, [this.app.package.installCommand]));
    return seq;
  }

  /**
   * Provides the synth step for the workflow.
   */
  private provideSynthStep(): PipelineStep {
    const seq = new StepSequence(this.project, []);

    if (this.options.synthRoleArn) {
      seq.addSteps(new AwsAssumeRoleStep(this.project, {
        roleArn: this.options.synthRoleArn,
        jumpRoleArn: this.options.synthJumpRoleArn,
      }));
    }

    seq.addSteps(...this.options.preSynthSteps ?? []);
    if (this.options.preSynthCommands) {
      seq.addSteps(new SimpleCommandStep(this.project, this.options.preSynthCommands));
    }

    if (this.options.preBuildCommand) {
      const cmd = this.options.preBuildCommand;
      const wrappedCmd = this.workingDirectory ? `cd $GITHUB_WORKSPACE && ${cmd}` : cmd;
      seq.addSteps(new SimpleCommandStep(this.project, [wrappedCmd]));
    }

    seq.addSteps(new SimpleCommandStep(this.project, ['npx projen build']));

    seq.addSteps(...this.options.postSynthSteps ?? []);
    if (this.options.postSynthCommands) {
      seq.addSteps(new SimpleCommandStep(this.project, this.options.postSynthCommands));
    }
    return seq;
  }

  /**
   * Provides the resource count step for the workflow.
   */
  private provideResourceCountStep(): PipelineStep {
    return new ResourceCountStep(this.project, {
      cloudAssemblyDir: this.cdkoutDir,
      warningThreshold: this.options.resourceCountWarningThreshold ?? 450,
      resourceLimit: this.options.resourceCountLimit ?? 500,
      outputFile: 'resource-count-results.json',
      githubSummary: true,
    });
  }

  /**
   * Creates the GitHub Actions workflow for resource counting on PRs.
   */
  private createWorkflow(): void {
    const workflow: GithubWorkflow = this.gh.addWorkflow(`${this.namePrefix}resource-count`);
    workflow.on({
      pullRequest: {
        branches: [this.branchName],
        ...this.options.paths && { paths: this.pathsWithWorkflowFile() },
      },
    });

    const steps: PipelineStep[] = [];
    steps.push(this.provideInstallStep());
    steps.push(this.provideSynthStep());
    steps.push(this.provideResourceCountStep());

    const githubSteps = steps.map(s => s.toGithub());

    workflow.addJob('resource-count', {
      name: 'Count CloudFormation resources',
      runsOn: this.options.runnerTags ?? DEFAULT_RUNNER_TAGS,
      ...this.jobDefaults() && { defaults: this.jobDefaults() },
      env: {
        CI: 'true',
        ...githubSteps.reduce((acc, step) => ({ ...acc, ...step.env }), {}),
      },
      needs: [...githubSteps.flatMap(s => s.needs)],
      permissions: mergeJobPermissions({
        contents: JobPermission.READ,
        pullRequests: JobPermission.WRITE,
      }, ...(githubSteps.flatMap(s => s.permissions).filter(p => p != undefined) as JobPermissions[])),
      tools: {
        node: {
          version: this.options.nodeVersion ?? '20',
        },
      },
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v6',
        },
        ...githubSteps.flatMap(s => s.steps),
        {
          name: 'Post PR comment with resource counts',
          uses: 'actions/github-script@v7',
          with: {
            script: this.generatePrCommentScript(),
          },
        },
      ],
    });
  }

  /**
   * Generates the JavaScript code used by actions/github-script to post a PR comment
   * with resource counts per stack.
   */
  private generatePrCommentScript(): string {
    const resultsFile = this.workingDirectory ? `${this.workingDirectory}/resource-count-results.json` : 'resource-count-results.json';
    return [
      'const fs = require(\'fs\');',
      `const resultsPath = '${resultsFile}';`,
      'if (!fs.existsSync(resultsPath)) { console.log(\'No resource count results found\'); return; }',
      'const results = JSON.parse(fs.readFileSync(resultsPath, \'utf8\'));',
      'let body = \'## CloudFormation Resource Count\\n\\n\';',
      'body += \'| Stack | Resources | Limit | Usage | Status |\\n\';',
      'body += \'| --- | --- | --- | --- | --- |\\n\';',
      'for (const stack of results.stacks) {',
      '  const status = stack.exceeded ? \'🔴 Exceeded\' : stack.warning ? \'🟡 Warning\' : \'🟢 OK\';',
      '  body += `| ${stack.stackName} | ${stack.resourceCount} | ${stack.resourceLimit} | ${stack.percentUsed}% | ${status} |\\n`;',
      '}',
      'if (results.hasExceeded) { body += \'\\n> **Error:** One or more stacks exceed the resource limit!\\n\'; }',
      'else if (results.hasWarnings) { body += \'\\n> **Warning:** One or more stacks are approaching the resource limit.\\n\'; }',
      'const { data: comments } = await github.rest.issues.listComments({ owner: context.repo.owner, repo: context.repo.repo, issue_number: context.issue.number });',
      'const marker = \'<!-- resource-count-comment -->\';',
      'body = marker + \'\\n\' + body;',
      'const existing = comments.find(c => c.body && c.body.includes(marker));',
      'if (existing) { await github.rest.issues.updateComment({ owner: context.repo.owner, repo: context.repo.repo, comment_id: existing.id, body }); }',
      'else { await github.rest.issues.createComment({ owner: context.repo.owner, repo: context.repo.repo, issue_number: context.issue.number, body }); }',
    ].join('\n');
  }
}
