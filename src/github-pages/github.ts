import { Component, Project } from 'projen';
import { GithubWorkflow } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { mergeJobPermissions } from '../engines';
import { GithubPagesDeployStep } from '../steps';

/**
 * Configuration options for the GitHub Pages workflow
 */
export interface GithubPagesWorkflowOptions {
  /**
   * The build command to run to generate documentation
   * @example 'npm run build:docs'
   */
  readonly buildCommand: string;

  /**
   * The folder containing the built documentation to deploy
   * @default 'docs'
   */
  readonly docsFolder?: string;

  /**
   * Custom domain for GitHub Pages
   * @default undefined
   */
  readonly customDomain?: string;

  /**
   * The name of the workflow file (without .yml extension)
   * @default 'github-pages'
   */
  readonly workflowName?: string;

  /**
   * The branch that triggers the workflow
   * @default 'main'
   */
  readonly branchName?: string;

  /**
   * Runner tags to use for the job
   * @default ['ubuntu-latest']
   */
  readonly runnerTags?: string[];

  /**
   * Node.js version to use
   * @default '20'
   */
  readonly nodeVersion?: string;

  /**
   * Whether to run npm install before building docs
   * @default true
   */
  readonly runInstall?: boolean;

  /**
   * The name of the GitHub Pages artifact
   * @default 'github-pages'
   */
  readonly artifactName?: string;

  /**
   * Custom install command (overrides the default npm/yarn/pnpm install)
   * @default undefined - uses project's install command
   */
  readonly installCommand?: string;
}

/**
 * Creates a GitHub workflow that builds documentation and deploys it to GitHub Pages
 *
 * This workflow:
 * 1. Checks out the repository
 * 2. Sets up Node.js
 * 3. Installs dependencies (optional)
 * 4. Builds documentation
 * 5. Deploys to GitHub Pages using the official GitHub Actions
 *
 * @example
 * const project = new Project({ name: 'my-project' });
 * new GithubPagesWorkflow(project, {
 *   buildCommand: 'npm run build:docs',
 *   docsFolder: 'dist/docs',
 *   customDomain: 'docs.example.com',
 * });
 */
export class GithubPagesWorkflow extends Component {
  /** The GitHub workflow instance */
  public readonly workflow: GithubWorkflow;

  constructor(project: Project, options: GithubPagesWorkflowOptions) {
    super(project);

    const workflowName = options.workflowName ?? 'github-pages';
    const branchName = options.branchName ?? 'main';
    const runnerTags = options.runnerTags ?? ['ubuntu-latest'];
    const nodeVersion = options.nodeVersion ?? '20';
    const runInstall = options.runInstall ?? true;

    // Create the GitHub Pages deployment step
    const deployStep = new GithubPagesDeployStep(project, {
      buildCommand: options.buildCommand,
      docsFolder: options.docsFolder,
      customDomain: options.customDomain,
      artifactName: options.artifactName,
    });

    const githubStepConfig = deployStep.toGithub();

    // Create the workflow
    this.workflow = (project as any).github?.addWorkflow(workflowName);

    if (!this.workflow) {
      throw new Error('GitHub is not enabled for this project. Make sure the project has GitHub configured.');
    }

    // Configure workflow triggers
    this.workflow.on({
      push: {
        branches: [branchName],
      },
      workflowDispatch: {},
    });

    // Build the job steps
    const jobSteps: any[] = [];

    // Checkout step
    jobSteps.push({
      name: 'Checkout',
      uses: 'actions/checkout@v4',
    });

    // Setup Node.js
    jobSteps.push({
      name: 'Setup Node.js',
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': nodeVersion,
      },
    });

    // Install dependencies
    if (runInstall) {
      if (options.installCommand) {
        jobSteps.push({
          name: 'Install dependencies',
          run: options.installCommand,
        });
      } else {
        jobSteps.push({
          name: 'Install dependencies',
          run: 'npm ci',
        });
      }
    }

    // Add the deployment steps
    jobSteps.push(...githubStepConfig.steps);

    // Add the job to the workflow
    this.workflow.addJob('deploy', {
      name: 'Build and deploy documentation to GitHub Pages',
      runsOn: runnerTags,
      permissions: mergeJobPermissions(
        {
          contents: JobPermission.READ,
        },
        githubStepConfig.permissions ?? {},
      ),
      steps: jobSteps,
      env: githubStepConfig.env,
      concurrency: {
        'group': 'pages',
        'cancel-in-progress': false,
      },
    });
  }
}
