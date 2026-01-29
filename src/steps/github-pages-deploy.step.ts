import { Project } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { BashStepConfig, CodeCatalystStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

/**
 * Configuration for a GitHub Pages deployment step
 */
export interface GithubPagesDeployStepConfig {
  /**
   * The command to run to build the documentation
   * @example 'npm run docs'
   * @example 'pnpm build:docs'
   */
  readonly buildCommand: string;

  /**
   * The folder containing the built documentation to deploy
   * @example 'docs'
   * @example 'dist/docs'
   * @default 'docs'
   */
  readonly docsFolder?: string;

  /**
   * The branch to deploy from (used for GitHub Pages source configuration)
   * @default 'main'
   */
  readonly sourceBranch?: string;

  /**
   * Custom domain for GitHub Pages
   * @default undefined
   */
  readonly customDomain?: string;

  /**
   * The name of the GitHub Pages artifact
   * @default 'github-pages'
   */
  readonly artifactName?: string;
}

/**
 * A step that builds documentation and deploys it to GitHub Pages using GitHub Actions deployment mode
 *
 * This step uses the official GitHub Actions for Pages deployment:
 * - actions/upload-pages-artifact@v3
 * - actions/deploy-pages@v4
 *
 * @example
 * new GithubPagesDeployStep(project, {
 *   buildCommand: 'npm run build:docs',
 *   docsFolder: 'dist/docs',
 *   customDomain: 'docs.example.com',
 * });
 */
export class GithubPagesDeployStep extends PipelineStep {

  private readonly docsFolder: string;
  private readonly artifactName: string;

  constructor(project: Project, private readonly config: GithubPagesDeployStepConfig) {
    super(project);
    this.docsFolder = config.docsFolder ?? 'docs';
    this.artifactName = config.artifactName ?? 'github-pages';
  }

  public toGitlab(): GitlabStepConfig {
    const commands: string[] = [];

    // Build docs
    commands.push('echo "Building documentation..."');
    commands.push(this.config.buildCommand);

    // Install GitLab Pages (using public folder convention for GitLab)
    commands.push('echo "Preparing documentation for GitLab Pages..."');
    commands.push('rm -rf public');
    commands.push(`cp -r ${this.docsFolder} public`);

    // Add custom domain if specified
    if (this.config.customDomain) {
      commands.push(`echo "${this.config.customDomain}" > public/CNAME`);
    }

    return {
      env: {},
      commands,
      extensions: [],
      needs: [],
    };
  }

  public toGithub(): GithubStepConfig {
    const steps = [];

    // Build documentation
    steps.push({
      name: 'Build Documentation',
      run: this.config.buildCommand,
    });

    // Add custom domain if specified
    if (this.config.customDomain) {
      steps.push({
        name: 'Add Custom Domain',
        run: `echo "${this.config.customDomain}" > ${this.docsFolder}/CNAME`,
      });
    }

    // Upload pages artifact
    steps.push({
      name: 'Upload Pages Artifact',
      uses: 'actions/upload-pages-artifact@v3',
      with: {
        path: this.docsFolder,
        name: this.artifactName,
      },
    });

    // Deploy to GitHub Pages
    steps.push({
      name: 'Deploy to GitHub Pages',
      id: 'deployment',
      uses: 'actions/deploy-pages@v4',
      with: {
        artifact_name: this.artifactName,
      },
    });

    return {
      steps,
      needs: [],
      env: {},
      permissions: {
        contents: JobPermission.READ,
        pages: JobPermission.WRITE,
        idToken: JobPermission.WRITE,
      },
    };
  }

  public toBash(): BashStepConfig {
    const commands: string[] = [];

    // Build docs
    commands.push('echo "Building documentation..."');
    commands.push(this.config.buildCommand);

    // Simulate deployment
    commands.push(`echo "Documentation built in ${this.docsFolder}"`);
    commands.push('echo "Note: Bash deployment to GitHub Pages is not supported. Use GitHub Actions."');

    return { commands };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    throw new Error('CodeCatalyst is not supported for GitHub Pages deployment');
  }
}
