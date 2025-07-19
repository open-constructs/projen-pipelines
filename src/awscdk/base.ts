import { Component, TextFile, awscdk } from 'projen';
import { PROJEN_MARKER } from 'projen/lib/common';
import { NodePackageManager } from 'projen/lib/javascript';
import { PipelineEngine } from '../engine';
import { AwsAssumeRoleStep, PipelineStep, ProjenScriptStep, SimpleCommandStep, StepSequence } from '../steps';
import { VersioningConfig, VersioningSetup } from '../versioning';

/**
 * The Environment interface is designed to hold AWS related information
 * for a specific deployment environment within your infrastructure.
 * Each environment requires a specific account and region for its resources.
 */
export interface Environment {
  /**
   * The AWS Account ID associated with the environment. It's important because
   * different services or features could have distinct permissions and settings
   * in different accounts.
   */
  readonly account: string;

  /**
   * The AWS Region for the environment. This determines where your resources
   * are created and where your application will run. It can affect latency,
   * availability, and pricing.
   */
  readonly region: string;
}

// /**
//  * Describes the type of pipeline that will be created
//  */
// export enum DeploymentType {
//   /** Deploy every commit as far as possible; hopefully into production */
//   CONTINUOUS_DEPLOYMENT,
//   /** Build every commit and prepare all assets for a later deployment */
//   CONTINUOUS_DELIVERY,
// }

export enum CdkDiffType {
  /** Do not perform a diff */
  NONE,
  /** Perform a fast template diff (--no-changeset) */
  FAST,
  /** Perform a full CloudFormation diff (--changeset) */
  FULL,
}

/**
 * Options for stages that are part of the pipeline
 */
export interface DeploymentStage extends NamedStageOptions {
  readonly manualApproval?: boolean;
}

/**
 * Options for stages that are not part of the pipeline
 */
export interface IndependentStage extends NamedStageOptions {
  /**
   * This specifies whether the stage should be deployed on push
   *
   * @default false
   */
  readonly deployOnPush?: boolean;
}

/**
 * Options for a CDK stage with a name
 */
export interface NamedStageOptions extends StageOptions {
  readonly name: string;
  readonly watchable?: boolean;
  readonly diffType?: CdkDiffType;
  readonly postDiffSteps?: PipelineStep[];
  readonly postDeploySteps?: PipelineStep[];
}

/**
 * Options for a CDK stage like the target environment
 */
export interface StageOptions {
  readonly env: Environment;
}

/**
 * Configuration interface for IAM roles used in the CDK pipeline.
 */
export interface IamRoleConfig {

  /** Default IAM role ARN used if no specific role is provided. */
  readonly default?: string;
  /** IAM role ARN for the synthesis step. */
  readonly synth?: string;
  /** IAM role ARN for the asset publishing step. */
  readonly assetPublishing?: string;
  /** IAM role ARN for the asset publishing step for a specific stage. */
  readonly assetPublishingPerStage?: { [stage: string]: string };
  /** IAM role ARNs for different diff stages. */
  readonly diff?: { [stage: string]: string };
  /** IAM role ARNs for different deployment stages. */
  readonly deployment?: { [stage: string]: string };
}

/**
 * The CDKPipelineOptions interface is designed to provide configuration
 * options for a CDK (Cloud Development Kit) pipeline. It allows the definition
 * of settings such as the stack prefix and package namespace to be used in the
 * AWS stack, along with the environments configuration to be used.
 */
export interface CDKPipelineOptions {

  /**
   * the name of the branch to deploy from
   * @default main
   */
  readonly branchName?: string;

  /**
   * This field is used to define a prefix for the AWS Stack resources created
   * during the pipeline's operation.
   *
   * @default project name
   */
  readonly stackPrefix?: string;

  /**
   * If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack.
   * You can use this to deploy CDk applications containing multiple stacks.
   *
   * @default false
   */
  readonly deploySubStacks?: boolean;

