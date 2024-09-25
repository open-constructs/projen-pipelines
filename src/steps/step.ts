import { Project } from 'projen';
import { JobPermissions, JobStep } from 'projen/lib/github/workflows-model';
import { Need } from 'projen/lib/gitlab';
import { mergeJobPermissions } from '../engines';

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

  /** Additional environment variables to set for this step. */
  readonly env: { [key: string]: string };
}

/**
 * Configuration interface for a GitHub Actions step.
 */
export interface GithubStepConfig {

  /** Dependencies which need to be completed before this step. */
  readonly needs: string[];

  /** Commands wrapped as GitHub Action job steps. */
  readonly steps: JobStep[];

  /** Additional environment variables to set for this step. */
  readonly env: { [key: string]: string };

  /** Additional job permissions needed */
  readonly permissions?: JobPermissions;
}

/**
 * Configuration interface for a CodeCatalyst Actions step.
 */
export interface CodeCatalystStepConfig {

  /** Dependencies which need to be completed before this step. */
  readonly needs: string[];

  /** Commands wrapped as GitHub Action job steps. */
  readonly commands: string[];

  /** Additional environment variables to set for this step. */
  readonly env: { [key: string]: string };

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
   * Generates a configuration for a GitLab CI step. Should be implemented by subclasses.
   */
  public toGitlab(): GitlabStepConfig {
    throw new Error('Method not implemented.');
  }

  /**
   * Generates a configuration for a GitHub Actions step. Should be implemented by subclasses.
   */
  public toGithub(): GithubStepConfig {
    throw new Error('Method not implemented.');
  }

  /**
   * Generates a configuration for a CodeCatalyst Actions step. Should be implemented by subclasses.
   */
  public toCodeCatalyst(): CodeCatalystStepConfig {
    throw new Error('Method not implemented.');
  }

  /**
   * Generates a configuration for a bash script step. Should be implemented by subclasses.
   */
  public toBash(): BashStepConfig {
    throw new Error('Method not implemented.');
  }
}

/**
 * Concrete implementation of PipelineStep that executes simple commands.
 */
export class SimpleCommandStep extends PipelineStep {

  protected commands: string[];

  /**
   * Constructs a simple command step with a specified set of commands.
   * @param project - The projen project reference.
   * @param commands - Shell commands to execute.
   */
  constructor(project: Project, commands: string[]) {
    super(project);
    this.commands = [...commands];
  }

  /**
   * Converts the step into a GitLab CI configuration.
   */
  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [], // No job extensions specified for this step.
      commands: this.commands, // Commands to be run.
      needs: [], // No dependencies.
      env: {}, // No environment variables.
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
      env: {}, // No environment variables.
    };
  }

  /**
   * Converts the step into a CodeCatalyst Actions step configuration.
   */
  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      needs: [], // No dependencies.
      commands: this.commands.map(c => (c)), // Maps each command into a CodeCatalyst Action job step.
      env: {}, // No environment variables.
    };
  }
}

export class ProjenScriptStep extends SimpleCommandStep {
  constructor(project: Project, scriptName: string, args?: string) {
    super(project, [`npx projen ${scriptName}${args ? ` ${args}` : ''}`]);
  }
}

// Add class that is a sequence of pipleine steps but is a pipeline step in itself
export class StepSequence extends PipelineStep {

  protected steps: PipelineStep[];

  /**
   * Constructs a sequence of pipeline steps.
   * @param project - The projen project reference.
   * @param steps - The sequence of pipeline steps.
   */
  constructor(project: Project, steps: PipelineStep[]) {
    super(project);
    this.steps = [...steps];
  }

  /**
   * Converts the sequence of steps into a GitLab CI configuration.
   */
  public toGitlab(): GitlabStepConfig {
    const extensions: string[] = [];
    const commands: string[] = [];
    const needs: Need[] = [];
    const env: { [key: string]: string } = {};
    for (const step of this.steps) {
      const stepConfig = step.toGitlab();
      extensions.push(...stepConfig.extensions);
      commands.push(...stepConfig.commands);
      needs.push(...stepConfig.needs);
      Object.assign(env, stepConfig.env);
    }
    return {
      extensions,
      commands,
      needs: Array.from(new Set(needs)),
      env,
    };
  }

  /**
   * Converts the sequence of steps into a Bash script configuration.
   */
  public toBash(): BashStepConfig {
    const commands: string[] = [];
    for (const step of this.steps) {
      const stepConfig = step.toBash();
      commands.push(...stepConfig.commands);
    }
    return { commands };
  }

  /**
   * Converts the sequence of steps into a GitHub Actions step configuration.
   */
  public toGithub(): GithubStepConfig {
    const needs: string[] = [];
    const steps: JobStep[] = [];
    const env: { [key: string]: string } = {};
    const permissions: JobPermissions[] = [];
    for (const step of this.steps) {
      const stepConfig = step.toGithub();
      needs.push(...stepConfig.needs);
      steps.push(...stepConfig.steps);
      if (stepConfig.permissions) {
        permissions.push(stepConfig.permissions);
      }
      Object.assign(env, stepConfig.env);
    }
    return {
      needs: Array.from(new Set(needs)),
      steps,
      env,
      permissions: mergeJobPermissions(...permissions),
    };
  }

  /**
   * Converts the sequence of steps into a CodeCatalyst Actions step configuration.
   */
  public toCodeCatalyst(): CodeCatalystStepConfig {
    const needs: string[] = [];
    const commands: string[] = [];
    const env: { [key: string]: string } = {};
    for (const step of this.steps) {
      const stepConfig = step.toCodeCatalyst();
      needs.push(...stepConfig.needs);
      commands.push(...stepConfig.commands);
      Object.assign(env, stepConfig.env);
    }
    return {
      needs: Array.from(new Set(needs)),
      commands,
      env,
    };
  }

  public addSteps(...steps: PipelineStep[]) {
    this.steps.push(...steps);
  }

  public prependSteps(...steps: PipelineStep[]) {
    this.steps.unshift(...steps);
  }
}