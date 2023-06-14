import { Component, TextFile, awscdk } from 'projen';
import { PROJEN_MARKER } from 'projen/lib/common';

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

/**
 * The EnvironmentMap interface is used to maintain a mapping of different types
 * of environments used in the application. Each type of environment - personal,
 * feature, dev, and prod, represents a different stage of development or usage.
 */
export interface EnvironmentMap {
  /**
   * The personal environment is usually used for individual development and
   * testing, allowing developers to freely test and experiment without
   * affecting the shared development environment.
   */
  readonly personal: Environment;

  /**
   * The feature environment is typically used for developing specific features
   * in isolation from the main codebase. This allows developers to work on
   * individual features without impacting the stability of the dev or prod
   * environments.
   */
  readonly feature: Environment;

  /**
   * The dev environment is a shared environment where developers integrate
   * their feature changes. It represents the latest version of the application
   * but may not be as stable as the production environment.
   */
  readonly dev: Environment;

  /**
   * The prod environment is where the live, user-facing application runs.
   * It should be stable and only receive thoroughly tested changes.
   */
  readonly prod: Environment;
}

/**
 * The CDKPipelineOptions interface is designed to provide configuration
 * options for a CDK (Cloud Development Kit) pipeline. It allows the definition
 * of settings such as the stack prefix and package namespace to be used in the
 * AWS stack, along with the environments configuration to be used.
 */
export interface CDKPipelineOptions {
  /**
   * This field is used to define a prefix for the AWS Stack resources created
   * during the pipeline's operation.
   */
  readonly stackPrefix: string;

  /**
   * This field determines the NPM namespace to be used when packaging CDK cloud
   * assemblies. A namespace helps group related resources together, providing
   * better organization and ease of management.
   */
  readonly pkgNamespace: string;

  /**
   * This is a map of environments to be used in the pipeline. It allows the
   * pipeline to deploy to different environments based on the stage of the
   * deployment process, whether that's a personal, feature, dev, or prod stage.
   */
  readonly environments: EnvironmentMap;
}

/**
 * The CDKPipeline class extends the Component class and sets up the necessary configuration for deploying AWS CDK (Cloud Development Kit) applications across multiple stages.
 * It also manages tasks such as publishing CDK assets, bumping version based on git tags, and cleaning up conflicting tasks.
 */
export class CDKPipeline extends Component {

  constructor(private app: awscdk.AwsCdkTypeScriptApp, private props: CDKPipelineOptions) {
    super(app);

    // Add development dependencies
    this.app.addDevDeps(
      '@types/standard-version',
      'standard-version',
      'cdk-assets',
    );
    // this.app.addDeps(
    // );

    // Removes the compiled cloud assembly before each synth
    this.project.tasks.tryFind('synth')?.prependExec(`rm -rf ${this.app.cdkConfig.cdkout}`);
    this.project.tasks.tryFind('synth:silent')?.prependExec(`rm -rf ${this.app.cdkConfig.cdkout}`);

    // Remove tasks that might conflict with the pipeline process
    this.project.removeTask('deploy');
    this.project.removeTask('diff');
    this.project.removeTask('destroy');
    this.project.removeTask('watch');

    // Creates different deployment stages
    this.createPersonalStage();
    this.createFeatureStage();
    this.createPipelineStage('dev');
    this.createPipelineStage('prod');

    // Creates tasks to handle the release process
    this.createReleaseTasks();

    // Creates a specialized CDK App class
    this.createApplicationEntrypoint();
  }