  /**
   * This field determines the NPM namespace to be used when packaging CDK cloud
   * assemblies. A namespace helps group related resources together, providing
   * better organization and ease of management.
   *
   * This is only needed if you need to version and upload the cloud assembly to a package repository.
   *
   * @default -
   */
  readonly pkgNamespace?: string;

  /** IAM config */
  readonly iamRoleArns: IamRoleConfig;

  /**
   * This field specifies a list of stages that should be deployed using a CI/CD pipeline
   */
  readonly stages: DeploymentStage[];

  /** This specifies details for independent stages */
  readonly independentStages?: IndependentStage[];

  /** This specifies details for a personal stage */
  readonly personalStage?: StageOptions;

  /** This specifies details for feature stages */
  readonly featureStages?: StageOptions;

  // /**
  //  * This field specifies the type of pipeline to create. If set to CONTINUOUS_DEPLOYMENT,
  //  * every commit is deployed as far as possible, hopefully into production. If set to
  //  * CONTINUOUS_DELIVERY, every commit is built and all assets are prepared for a later deployment.
  //  *
  //  * @default CONTINUOUS_DELIVERY
  //  */
  // readonly deploymentType?: DeploymentType;

  readonly preInstallCommands?: string[];
  readonly preSynthCommands?: string[];
  readonly postSynthCommands?: string[];

  readonly preInstallSteps?: PipelineStep[];
  readonly preSynthSteps?: PipelineStep[];
  readonly postSynthSteps?: PipelineStep[];

  /**
   * Versioning configuration
   */
  readonly versioning?: VersioningConfig;
}

/**
 * The CDKPipeline class extends the Component class and sets up the necessary configuration for deploying AWS CDK (Cloud Development Kit) applications across multiple stages.
 * It also manages tasks such as publishing CDK assets, bumping version based on git tags, and cleaning up conflicting tasks.
 */
export abstract class CDKPipeline extends Component {
  public readonly stackPrefix: string;
  public readonly branchName: string;

  constructor(protected app: awscdk.AwsCdkTypeScriptApp, protected baseOptions: CDKPipelineOptions) {
    super(app);

    // Add development dependencies
    this.app.addDevDeps(
      '@types/standard-version',
      'standard-version',
      'cdk-assets',
    );
    // this.app.addDeps(
    // );
    this.project.gitignore.exclude('/cdk-outputs-*.json');

    this.stackPrefix = baseOptions.stackPrefix ?? app.name;
    this.branchName = baseOptions.branchName ?? 'main'; // TODO use defaultReleaseBranch of NodeProject

    // Removes the compiled cloud assembly before each synth
    this.project.tasks.tryFind('synth')?.prependExec(`rm -rf ${this.app.cdkConfig.cdkout}`);
    this.project.tasks.tryFind('synth:silent')?.prependExec(`rm -rf ${this.app.cdkConfig.cdkout}`);

    // Remove tasks that might conflict with the pipeline process
    this.project.removeTask('deploy');
    this.project.removeTask('diff');
    this.project.removeTask('destroy');
    this.project.removeTask('watch');

    // Setup versioning if enabled
    if (baseOptions.versioning?.enabled) {
      new VersioningSetup(this.project, baseOptions.versioning).setup();
    }

    // Creates different deployment stages
    if (baseOptions.personalStage) {
      this.createPersonalStage();
    }
    if (baseOptions.featureStages) {
      this.createFeatureStage();
    }
    for (const stage of baseOptions.stages) {
      this.createPipelineStage(stage);
    }
    for (const stage of (baseOptions.independentStages ?? [])) {
      this.createIndependentStage(stage);
    }

    // Creates tasks to handle the release process
    this.createReleaseTasks();

    // Creates a specialized CDK App class
    this.createApplicationEntrypoint();

  }

  public abstract engineType(): PipelineEngine;

