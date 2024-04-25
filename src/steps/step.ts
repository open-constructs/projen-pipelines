import { Project } from 'projen';
import { JobStep } from 'projen/lib/github/workflows-model';
import { Need } from 'projen/lib/gitlab';

/**
 * Configuration interface for a GitLab CI step.
 */
export interface GitlabStepConfig {

  /** List of job extensions related to the step. */
  readonly extensions: string[];

  /** Dependencies which need to be completed before this step. */
  readonly needs: Need[];

  /** Shell commands to execute in this step. */
  readonly commands: string[];
}

/**
 * Configuration interface for a GitHub Actions step.
 */
export interface GithubStepConfig {

  /** Dependencies which need to be completed before this step. */
  readonly needs: string[];

  /** Commands wrapped as GitHub Action job steps. */
  readonly steps: JobStep[];
}

/**
 * Configuration interface for a bash script step.
 */
export interface BashStepConfig {

  /** Shell commands to execute. */
  readonly commands: string[];
}

/**
 * Abstract class defining the structure of a pipeline step.
 */
export abstract class PipelineStep {

  /**
   * Initializes a new instance of a PipelineStep with a reference to a projen project.
   * @param project - The projen project reference.
   */
  constructor(protected project: Project) {
    // Constructor can be extended to include more setup logic.
  }

  /**
   * Generates a configuration for a GitLab CI step. Must be implemented by subclasses.
   */
  public abstract toGitlab(): GitlabStepConfig;

  /**
   * Generates a configuration for a GitHub Actions step. Must be implemented by subclasses.
   */
  public abstract toGithub(): GithubStepConfig;

  /**
   * Generates a configuration for a bash script step. Must be implemented by subclasses.
   */
  public abstract toBash(): BashStepConfig;
}

/**
 * Concrete implementation of PipelineStep that executes simple commands.
 */
export class SimpleCommandStep extends PipelineStep {

  /**
   * Constructs a simple command step with a specified set of commands.
   * @param project - The projen project reference.
   * @param commands - Shell commands to execute.
   */
  constructor(project: Project, protected commands: string[]) {
    super(project);
  }

  /**
   * Converts the step into a GitLab CI configuration.
   */
  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [], // No job extensions specified for this step.
      commands: this.commands, // Commands to be run.
      needs: [], // No dependencies.
    };
  }

  /**
   * Converts the step into a Bash script configuration.
   */
  public toBash(): BashStepConfig {
    return {
      commands: this.commands, // Commands to be run.
    };
  }

  /**
   * Converts the step into a GitHub Actions step configuration.
   */
  public toGithub(): GithubStepConfig {
    return {
      needs: [], // No dependencies.
      steps: this.commands.map(c => ({ run: c })), // Maps each command into a GitHub Action job step.
    };
  }
}
