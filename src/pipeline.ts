import { Component, TextFile, awscdk } from 'projen';
import { PROJEN_MARKER } from 'projen/lib/common';

export interface Environment {
  readonly account: string;
  readonly region: string;
}

export interface EnvironmentMap {
  readonly personal: Environment;
  readonly feature: Environment;
  readonly dev: Environment;
  readonly prod: Environment;
}

export interface CDKPipelineOptions {
  readonly stackPrefix: string;
  readonly pkgNamespace: string;
  readonly environments: EnvironmentMap;
}

export class CDKPipeline extends Component {

  constructor(private app: awscdk.AwsCdkTypeScriptApp, private props: CDKPipelineOptions) {
    super(app);

    this.app.addDevDeps(
      '@types/standard-version',
      'standard-version',
      'cdk-assets',
    );
    // this.app.addDeps(
    // );

    // Remove assembly before synth
    this.project.tasks.tryFind('synth')?.prependExec(`rm -rf ${this.app.cdkConfig.cdkout}`);
    this.project.tasks.tryFind('synth:silent')?.prependExec(`rm -rf ${this.app.cdkConfig.cdkout}`);

    // Remove conflicting tasks
    this.project.removeTask('deploy');
    this.project.removeTask('diff');
    this.project.removeTask('destroy');
    this.project.removeTask('watch');

    this.createPersonalStage();

    this.createFeatureStage();

    this.createPipelineStage('dev');
    this.createPipelineStage('prod');

    this.createReleaseTasks();

    this.createApplicationEntrypoint();
  }

  private createApplicationEntrypoint() {
    const appFile = new TextFile(this.project, `${this.app.srcdir}/app.ts`);
    appFile.addLine(`// ${PROJEN_MARKER}
/* eslint-disable object-curly-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable quotes */
/* eslint-disable key-spacing */
/* eslint-disable quote-props */
import { App, AppProps, Stack, StackProps } from 'aws-cdk-lib';

export interface PipelineAppProps extends AppProps {
  provideDevStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
  provideProdStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
  providePersonalStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
  provideFeatureStack?: (app: App, stackId: string, props: PipelineAppStackProps) => Stack;
}

export interface PipelineAppStackProps extends StackProps {
  stageName: string;
}

export class PipelineApp extends App {
  constructor(props: PipelineAppProps) {
    super(props);

    if (props.provideDevStack) {
      props.provideDevStack(this, '${this.props.stackPrefix}-dev', { env: ${JSON.stringify(this.props.environments.dev)}, stackName: '${this.props.stackPrefix}-dev', stageName: 'dev' });
    }
    if (props.provideProdStack) {
      props.provideProdStack(this, '${this.props.stackPrefix}-prod', { env: ${JSON.stringify(this.props.environments.prod)}, stackName: '${this.props.stackPrefix}-prod', stageName: 'prod' });
    }
    if (props.providePersonalStack && process.env.USER) {
      const stageName = 'personal-' + process.env.USER.toLowerCase().replace(/\\\//g, '-');
      props.providePersonalStack(this, '${this.props.stackPrefix}-personal', { env: ${JSON.stringify(this.props.environments.personal)}, stackName: \`${this.props.stackPrefix}-\${stageName}\`, stageName });
    }
    if (props.provideFeatureStack && process.env.BRANCH) {
      const stageName = 'feature-' + process.env.BRANCH.toLowerCase().replace(/\\\//g, '-');
      props.provideFeatureStack(this, '${this.props.stackPrefix}-feature', { env: ${JSON.stringify(this.props.environments.feature)}, stackName: \`${this.props.stackPrefix}-\${stageName}\`, stageName });
    }
  }
}
`);
  }

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

  private createPipelineStage(stageName: string) {
    this.project.addTask(`deploy:${stageName}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} --progress events --require-approval never deploy ${this.props.stackPrefix}-${stageName}`,
    });
    this.project.addTask(`diff:${stageName}`, {
      exec: `cdk --app ${this.app.cdkConfig.cdkout} diff ${this.props.stackPrefix}-${stageName}`,
    });
  }
}