  protected provideInstallStep(): PipelineStep {
    const seq = new StepSequence(this.project, this.baseOptions.preInstallSteps ?? []);
    if (this.baseOptions.preInstallCommands) {
      seq.addSteps(new SimpleCommandStep(this.project, this.baseOptions.preInstallCommands));
    }
    seq.addSteps(new ProjenScriptStep(this.project, this.app.package.installCiTask.name));
    return seq;
  }

  protected provideSynthStep(): PipelineStep {
    const seq = new StepSequence(this.project, []);

    if (this.baseOptions.iamRoleArns?.synth) {
      seq.addSteps(new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns.synth,
      }));
    }

    seq.addSteps(...this.baseOptions.preSynthSteps ?? []);
    if (this.baseOptions.preSynthCommands) {
      seq.addSteps(new SimpleCommandStep(this.project, this.baseOptions.preSynthCommands));
    }

    seq.addSteps(new ProjenScriptStep(this.project, 'build'));

    seq.addSteps(...this.baseOptions.postSynthSteps ?? []);
    if (this.baseOptions.postSynthCommands) {
      seq.addSteps(new SimpleCommandStep(this.project, this.baseOptions.postSynthCommands));
    }
    return seq;
  }

  protected provideAssetUploadStep(stageName?: string): PipelineStep {
    const seq = new StepSequence(this.project, []);

    const globalPublishRole = this.baseOptions.iamRoleArns.assetPublishing ?? this.baseOptions.iamRoleArns.default!;
    if (stageName) {
      seq.addSteps(new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns.assetPublishingPerStage ?
          (this.baseOptions.iamRoleArns.assetPublishingPerStage[stageName] ?? globalPublishRole) :
          globalPublishRole,
      }));
      seq.addSteps(new ProjenScriptStep(this.project, `publish:assets:${stageName}`));
    } else {
      if (this.baseOptions.iamRoleArns.assetPublishingPerStage) {
        const stages = [...this.baseOptions.stages, ...this.baseOptions.independentStages ?? []];
        for (const stage of stages) {
          seq.addSteps(new AwsAssumeRoleStep(this.project, {
            roleArn: this.baseOptions.iamRoleArns.assetPublishingPerStage[stage.name] ?? globalPublishRole,
          }));
          seq.addSteps(new ProjenScriptStep(this.project, `publish:assets:${stage.name}`));
        }
      } else {
        seq.addSteps(new AwsAssumeRoleStep(this.project, {
          roleArn: globalPublishRole,
        }));
        seq.addSteps(new ProjenScriptStep(this.project, 'publish:assets'));
      }
    }

    return seq;
  }

  protected provideAssemblyUploadStep(): PipelineStep {
    if (!this.baseOptions.pkgNamespace) {
      throw new Error('pkgNamespace is required when using versioned artifacts (e.g. manual approvals)');
    }
    return new StepSequence(this.project, [
      new ProjenScriptStep(this.project, 'bump'),
      new ProjenScriptStep(this.project, 'release:push-assembly'),
    ]);
  }

  protected provideDeployStep(stage: NamedStageOptions): PipelineStep {
    return new StepSequence(this.project, [
      new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns?.deployment?.[stage.name] ?? this.baseOptions.iamRoleArns?.default!,
        region: stage.env.region,
      }),
      new ProjenScriptStep(this.project, `deploy:${stage.name}`),
      ...stage.postDeploySteps ?? [],
    ]);
  }

  protected provideDiffStep(stage: NamedStageOptions, fast?: boolean): PipelineStep {
    return new StepSequence(this.project, [
      new AwsAssumeRoleStep(this.project, {
        roleArn: this.baseOptions.iamRoleArns?.diff?.[stage.name] ??
          this.baseOptions.iamRoleArns?.deployment?.[stage.name] ??
          this.baseOptions.iamRoleArns?.default!,
        region: stage.env.region,
      }),
      new ProjenScriptStep(this.project, fast ? `fastdiff:${stage.name}` : `diff:${stage.name}`),
      ...stage.postDiffSteps ?? [],
    ]);
  }

  protected renderInstallPackageCommands(packageName: string, runPreInstallCommands: boolean = false): string[] {
    const commands = runPreInstallCommands ? this.baseOptions.preInstallCommands ?? [] : [];

    switch (this.app.package.packageManager) {
      case NodePackageManager.YARN:
      case NodePackageManager.YARN2:
      case NodePackageManager.YARN_BERRY:
      case NodePackageManager.YARN_CLASSIC:
        commands.push(`yarn add ${packageName}`);
        break;
      case NodePackageManager.NPM:
        commands.push(`npm install ${packageName}`);
        break;
      default:
        throw new Error('No install scripts for packageManager: ' + this.app.package.packageManager);
    }
    return commands;
  }

  protected createSafeStageName(name: string): string {
    // Remove non-alphanumeric characters and split into words
    const words = name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);

    // Capitalize the first letter of each word and join them
    return words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }

  /**
   * This method generates the entry point for the application, including interfaces and classes
   * necessary to set up the pipeline and define the AWS CDK stacks for different environments.
   */
  protected createApplicationEntrypoint() {
    let propsCode = '';
    let appCode = '';
    let sep = '-';
    if (this.stackPrefix === '') {
      sep = '';
    }


    if (this.baseOptions.personalStage) {
      propsCode += `  /** This function will be used to generate a personal stack. */
  providePersonalStack: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
`;
      appCode += `    // If the environment variable USER is set and a function is provided for creating a personal stack, it is called with necessary arguments.
    if (props.providePersonalStack && process.env.USER) {
      const stageName = 'personal-' + process.env.USER.toLowerCase().replace(/\\\//g, '-');
      props.providePersonalStack(this, '${this.stackPrefix}${sep}personal', { env: { account: '${this.baseOptions.personalStage.env.account}', region: '${this.baseOptions.personalStage.env.region}' }, stackName: \`${this.stackPrefix}${sep}\${stageName}\`, stageName });
    }
`;
    }

    if (this.baseOptions.featureStages) {
      propsCode += `  /** This function will be used to generate a feature stack. */
  provideFeatureStack: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
`;
      appCode += `    // If the environment variable BRANCH is set and a function is provided for creating a feature stack, it is called with necessary arguments.
    if (props.provideFeatureStack && process.env.BRANCH) {
      const stageName = 'feature-' + process.env.BRANCH.toLowerCase().replace(/\\\//g, '-');
      props.provideFeatureStack(this, '${this.stackPrefix}${sep}feature', { env: { account: '${this.baseOptions.featureStages.env.account}', region: '${this.baseOptions.featureStages.env.region}' }, stackName: \`${this.stackPrefix}${sep}\${stageName}\`, stageName });
    }
`;
    }

    for (const stage of this.baseOptions.stages) {
      const nameUpperFirst = this.createSafeStageName(stage.name);

      propsCode += `  /** This function will be used to generate a ${stage.name} stack. */
  provide${nameUpperFirst}Stack: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
`;
      appCode += `    // If a function is provided for creating a ${stage.name} stack, it is called with necessary arguments.
    if (props.provide${nameUpperFirst}Stack) {
      props.provide${nameUpperFirst}Stack(this, '${this.stackPrefix}${sep}${stage.name}', { env: { account: '${stage.env.account}', region: '${stage.env.region}' }, stackName: '${this.stackPrefix}${sep}${stage.name}', stageName: '${stage.name}' });
    }
`;
    }

    for (const stage of (this.baseOptions.independentStages ?? [])) {
      const nameUpperFirst = this.createSafeStageName(stage.name);

      propsCode += `  /** This function will be used to generate a ${stage.name} stack. */
  provide${nameUpperFirst}Stack: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
`;
      appCode += `    // If a function is provided for creating a ${stage.name} stack, it is called with necessary arguments.
    if (props.provide${nameUpperFirst}Stack) {
      props.provide${nameUpperFirst}Stack(this, '${this.stackPrefix}${sep}${stage.name}', { env: { account: '${stage.env.account}', region: '${stage.env.region}' }, stackName: '${this.stackPrefix}${sep}${stage.name}', stageName: '${stage.name}' });
    }
`;
    }

    // Add versioning logic to apply to all stacks
    if (this.baseOptions.versioning?.enabled) {
      appCode += this.generateVersioningAppCode(this.baseOptions.versioning);
    }

    const appFile = new TextFile(this.project, `${this.app.srcdir}/app.ts`);

    // Generate versioning-aware imports and utilities
    const versioningImports = this.baseOptions.versioning?.enabled
      ? this.generateVersioningImports()
      : '';

    const versioningUtilities = this.baseOptions.versioning?.enabled
      ? this.generateVersioningUtilities(this.baseOptions.versioning)
      : '';

    const versioningConfigDeclaration = this.baseOptions.versioning?.enabled
      ? `
const versioningConfig = ${JSON.stringify(this.baseOptions.versioning, null, 2)};
`
      : '';

    appFile.addLine(`// ${PROJEN_MARKER}
/* eslint-disable */
import { App, AppProps, Stack, StackProps } from 'aws-cdk-lib';
${versioningImports}
${versioningConfigDeclaration}
${versioningUtilities}

/**
 * PipelineAppProps is an extension of AppProps, which is part of the AWS CDK core.
 * It includes optional functions to provide AWS Stacks for different stages.
 *
 * Use these functions to instantiate your application stacks with the parameters for
 * each stage
 */
export interface PipelineAppProps extends AppProps {
${propsCode}
}

/**
 * PipelineAppStackProps is an extension of StackProps, which is part of the AWS CDK core.
 * It includes an additional property to specify the stage name.
 */
export interface PipelineAppStackProps extends StackProps {
  stageName: string;
}

/**
 * The PipelineApp class extends the App class from AWS CDK and overrides the constructor to support
 * different stages of the application (development, production, personal, feature) by invoking the provided
 * stack-providing functions from the props.
 */
export class PipelineApp extends App {
  constructor(props: PipelineAppProps) {
    super(props);

${appCode}

  }
}
`);
  }


  /**
   * This method sets up tasks to publish CDK assets to all accounts and handle versioning, including bumping the version
   * based on the latest git tag and pushing the CDK assembly to the package repository.
   */
  protected createReleaseTasks() {
    const stages = [...this.baseOptions.stages, ...this.baseOptions.independentStages ?? []];
    let sep = '-';
    if (this.stackPrefix === '') {
      sep = '';
    }
    // Task to publish the CDK assets to all accounts
    for (const stage of stages) {
      this.project.addTask(`publish:assets:${stage.name}`, {
        steps: [{
          exec: `npx cdk-assets -p ${this.app.cdkConfig.cdkout}/${this.stackPrefix}${sep}${stage.name}.assets.json publish`,
        }],
      });
    }
    this.project.addTask('publish:assets', {
      steps: stages.map(stage => ({
        spawn: `publish:assets:${stage.name}`,
      })),
    });

    if (this.baseOptions.pkgNamespace) {
      this.project.addTask('bump', {
        description: 'Bumps version based on latest git tag',
        steps: [
          {
            exec: 'pipelines-release bump',
          },
          {
            exec: 'git push --tags',
          },
        ],
      });
      this.project.addTask('release:push-assembly', {
        steps: [
          {
            exec: `pipelines-release create-manifest "${this.app.cdkConfig.cdkout}"  "${this.baseOptions.pkgNamespace}"`,
          },
          {
            cwd: this.app.cdkConfig.cdkout,
            exec: 'npm version --no-git-tag-version from-git',
          },
          {
            cwd: this.app.cdkConfig.cdkout,
            exec: 'npm publish',
          },
        ],
      });
    }

  }

  /**
   * This method sets up tasks for the personal deployment stage, including deployment, watching for changes,
   * comparing changes (diff), and destroying the stack when no longer needed.
   */
  protected createPersonalStage() {
    const stackId = this.getCliStackPattern('personal');
    this.project.addTask('deploy:personal', {
      exec: `cdk deploy --outputs-file cdk-outputs-personal.json ${stackId}`,
    });
    this.project.addTask('watch:personal', {
      exec: `cdk deploy --outputs-file cdk-outputs-personal.json --watch --hotswap ${stackId}`,
    });
    this.project.addTask('diff:personal', {
      exec: `cdk diff ${stackId}`,
    });
    this.project.addTask('fastdiff:personal', {
      exec: `cdk diff --no-changeset ${stackId}`,
    });
    this.project.addTask('destroy:personal', {
      exec: `cdk destroy ${stackId}`,
    });
  }

  /**
   * This method sets up tasks for the feature deployment stage, including deployment, comparing changes (diff),
   * and destroying the stack when no longer needed.
   */
  protected createFeatureStage() {
    const stackId = this.getCliStackPattern('feature');
    this.project.addTask('deploy:feature', {
      exec: `cdk --outputs-file cdk-outputs-feature.json --progress events --require-approval never deploy ${stackId}`,
    });
    this.project.addTask('diff:feature', {
      exec: `cdk diff ${stackId}`,
    });
    this.project.addTask('fastdiff:feature', {
      exec: `cdk diff --no-changeset ${stackId}`,
    });
    this.project.addTask('destroy:feature', {
      exec: `cdk destroy ${stackId}`,
    });
    this.project.addTask('watch:feature', {
      exec: `cdk deploy --outputs-file cdk-outputs-feature.json --watch --hotswap ${stackId}`,
    });
  }

  /**
   * This method sets up tasks for the general pipeline stages (dev, prod), including deployment and comparing changes (diff).
   * @param {DeployStageOptions} stage - The stage to create
   */
  protected createPipelineStage(stage: DeploymentStage) {
    const stackId = this.getCliStackPattern(stage.name);
    this.project.addTask(`deploy:${stage.name}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} --outputs-file cdk-outputs-${stage.name}.json --progress events --require-approval never deploy ${stackId}`,
    });
    this.project.addTask(`diff:${stage.name}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} diff ${stackId}`,
    });
    this.project.addTask(`fastdiff:${stage.name}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} diff --no-changeset ${stackId}`,
    });
    if (stage.watchable) {
      this.project.addTask(`watch:${stage.name}`, {
        exec: `cdk deploy --outputs-file cdk-outputs-${stage.name}.json --watch --hotswap ${stackId}`,
      });
    }
    // Add version fetch task if versioning is enabled
    if (this.baseOptions.versioning?.enabled) {
      this.createVersionFetchTask(stage);
    }
  }

  /**
   * This method sets up tasks for the independent stages including deployment and comparing changes (diff).
   * @param {NamedStageOptions} stage - The stage to create
   */
  protected createIndependentStage(stage: IndependentStage) {
    const stackId = this.getCliStackPattern(stage.name);
    this.project.addTask(`deploy:${stage.name}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} --outputs-file cdk-outputs-${stage.name}.json --progress events --require-approval never deploy ${stackId}`,
    });
    this.project.addTask(`diff:${stage.name}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} diff ${stackId}`,
    });
    this.project.addTask(`fastdiff:${stage.name}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} diff --no-changeset ${stackId}`,
    });
    if (stage.watchable) {
      this.project.addTask(`watch:${stage.name}`, {
        exec: `cdk deploy --outputs-file cdk-outputs-${stage.name}.json --watch --hotswap ${stackId}`,
      });
    }
    // Add version fetch task if versioning is enabled
    if (this.baseOptions.versioning?.enabled) {
      this.createVersionFetchTask(stage);
    }
  }

  protected getCliStackPattern(stage: string) {
    let sep = '-';
    if (this.stackPrefix === '') {
      sep = '';
    }
    return this.baseOptions.deploySubStacks ? `${this.stackPrefix}${sep}${stage} ${this.stackPrefix}${sep}${stage}/*` : `${this.stackPrefix}${sep}${stage}`;
  }

  /**
   * Create version:fetch:<stage> task to fetch version data from deployed stack
   */
  protected createVersionFetchTask(stage: NamedStageOptions): void {
    const stackName = `${this.stackPrefix}${this.stackPrefix ? '-' : ''}${stage.name}`;
    const stageConfig = this.baseOptions.versioning?.stageOverrides?.[stage.name] || this.baseOptions.versioning;

    if (!stageConfig?.outputs) return;

    const commands: string[] = [];

    // Fetch from CloudFormation outputs
    if (stageConfig.outputs.cloudFormation?.enabled) {
      commands.push(
        `echo "Fetching version data from CloudFormation outputs for ${stage.name}..."`,
        `aws cloudformation describe-stacks --stack-name ${stackName} --region ${stage.env.region} --query "Stacks[0].Outputs[?starts_with(OutputKey, 'AppVersion')].{Key:OutputKey,Value:OutputValue}" --output table`,
      );
    }

    // Fetch from SSM Parameter Store
    if (stageConfig.outputs.parameterStore?.enabled) {
      const parameterName = (stageConfig.outputs.parameterStore.parameterName || '/{stackName}/version')
        .replace('{stackName}', stackName)
        .replace('{stageName}', stage.name);

      if ((stageConfig.outputs.parameterStore as any)?.hierarchical) {
        commands.push(
          `echo "Fetching version data from SSM Parameter Store (hierarchical) for ${stage.name}..."`,
          `aws ssm get-parameters-by-path --path "${parameterName}" --region ${stage.env.region} --recursive --query "Parameters[].{Name:Name,Value:Value}" --output table`,
        );
      } else {
        commands.push(
          `echo "Fetching version data from SSM Parameter Store for ${stage.name}..."`,
          `aws ssm get-parameter --name "${parameterName}" --region ${stage.env.region} --query "Parameter.{Name:Name,Value:Value}" --output table`,
        );
      }
    }

    if (commands.length > 0) {
      this.project.addTask(`version:fetch:${stage.name}`, {
        description: `Fetch version data from deployed ${stage.name} stack`,
        exec: commands.join(' && '),
      });
    }
  }

  /**
   * Generate CDK application code for versioning
   */
  public generateVersioningAppCode(config: VersioningConfig): string {
    return `
    // Apply versioning to all stacks
    this.node.children.forEach((child) => {
      if (child instanceof Stack) {
        const stageName = child.stackName.split('-').pop() || 'default';
        addVersioningToStack(child, stageName, ${config.stageOverrides ? 'versioningConfig.stageOverrides' : 'undefined'});
      }
    });`;
  }

  /**
   * Generate versioning imports for CDK application
   */
  public generateVersioningImports(): string {
    const imports: string[] = [];

    imports.push("import { CfnOutput } from 'aws-cdk-lib';");
    imports.push("import { StringParameter } from 'aws-cdk-lib/aws-ssm';");
    imports.push("import * as fs from 'fs';");

    return imports.join('\n');
  }

  /**
   * Generate versioning utility functions for CDK application
   */
  public generateVersioningUtilities(config: VersioningConfig): string {
    return `
/**
 * Version information interface
 */
export interface VersionInfo {
  version: string;
  commitHash: string;
  commitHashShort: string;
  branch: string;
  commitCount: number;
  packageVersion: string;
  deployedAt: string;
  deployedBy: string;
  environment: string;
}

/**
 * Load version information from generated file
 */
export function loadVersionInfo(): VersionInfo {
  try {
    return JSON.parse(fs.readFileSync('~version.json', 'utf8'));
  } catch (error) {
    console.warn('Could not load version info, using fallback');
    return {
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
  }
}

/**
 * Get versioning configuration for a specific stage
 */
function getStageConfig(stageName: string, baseConfig: any, stageOverrides?: Record<string, any>): any {
  if (!stageOverrides || !stageOverrides[stageName]) {
    return baseConfig;
  }
  
  // Merge stage override with base config
  const override = stageOverrides[stageName];
  return {
    ...baseConfig,
    outputs: {
      cloudFormation: override.outputs?.cloudFormation || baseConfig.outputs.cloudFormation,
      parameterStore: override.outputs?.parameterStore || baseConfig.outputs.parameterStore,
    }
  };
}

/**
 * Add versioning outputs to a stack
 */
function addVersioningToStack(stack: Stack, stageName: string, stageOverrides?: any): void {
  const versionInfo = loadVersionInfo();
  const baseConfig = ${JSON.stringify(config)};
  const config = getStageConfig(stageName, baseConfig, stageOverrides);
  
  // Check if format is specified in CloudFormation or ParameterStore configs
  const cfFormat = config.outputs.cloudFormation?.format || 'structured';
  const ssmFormat = config.outputs.parameterStore?.format || 'structured';
  
  // Add CloudFormation outputs
  if (config.outputs.cloudFormation?.enabled) {
    if (cfFormat === 'plain') {
      // Plain format - single output with version string
      new CfnOutput(stack, 'AppVersion', {
        value: versionInfo.version,
        description: 'Application version',
        exportName: config.outputs.cloudFormation.exportName,
      });
    } else {
      // Structured format - multiple outputs
      new CfnOutput(stack, 'AppVersion', {
        value: versionInfo.version,
        description: 'Application version',
        exportName: config.outputs.cloudFormation.exportName,
      });
      
      new CfnOutput(stack, 'AppVersionCommitHash', {
        value: versionInfo.commitHash,
        description: 'Git commit hash',
        exportName: config.outputs.cloudFormation.exportName ? \`\${config.outputs.cloudFormation.exportName}CommitHash\` : undefined,
      });
      
      new CfnOutput(stack, 'AppVersionBranch', {
        value: versionInfo.branch,
        description: 'Git branch',
        exportName: config.outputs.cloudFormation.exportName ? \`\${config.outputs.cloudFormation.exportName}Branch\` : undefined,
      });

      new CfnOutput(stack, 'AppVersionInfo', {
        value: JSON.stringify(versionInfo),
        description: 'Complete version information',
        exportName: config.outputs.cloudFormation.exportName ? \`\${config.outputs.cloudFormation.exportName}Info\` : undefined,
      });
    }
  }
  
  // Add SSM Parameter Store parameters
  if (config.outputs.parameterStore?.enabled) {
    if (config.outputs.parameterStore.hierarchical) {
      // Hierarchical parameters
      const baseParameterName = (config.outputs.parameterStore.parameterName || '/{stackName}/version')
        .replace('{stackName}', stack.stackName)
        .replace('{stageName}', stageName);
        
      // Create hierarchical parameters
      new StringParameter(stack, 'VersionParameterVersion', {
        parameterName: \`\${baseParameterName}/version\`,
        stringValue: versionInfo.version,
        description: 'Application version',
      });
      
      new StringParameter(stack, 'VersionParameterCommitHash', {
        parameterName: \`\${baseParameterName}/commitHash\`,
        stringValue: versionInfo.commitHash,
        description: 'Git commit hash',
      });
      
      new StringParameter(stack, 'VersionParameterBranch', {
        parameterName: \`\${baseParameterName}/branch\`,
        stringValue: versionInfo.branch,
        description: 'Git branch',
      });
      
      new StringParameter(stack, 'VersionParameterInfo', {
        parameterName: \`\${baseParameterName}/info\`,
        stringValue: JSON.stringify(versionInfo),
        description: 'Complete version information',
      });
    } else {
      // Single parameter
      const parameterName = (config.outputs.parameterStore.parameterName || '/{stackName}/version')
        .replace('{stackName}', stack.stackName)
        .replace('{stageName}', stageName);
        
      new StringParameter(stack, 'VersionParameter', {
        parameterName,
        stringValue: ssmFormat === 'plain' ? versionInfo.version : JSON.stringify(versionInfo),
        description: ssmFormat === 'plain' ? 'Application version' : 'Complete version information',
      });
    }
  }
}`;
  }
}
