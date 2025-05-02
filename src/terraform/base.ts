import { Component, Project } from 'projen';
import { PipelineEngine } from '../engine';
import { StepSequence, AwsAssumeRoleStep, ProjenScriptStep, PipelineStep } from '../steps';


/**
* IAM role ARNs for different Terraform operations
*/
export interface TerraformIamRoleArns {
  /**
   * Default role ARN to use if no specific role is provided
   */
  readonly default: string;

  /**
   * Role ARN for planning Terraform changes
   * @default - uses default role ARN
   */
  readonly plan?: string;

  /**
   * Role ARN for applying Terraform changes
   * @default - uses default role ARN
   */
  readonly apply?: string;
}

export interface TerraformPipelineOptions {
  /**
   * Name of the pipeline
   * Required if using a folder structure
   * Will be used to prefix all tasks and pipeline names
   * @default -
   */
  readonly name?: string;

  /**
   * The folder containing Terraform files
   * @default '.'
   */
  readonly folder?: string;

  /**
   * Branch name to trigger the pipeline on
   * @default 'main'
   */
  readonly branchName?: string;

  /**
   * IAM role ARNs for different operations
   */
  readonly iamRoleArns: TerraformIamRoleArns;

  /**
   * Steps to run before installing dependencies
   */
  readonly preInstallSteps?: PipelineStep[];

  /**
   * Steps to run before planning
   */
  readonly prePlanSteps?: PipelineStep[];

  /**
   * Steps to run after planning
   */
  readonly postPlanSteps?: PipelineStep[];

  /**
   * Additional steps to run before deployment
   */
  readonly preApplySteps?: PipelineStep[];

  /**
    * Additional steps to run after deployment
    */
  readonly postApplySteps?: PipelineStep[];

  /**
   * Terraform version to use
   * @default 'latest'
   */
  readonly terraformVersion?: string;
}

export abstract class TerraformPipeline extends Component {

  public readonly project: Project;

  protected readonly branchName: string;
  protected readonly folder: string;
  protected readonly pipelineName: string;
  protected readonly taskPrefix?: string;

  constructor(project: Project, protected baseOptions: TerraformPipelineOptions) {
    super(project);

    this.project = project;
    this.branchName = baseOptions.branchName ?? 'main';
    this.pipelineName = baseOptions.name ?? project.name;


    this.folder = baseOptions.folder === undefined || baseOptions.folder === '.' ? '.' : `./${baseOptions.folder}`;

    // If folder is specified, name must be provided
    if (baseOptions.folder && baseOptions.folder !== '.' && !baseOptions.name) {
      throw new Error('When using a folder structure, a name must be provided for the pipeline');
    }

    // Create task prefix - if folder is specified, use the name as prefix
    this.taskPrefix = baseOptions.name ? `${baseOptions.name}:` : '';

    // Remove tasks that might conflict with the pipeline process
    this.project.removeTask('plan');
    this.project.removeTask('deploy');
    this.project.removeTask('destroy');

    // Create Terraform tasks
    this.createTerraformTasks();

    // Create the Terraform configuration generator
    // this.createTerraformBackend();
  }

  /**
   * The type of engine this implementation of TerraformPipeline is for.
   */
  public abstract engineType(): PipelineEngine;

  protected createTerraformTasks(): void {
    // Create Terraform plan task
    this.project.addTask(`tf:${this.taskPrefix}plan`, {
      description: 'Run terraform plan',
      exec: `cd ${this.folder} && terraform init && terraform plan`,
    });

    // Create Terraform apply task
    this.project.addTask(`tf:${this.taskPrefix}apply`, {
      description: 'Apply terraform changes',
      exec: `cd ${this.folder} && terraform init && terraform apply -auto-approve`,
    });

    // Create Terraform destroy task
    this.project.addTask(`tf:${this.taskPrefix}destroy`, {
      description: 'Destroy terraform resources',
      exec: `cd ${this.folder} && terraform init && terraform destroy -auto-approve`,
    });

    // Create Terraform init task
    this.project.addTask(`tf:${this.taskPrefix}init`, {
      description: 'Initialize terraform',
      exec: `cd ${this.folder} && terraform init`,
    });

    // Create Terraform validate task
    this.project.addTask(`tf:${this.taskPrefix}validate`, {
      description: 'Validate terraform configuration',
      exec: `cd ${this.folder} && terraform validate`,
    });
  }

  /**
   * Provides the Terraform plan step sequence.
   */
  protected providePlanStep(): StepSequence {
    return new StepSequence(this.project, [
      new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns?.plan ?? this.baseOptions.iamRoleArns?.default,
      }),
      ...this.baseOptions.prePlanSteps ?? [],
      new ProjenScriptStep(this.project, `tf:${this.taskPrefix}plan`),
      ...this.baseOptions.postPlanSteps ?? [],
    ]);
  }

  /**
   * Provides the Terraform apply step sequence.
   */
  protected provideDeployStep(): StepSequence {
    return new StepSequence(this.project, [
      new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns?.apply ?? this.baseOptions.iamRoleArns?.default,
      }),
      ...this.baseOptions.preApplySteps ?? [],
      new ProjenScriptStep(this.project, `tf:${this.taskPrefix}apply`),
      ...this.baseOptions.postApplySteps ?? [],
    ]);
  }

  /**
   * Creates a Terraform configuration generator.
   */
  //   private createTerraformBackend(): void {
  //     const configFile = new TextFile(this.project, `${this.folder}/backend.tf`);

  //     configFile.addLine(`# Generated by projen-pipelines. DO NOT EDIT MANUALLY.
  // terraform {
  //   backend "s3" {
  //     # These values must be provided via CLI or environment variables
  //     # bucket = "terraform-state-bucket"
  //     # key    = "terraform.tfstate"
  //     # region = "us-east-1"
  //   }

  //   required_version = ">= 1.0.0"

  //   required_providers {
  //     aws = {
  //       source  = "hashicorp/aws"
  //       version = "~> 5.0"
  //     }
  //   }
  // }

  // provider "aws" {
  //   region = "us-east-1" # Default region, can be overridden
  // }

  // # Include your Terraform modules and resources below
  // `);
  //   }

}
