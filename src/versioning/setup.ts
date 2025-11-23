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
   * Generate the command for version computation using cdk-devops
   */
  private generateVersionComputeScript(): string {
    const strategyJson = JSON.stringify(this.config.strategy);
    // Use the static computeVersion function from cdk-devops
    return `node -e "require('cdk-devops').computeVersion(${strategyJson}).catch(e => { console.error(e); process.exit(1); })"`;
  }
}