  /**
   * This method generates the entry point for the application, including interfaces and classes
   * necessary to set up the pipeline and define the AWS CDK stacks for different environments.
   */
  private createApplicationEntrypoint() {
    const appFile = new TextFile(this.project, `${this.app.srcdir}/app.ts`);
    appFile.addLine(`// ${PROJEN_MARKER}
/* eslint-disable object-curly-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable quotes */
/* eslint-disable key-spacing */
/* eslint-disable quote-props */
import { App, AppProps, Stack, StackProps } from 'aws-cdk-lib';

/**
 * PipelineAppProps is an extension of AppProps, which is part of the AWS CDK core.
 * It includes optional functions to provide AWS Stacks for different stages.
 * 
 * Use these functions to instantiate your application stacks with the parameters for
 * each stage
 */
export interface PipelineAppProps extends AppProps {
  /** This optional function, if provided, will be used to generate a development stack. */
  provideDevStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;

  /** This optional function, if provided, will be used to generate a production stack. */
  provideProdStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;

  /** This optional function, if provided, will be used to generate a personal stack. */
  providePersonalStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;

  /** This optional function, if provided, will be used to generate a feature stack. */
  provideFeatureStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
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

    // If a function is provided for creating a development stack, it is called with necessary arguments.
    if (props.provideDevStack) {
      props.provideDevStack(this, '${this.props.stackPrefix}-dev', { env: ${JSON.stringify(this.props.environments.dev)}, stackName: '${this.props.stackPrefix}-dev', stageName: 'dev' });
    }

    // If a function is provided for creating a production stack, it is called with necessary arguments.
    if (props.provideProdStack) {
      props.provideProdStack(this, '${this.props.stackPrefix}-prod', { env: ${JSON.stringify(this.props.environments.prod)}, stackName: '${this.props.stackPrefix}-prod', stageName: 'prod' });
    }

    // If the environment variable USER is set and a function is provided for creating a personal stack, it is called with necessary arguments.
    if (props.providePersonalStack && process.env.USER) {
      const stageName = 'personal-' + process.env.USER.toLowerCase().replace(/\\\//g, '-');
      props.providePersonalStack(this, '${this.props.stackPrefix}-personal', { env: ${JSON.stringify(this.props.environments.personal)}, stackName: \`${this.props.stackPrefix}-\${stageName}\`, stageName });
    }

    // If the environment variable BRANCH is set and a function is provided for creating a feature stack, it is called with necessary arguments.
    if (props.provideFeatureStack && process.env.BRANCH) {
      const stageName = 'feature-' + process.env.BRANCH.toLowerCase().replace(/\\\//g, '-');
      props.provideFeatureStack(this, '${this.props.stackPrefix}-feature', { env: ${JSON.stringify(this.props.environments.feature)}, stackName: \`${this.props.stackPrefix}-\${stageName}\`, stageName });
    }
  }
}
`);
  }

  /**
   * This method sets up tasks to publish CDK assets to all accounts and handle versioning, including bumping the version
   * based on the latest git tag and pushing the CDK assembly to the package repository.
   */
  private createReleaseTasks() {
    // Task to publish the CDK assets to all accounts
    this.project.addTask('publish:assets', {
      steps: [
        {
          exec: `npx cdk-assets -p ${this.app.cdkConfig.cdkout}/${this.props.stackPrefix}-dev.assets.json publish`,
        },
        {
          exec: `npx cdk-assets -p ${this.app.cdkConfig.cdkout}/${this.props.stackPrefix}-prod.assets.json publish`,
        },
      ],
    });

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
          exec: `pipelines-release create-manifest "${this.app.cdkConfig.cdkout}"  "${this.props.pkgNamespace}"`,
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

  /**
   * This method sets up tasks for the personal deployment stage, including deployment, watching for changes,
   * comparing changes (diff), and destroying the stack when no longer needed.
   */
  private createPersonalStage() {
    this.project.addTask('deploy:personal', {
      exec: `cdk deploy ${this.props.stackPrefix}-personal`,
    });
    this.project.addTask('watch:personal', {
      exec: `cdk deploy --watch --hotswap ${this.props.stackPrefix}-personal`,
    });
    this.project.addTask('diff:personal', {
      exec: `cdk diff ${this.props.stackPrefix}-personal`,
    });
    this.project.addTask('destroy:personal', {
      exec: `cdk destroy ${this.props.stackPrefix}-personal`,
    });
  }

  /**
   * This method sets up tasks for the feature deployment stage, including deployment, comparing changes (diff),
   * and destroying the stack when no longer needed.
   */
  private createFeatureStage() {
    this.project.addTask('deploy:feature', {
      exec: `cdk --progress events --require-approval never deploy ${this.props.stackPrefix}-feature`,
    });
    this.project.addTask('diff:feature', {
      exec: `cdk diff ${this.props.stackPrefix}-feature`,
    });
    this.project.addTask('destroy:feature', {
      exec: `cdk destroy ${this.props.stackPrefix}-feature`,
    });
  }

  /**
   * This method sets up tasks for the general pipeline stages (dev, prod), including deployment and comparing changes (diff).
   * @param {string} stageName - The name of the stage (e.g., 'dev', 'prod')
   */
  private createPipelineStage(stageName: string) {
    this.project.addTask(`deploy:${stageName}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} --progress events --require-approval never deploy ${this.props.stackPrefix}-${stageName}`,
    });
    this.project.addTask(`diff:${stageName}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} diff ${this.props.stackPrefix}-${stageName}`,
    });
  }
}