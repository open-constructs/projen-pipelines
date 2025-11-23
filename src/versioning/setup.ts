import { Project } from 'projen';
import { VersioningConfig } from 'cdk-devops';

/**
 * Sets up versioning tasks and integration for a project
 */
export class VersioningSetup {

  constructor(private readonly project: Project, private readonly config: VersioningConfig) {
  }

  /**
   * Set up all versioning-related tasks and configurations
   */
  public setup(): void {
    // Create version computation task
    this.createVersionComputeTask();

    // Create version print task
    this.createVersionPrintTask();

    // Add version computation to build process
    this.integrateWithBuildProcess();

    // Add version file to gitignore
    this.project.gitignore.exclude('~version.json');
  }

  /**
   * Create the version:compute task
   */
  private createVersionComputeTask(): void {
    this.project.addTask('version:compute', {
      description: 'Compute version information from git',
      steps: [
        { exec: 'echo "Computing version information..."' },
        {
          exec: this.generateVersionComputeScript(),
        },
      ],
    });
  }

  /**
   * Create the version:print task
   */
  private createVersionPrintTask(): void {
    this.project.addTask('version:print', {
      description: 'Print version information',
      steps: [
        { exec: 'cat ~version.json' },
      ],
    });
  }

  /**
   * Integrate version computation with the build process
   */
  private integrateWithBuildProcess(): void {
    const compileTask = this.project.tasks.tryFind('compile');
    const computeTask = this.project.tasks.tryFind('version:compute');
    const printTask = this.project.tasks.tryFind('version:print');

    if (compileTask && computeTask && printTask) {
      compileTask.prependSpawn(printTask);
      compileTask.prependSpawn(computeTask);
    }
  }

  /**
   * Generate the Node.js script for version computation
   */
  private generateVersionComputeScript(): string {
    const strategyJson = JSON.stringify(this.config.strategy).replace(/"/g, '\\"');

    return `node -e "
const fs = require('fs');
const cp = require('child_process');

// Import versioning modules
const { VersionComputer, VersioningStrategy } = require('cdk-devops');

try {
  // Gather git information
  const commitHash = cp.execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim();
  const commitHashShort = commitHash.substring(0, 8);
  const commitCount = parseInt(cp.execSync('git rev-list --count HEAD', {encoding: 'utf8'}).trim());
  const branch = cp.execSync('git rev-parse --abbrev-ref HEAD', {encoding: 'utf8'}).trim();
  
  let tag = '';
  let commitsSinceTag = 0;
  try { 
    tag = cp.execSync('git describe --tags --exact-match --all', {encoding: 'utf8'}).trim();
  } catch {
    try {
      const describeOutput = cp.execSync('git describe --tags --long --all', {encoding: 'utf8'}).trim();
      const match = describeOutput.match(/^(.+)-(\\\\d+)-g[0-9a-f]+$/);
      if (match) {
        tag = match[1];
        commitsSinceTag = parseInt(match[2]);
      }
    } catch {}
  }
  
  let packageVersion = '0.0.0';
  try {
    packageVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  } catch {}
  
  // Create computation context
  const context = {
    gitInfo: {
      commitHash,
      commitHashShort,
      branch,
      tag,
      commitsSinceTag,
      commitCount,
      packageVersion
    },
    environment: process.env.STAGE || process.env.ENVIRONMENT || 'unknown',
    deployedBy: process.env.GITHUB_ACTOR || process.env.GITLAB_USER_LOGIN || process.env.USER || 'unknown',
    buildNumber: process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER,
    repository: process.env.GITHUB_REPOSITORY || process.env.CI_PROJECT_PATH,
    pipelineVersion: process.env.PIPELINE_VERSION
  };
  
  // Create strategy from configuration
  const strategyConfig = ${strategyJson};
  const strategy = new VersioningStrategy(strategyConfig.format, strategyConfig.components);
  
  // Compute version
  const computer = new VersionComputer(strategy);
  computer.computeVersionInfo(context).then(versionInfo => {
    fs.writeFileSync('~version.json', versionInfo.toJson());
    console.log('Version computed:', versionInfo.version, '(commit:', versionInfo.commitHashShort + ')');
  }).catch(error => {
    console.error('Error computing version:', error.message);
    const fallback = {
      version: '0.0.0',
      commitHash: 'unknown',
      commitHashShort: 'unknown',
      branch: 'unknown',
      commitCount: 0,
      packageVersion: '0.0.0',
      deployedAt: new Date().toISOString(),
      deployedBy: 'unknown',
      environment: 'unknown'
    };
    fs.writeFileSync('~version.json', JSON.stringify(fallback, null, 2));
  });
} catch (e) {
  console.error('Error in version computation:', e.message);
  const fallback = {
    version: '0.0.0',
    commitHash: 'unknown',
    commitHashShort: 'unknown',
    branch: 'unknown',
    commitCount: 0,
    packageVersion: '0.0.0',
    deployedAt: new Date().toISOString(),
    deployedBy: 'unknown',
    environment: 'unknown'
  };
  fs.writeFileSync('~version.json', JSON.stringify(fallback, null, 2));
}"`;
  }
}
