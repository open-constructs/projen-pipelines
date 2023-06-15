# Projen Pipelines

[![npm version](https://badge.fury.io/js/projen-pipelines.svg)](https://www.npmjs.com/package/projen-pipelines)


Projen Pipelines is a projen library that provides high-level abstractions for defining continuous delivery (CD) pipelines for AWS CDK applications.
It is specifically designed to work with the projen project configuration engine.

This library provides high-level abstractions for defining multi-environment and multi-account AWS CDK applications with ease.
With this library, you can handle complex deployment scenarios with less code and manage your AWS infrastructure in a more efficient and straightforward way.

## Getting Started

### Installation

To install the package, add the package `projen-pipelines` to your projects devDeps in your projen configuration file.


After installing the package, you can import and use the constructs to define your CDK Pipelines.

### Usage

You can start using the constructs provided by Projen Pipelines in your AWS CDK applications. Here's a brief example:

```typescript
import { awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions } from 'projen-pipelines';

// Define your AWS CDK TypeScript App
const app = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.80.0',
  name: 'my-awesome-app',
  defaultReleaseBranch: 'main',
  devDeps: [
    'projen-pipelines',
  ],
});

// Create the pipeline
new CDKPipeline(app, {
  stackPrefix: 'MyApp',
  pkgNamespace: '@company-assemblies',
  environments: {
    dev: { account: '111111111111', region: 'eu-central-1' },
    prod: { account: '222222222222', region: 'eu-central-1' },
  },
});
```

After running projen (`npx projen`) a new file called `src/app.ts` will be created and contain a specialized CDK App class for your project.

You can then use this in your `main.ts` to configure your deployment.

```typescript
import { PipelineApp } from './app';
import { BackendStack } from './stack';

const app = new PipelineApp({
  provideDevStack: (scope, id, props) => {
    return new BackendStack(scope, id, {
      ...props,
      apiHostname: 'api-dev',
      myConfigSetting: 'value-for-dev',
    });
  },
  provideProdStack: (scope, id, props) => {
    return new BackendStack(scope, id, {
      ...props,
      apiHostname: 'api',
      myConfigSetting: 'value-for-prod',
    });
  },
  providePersonalStack: (scope, id, props) => {
    return new BackendStack(scope, id, {
      ...props,
      apiHostname: `api-${props.stageName}`,
      myConfigSetting: 'value-for-personal-stage',
    });
  },
});

app.synth();
```

### Deployment

The `CDKPipeline` class creates and adds several tasks to the projen project that then can be used in your pipeline to deploy your application to AWS.

Here's a brief description of each one:

1. **deploy:personal** - This task deploys the application's personal stage, which is a distinct, isolated deployment of the application. The personal stage is intended for personal use, such as testing and development.

2. **watch:personal** - This task deploys the personal stage of the application in watch mode. In this mode, the AWS CDK monitors your application source files for changes, automatically re-synthesizing and deploying when it detects any changes.

3. **diff:personal** - This task compares the deployed personal stage with the current state of the application code. It's used to understand what changes would be made if the application were deployed.

4. **destroy:personal** - This task destroys the resources created for the personal stage of the application.

5. **deploy:feature** - This task deploys the application's feature stage. The feature stage is used for new features testing before these are merged into the main branch.

6. **diff:feature** - This task is similar to `diff:personal`, but for the feature stage.

7. **destroy:feature** - This task destroys the resources created for the feature stage of the application.

8. **deploy:<stageName>** - This task deploys a specific stage of the application (like 'dev' or 'prod').

9. **diff:<stageName>** - This task compares the specified application stage with the current state of the application code.

10. **publish:assets** - This task publishes the CDK assets to all accounts. This is useful when the CDK application uses assets like Docker images or files from the S3 bucket.

11. **bump** - This task bumps the version based on the latest git tag and pushes the updated tag to the git repository.

12. **release:push-assembly** - This task creates a manifest, bumps the version without creating a git tag, and publishes the cloud assembly to your registry.

Remember that these tasks are created and managed automatically by the `CDKPipeline` class. You can run these tasks using the `npx projen TASK_NAME` command.


## Contributing

We welcome all contributions to Projen Pipelines! Here's how you can get started:

1. **Fork the Repository**: Click the 'Fork' button at the top right of this page to duplicate this repository in your GitHub account.

2. **Clone your Fork**: Clone the forked repository to your local machine.

```bash
git clone https://github.com/<your_username>/projen-pipelines.git
```

3. **Create a Branch**: To keep your work organized, create a branch for your contribution.

```bash
git checkout -b my-branch
```

4. **Make your Changes**: Make your changes, additions, or fixes to the codebase. Remember to follow the existing code style.

5. **Test your Changes**: Before committing your changes, make sure to test them to ensure they work as expected and do not introduce bugs.

6. **Commit your Changes**: Commit your changes with a descriptive commit message using conventional commit messages.

```bash
git commit -m "feat: Your descriptive commit message"
```

7. **Push to your Fork**: Push your commits to the branch in your forked repository.

```bash
git push origin my-branch
```

8. **Submit a Pull Request**: Once your changes are ready to be reviewed, create a pull request from your forked repository's branch into the `main` branch of this repository.

Your pull request will be reviewed and hopefully merged quickly. Thanks for contributing!

# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### AssetUploadStageOptions <a name="AssetUploadStageOptions" id="projen-pipelines.AssetUploadStageOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.AssetUploadStageOptions.Initializer"></a>

```typescript
import { AssetUploadStageOptions } from 'projen-pipelines'

const assetUploadStageOptions: AssetUploadStageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.AssetUploadStageOptions.property.commands">commands</a></code> | <code>string[]</code> | *No description.* |

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.AssetUploadStageOptions.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

---

### CDKPipelineOptions <a name="CDKPipelineOptions" id="projen-pipelines.CDKPipelineOptions"></a>

The CDKPipelineOptions interface is designed to provide configuration options for a CDK (Cloud Development Kit) pipeline.

It allows the definition
of settings such as the stack prefix and package namespace to be used in the
AWS stack, along with the environments configuration to be used.

#### Initializer <a name="Initializer" id="projen-pipelines.CDKPipelineOptions.Initializer"></a>

```typescript
import { CDKPipelineOptions } from 'projen-pipelines'

const cDKPipelineOptions: CDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.environments">environments</a></code> | <code><a href="#projen-pipelines.EnvironmentMap">EnvironmentMap</a></code> | This is a map of environments to be used in the pipeline. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.deploymentType">deploymentType</a></code> | <code><a href="#projen-pipelines.DeploymentType">DeploymentType</a></code> | This field specifies the type of pipeline to create. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.engine">engine</a></code> | <code><a href="#projen-pipelines.PipelineEngine">PipelineEngine</a></code> | This field determines the CI/CD tooling that will be used to run the pipeline. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.githubConfig">githubConfig</a></code> | <code><a href="#projen-pipelines.GithubEngineConfig">GithubEngineConfig</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |

---

##### `environments`<sup>Required</sup> <a name="environments" id="projen-pipelines.CDKPipelineOptions.property.environments"></a>

```typescript
public readonly environments: EnvironmentMap;
```

- *Type:* <a href="#projen-pipelines.EnvironmentMap">EnvironmentMap</a>

This is a map of environments to be used in the pipeline.

It allows the
pipeline to deploy to different environments based on the stage of the
deployment process, whether that's a personal, feature, dev, or prod stage.

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="projen-pipelines.CDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

---

##### `deploymentType`<sup>Optional</sup> <a name="deploymentType" id="projen-pipelines.CDKPipelineOptions.property.deploymentType"></a>

```typescript
public readonly deploymentType: DeploymentType;
```

- *Type:* <a href="#projen-pipelines.DeploymentType">DeploymentType</a>
- *Default:* CONTINUOUS_DELIVERY

This field specifies the type of pipeline to create.

If set to CONTINUOUS_DEPLOYMENT,
every commit is deployed as far as possible, hopefully into production. If set to
CONTINUOUS_DELIVERY, every commit is built and all assets are prepared for a later deployment.

---

##### `engine`<sup>Optional</sup> <a name="engine" id="projen-pipelines.CDKPipelineOptions.property.engine"></a>

```typescript
public readonly engine: PipelineEngine;
```

- *Type:* <a href="#projen-pipelines.PipelineEngine">PipelineEngine</a>
- *Default:* tries to derive it from the projects configuration

This field determines the CI/CD tooling that will be used to run the pipeline.

The component
will render workflows for the given system. Options include GitHub and GitLab.

---

##### `githubConfig`<sup>Optional</sup> <a name="githubConfig" id="projen-pipelines.CDKPipelineOptions.property.githubConfig"></a>

```typescript
public readonly githubConfig: GithubEngineConfig;
```

- *Type:* <a href="#projen-pipelines.GithubEngineConfig">GithubEngineConfig</a>

---

##### `postSynthCommands`<sup>Optional</sup> <a name="postSynthCommands" id="projen-pipelines.CDKPipelineOptions.property.postSynthCommands"></a>

```typescript
public readonly postSynthCommands: string[];
```

- *Type:* string[]

---

##### `preInstallCommands`<sup>Optional</sup> <a name="preInstallCommands" id="projen-pipelines.CDKPipelineOptions.property.preInstallCommands"></a>

```typescript
public readonly preInstallCommands: string[];
```

- *Type:* string[]

---

##### `preSynthCommands`<sup>Optional</sup> <a name="preSynthCommands" id="projen-pipelines.CDKPipelineOptions.property.preSynthCommands"></a>

```typescript
public readonly preSynthCommands: string[];
```

- *Type:* string[]

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="projen-pipelines.CDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string
- *Default:* project name

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

---

### DeployStageOptions <a name="DeployStageOptions" id="projen-pipelines.DeployStageOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.DeployStageOptions.Initializer"></a>

```typescript
import { DeployStageOptions } from 'projen-pipelines'

const deployStageOptions: DeployStageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.DeployStageOptions.property.commands">commands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.DeployStageOptions.property.env">env</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.DeployStageOptions.property.stageName">stageName</a></code> | <code>string</code> | *No description.* |

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.DeployStageOptions.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.DeployStageOptions.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

---

##### `stageName`<sup>Required</sup> <a name="stageName" id="projen-pipelines.DeployStageOptions.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

---

### Environment <a name="Environment" id="projen-pipelines.Environment"></a>

The Environment interface is designed to hold AWS related information for a specific deployment environment within your infrastructure.

Each environment requires a specific account and region for its resources.

#### Initializer <a name="Initializer" id="projen-pipelines.Environment.Initializer"></a>

```typescript
import { Environment } from 'projen-pipelines'

const environment: Environment = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.Environment.property.account">account</a></code> | <code>string</code> | The AWS Account ID associated with the environment. |
| <code><a href="#projen-pipelines.Environment.property.region">region</a></code> | <code>string</code> | The AWS Region for the environment. |

---

##### `account`<sup>Required</sup> <a name="account" id="projen-pipelines.Environment.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS Account ID associated with the environment.

It's important because
different services or features could have distinct permissions and settings
in different accounts.

---

##### `region`<sup>Required</sup> <a name="region" id="projen-pipelines.Environment.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS Region for the environment.

This determines where your resources
are created and where your application will run. It can affect latency,
availability, and pricing.

---

### EnvironmentMap <a name="EnvironmentMap" id="projen-pipelines.EnvironmentMap"></a>

The EnvironmentMap interface is used to maintain a mapping of different types of environments used in the application.

Each type of environment - personal,
feature, dev, and prod, represents a different stage of development or usage.

#### Initializer <a name="Initializer" id="projen-pipelines.EnvironmentMap.Initializer"></a>

```typescript
import { EnvironmentMap } from 'projen-pipelines'

const environmentMap: EnvironmentMap = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.EnvironmentMap.property.dev">dev</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The dev environment is a shared environment where developers integrate their feature changes. |
| <code><a href="#projen-pipelines.EnvironmentMap.property.feature">feature</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The feature environment is typically used for developing specific features in isolation from the main codebase. |
| <code><a href="#projen-pipelines.EnvironmentMap.property.personal">personal</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The personal environment is usually used for individual development and testing, allowing developers to freely test and experiment without affecting the shared development environment. |
| <code><a href="#projen-pipelines.EnvironmentMap.property.prod">prod</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The prod environment is where the live, user-facing application runs. |

---

##### `dev`<sup>Required</sup> <a name="dev" id="projen-pipelines.EnvironmentMap.property.dev"></a>

```typescript
public readonly dev: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The dev environment is a shared environment where developers integrate their feature changes.

It represents the latest version of the application
but may not be as stable as the production environment.

---

##### `feature`<sup>Required</sup> <a name="feature" id="projen-pipelines.EnvironmentMap.property.feature"></a>

```typescript
public readonly feature: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The feature environment is typically used for developing specific features in isolation from the main codebase.

This allows developers to work on
individual features without impacting the stability of the dev or prod
environments.

---

##### `personal`<sup>Required</sup> <a name="personal" id="projen-pipelines.EnvironmentMap.property.personal"></a>

```typescript
public readonly personal: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The personal environment is usually used for individual development and testing, allowing developers to freely test and experiment without affecting the shared development environment.

---

##### `prod`<sup>Required</sup> <a name="prod" id="projen-pipelines.EnvironmentMap.property.prod"></a>

```typescript
public readonly prod: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The prod environment is where the live, user-facing application runs.

It should be stable and only receive thoroughly tested changes.

---

### GithubEngineConfig <a name="GithubEngineConfig" id="projen-pipelines.GithubEngineConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.GithubEngineConfig.Initializer"></a>

```typescript
import { GithubEngineConfig } from 'projen-pipelines'

const githubEngineConfig: GithubEngineConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubEngineConfig.property.awsRoleArnForAssetPublishing">awsRoleArnForAssetPublishing</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubEngineConfig.property.awsRoleArnForDeployment">awsRoleArnForDeployment</a></code> | <code><a href="#projen-pipelines.RoleMap">RoleMap</a></code> | *No description.* |
| <code><a href="#projen-pipelines.GithubEngineConfig.property.awsRoleArnForSynth">awsRoleArnForSynth</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubEngineConfig.property.defaultAwsRoleArn">defaultAwsRoleArn</a></code> | <code>string</code> | *No description.* |

---

##### `awsRoleArnForAssetPublishing`<sup>Optional</sup> <a name="awsRoleArnForAssetPublishing" id="projen-pipelines.GithubEngineConfig.property.awsRoleArnForAssetPublishing"></a>

```typescript
public readonly awsRoleArnForAssetPublishing: string;
```

- *Type:* string

---

##### `awsRoleArnForDeployment`<sup>Optional</sup> <a name="awsRoleArnForDeployment" id="projen-pipelines.GithubEngineConfig.property.awsRoleArnForDeployment"></a>

```typescript
public readonly awsRoleArnForDeployment: RoleMap;
```

- *Type:* <a href="#projen-pipelines.RoleMap">RoleMap</a>

---

##### `awsRoleArnForSynth`<sup>Optional</sup> <a name="awsRoleArnForSynth" id="projen-pipelines.GithubEngineConfig.property.awsRoleArnForSynth"></a>

```typescript
public readonly awsRoleArnForSynth: string;
```

- *Type:* string

---

##### `defaultAwsRoleArn`<sup>Optional</sup> <a name="defaultAwsRoleArn" id="projen-pipelines.GithubEngineConfig.property.defaultAwsRoleArn"></a>

```typescript
public readonly defaultAwsRoleArn: string;
```

- *Type:* string

---

### RoleMap <a name="RoleMap" id="projen-pipelines.RoleMap"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.RoleMap.Initializer"></a>

```typescript
import { RoleMap } from 'projen-pipelines'

const roleMap: RoleMap = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.RoleMap.property.dev">dev</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.RoleMap.property.feature">feature</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.RoleMap.property.prod">prod</a></code> | <code>string</code> | *No description.* |

---

##### `dev`<sup>Optional</sup> <a name="dev" id="projen-pipelines.RoleMap.property.dev"></a>

```typescript
public readonly dev: string;
```

- *Type:* string

---

##### `feature`<sup>Optional</sup> <a name="feature" id="projen-pipelines.RoleMap.property.feature"></a>

```typescript
public readonly feature: string;
```

- *Type:* string

---

##### `prod`<sup>Optional</sup> <a name="prod" id="projen-pipelines.RoleMap.property.prod"></a>

```typescript
public readonly prod: string;
```

- *Type:* string

---

### SynthStageOptions <a name="SynthStageOptions" id="projen-pipelines.SynthStageOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.SynthStageOptions.Initializer"></a>

```typescript
import { SynthStageOptions } from 'projen-pipelines'

const synthStageOptions: SynthStageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.SynthStageOptions.property.commands">commands</a></code> | <code>string[]</code> | *No description.* |

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.SynthStageOptions.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

---

## Classes <a name="Classes" id="Classes"></a>

### BaseEngine <a name="BaseEngine" id="projen-pipelines.BaseEngine"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.BaseEngine.Initializer"></a>

```typescript
import { BaseEngine } from 'projen-pipelines'

new BaseEngine(app: AwsCdkTypeScriptApp, props: CDKPipelineOptions, pipeline: CDKPipeline)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.BaseEngine.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.BaseEngine.Initializer.parameter.props">props</a></code> | <code><a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a></code> | *No description.* |
| <code><a href="#projen-pipelines.BaseEngine.Initializer.parameter.pipeline">pipeline</a></code> | <code><a href="#projen-pipelines.CDKPipeline">CDKPipeline</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.BaseEngine.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `props`<sup>Required</sup> <a name="props" id="projen-pipelines.BaseEngine.Initializer.parameter.props"></a>

- *Type:* <a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a>

---

##### `pipeline`<sup>Required</sup> <a name="pipeline" id="projen-pipelines.BaseEngine.Initializer.parameter.pipeline"></a>

- *Type:* <a href="#projen-pipelines.CDKPipeline">CDKPipeline</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.BaseEngine.createAssetUpload">createAssetUpload</a></code> | *No description.* |
| <code><a href="#projen-pipelines.BaseEngine.createDeployment">createDeployment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.BaseEngine.createSynth">createSynth</a></code> | *No description.* |

---

##### `createAssetUpload` <a name="createAssetUpload" id="projen-pipelines.BaseEngine.createAssetUpload"></a>

```typescript
public createAssetUpload(options: AssetUploadStageOptions): void
```

###### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.BaseEngine.createAssetUpload.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.AssetUploadStageOptions">AssetUploadStageOptions</a>

---

##### `createDeployment` <a name="createDeployment" id="projen-pipelines.BaseEngine.createDeployment"></a>

```typescript
public createDeployment(options: DeployStageOptions): void
```

###### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.BaseEngine.createDeployment.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.DeployStageOptions">DeployStageOptions</a>

---

##### `createSynth` <a name="createSynth" id="projen-pipelines.BaseEngine.createSynth"></a>

```typescript
public createSynth(options: SynthStageOptions): void
```

###### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.BaseEngine.createSynth.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.SynthStageOptions">SynthStageOptions</a>

---




### CDKPipeline <a name="CDKPipeline" id="projen-pipelines.CDKPipeline"></a>

The CDKPipeline class extends the Component class and sets up the necessary configuration for deploying AWS CDK (Cloud Development Kit) applications across multiple stages.

It also manages tasks such as publishing CDK assets, bumping version based on git tags, and cleaning up conflicting tasks.

#### Initializers <a name="Initializers" id="projen-pipelines.CDKPipeline.Initializer"></a>

```typescript
import { CDKPipeline } from 'projen-pipelines'

new CDKPipeline(app: AwsCdkTypeScriptApp, props: CDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.Initializer.parameter.props">props</a></code> | <code><a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.CDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `props`<sup>Required</sup> <a name="props" id="projen-pipelines.CDKPipeline.Initializer.parameter.props"></a>

- *Type:* <a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.CDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.CDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |

---

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.CDKPipeline.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.CDKPipeline.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.CDKPipeline.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.property.engine">engine</a></code> | <code><a href="#projen-pipelines.BaseEngine">BaseEngine</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.CDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---

##### `engine`<sup>Required</sup> <a name="engine" id="projen-pipelines.CDKPipeline.property.engine"></a>

```typescript
public readonly engine: BaseEngine;
```

- *Type:* <a href="#projen-pipelines.BaseEngine">BaseEngine</a>

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.CDKPipeline.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---


### GitHubEngine <a name="GitHubEngine" id="projen-pipelines.GitHubEngine"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.GitHubEngine.Initializer"></a>

```typescript
import { GitHubEngine } from 'projen-pipelines'

new GitHubEngine(app: AwsCdkTypeScriptApp, props: CDKPipelineOptions, pipeline: CDKPipeline)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitHubEngine.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.GitHubEngine.Initializer.parameter.props">props</a></code> | <code><a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a></code> | *No description.* |
| <code><a href="#projen-pipelines.GitHubEngine.Initializer.parameter.pipeline">pipeline</a></code> | <code><a href="#projen-pipelines.CDKPipeline">CDKPipeline</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.GitHubEngine.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `props`<sup>Required</sup> <a name="props" id="projen-pipelines.GitHubEngine.Initializer.parameter.props"></a>

- *Type:* <a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a>

---

##### `pipeline`<sup>Required</sup> <a name="pipeline" id="projen-pipelines.GitHubEngine.Initializer.parameter.pipeline"></a>

- *Type:* <a href="#projen-pipelines.CDKPipeline">CDKPipeline</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GitHubEngine.createAssetUpload">createAssetUpload</a></code> | *No description.* |
| <code><a href="#projen-pipelines.GitHubEngine.createDeployment">createDeployment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.GitHubEngine.createSynth">createSynth</a></code> | *No description.* |

---

##### `createAssetUpload` <a name="createAssetUpload" id="projen-pipelines.GitHubEngine.createAssetUpload"></a>

```typescript
public createAssetUpload(options: AssetUploadStageOptions): void
```

###### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GitHubEngine.createAssetUpload.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.AssetUploadStageOptions">AssetUploadStageOptions</a>

---

##### `createDeployment` <a name="createDeployment" id="projen-pipelines.GitHubEngine.createDeployment"></a>

```typescript
public createDeployment(options: DeployStageOptions): void
```

###### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GitHubEngine.createDeployment.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.DeployStageOptions">DeployStageOptions</a>

---

##### `createSynth` <a name="createSynth" id="projen-pipelines.GitHubEngine.createSynth"></a>

```typescript
public createSynth(options: SynthStageOptions): void
```

###### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GitHubEngine.createSynth.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.SynthStageOptions">SynthStageOptions</a>

---





## Enums <a name="Enums" id="Enums"></a>

### DeploymentType <a name="DeploymentType" id="projen-pipelines.DeploymentType"></a>

Describes the type of pipeline that will be created.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.DeploymentType.CONTINUOUS_DEPLOYMENT">CONTINUOUS_DEPLOYMENT</a></code> | Deploy every commit as far as possible; |
| <code><a href="#projen-pipelines.DeploymentType.CONTINUOUS_DELIVERY">CONTINUOUS_DELIVERY</a></code> | Build every commit and prepare all assets for a later deployment. |

---

##### `CONTINUOUS_DEPLOYMENT` <a name="CONTINUOUS_DEPLOYMENT" id="projen-pipelines.DeploymentType.CONTINUOUS_DEPLOYMENT"></a>

Deploy every commit as far as possible;

hopefully into production

---


##### `CONTINUOUS_DELIVERY` <a name="CONTINUOUS_DELIVERY" id="projen-pipelines.DeploymentType.CONTINUOUS_DELIVERY"></a>

Build every commit and prepare all assets for a later deployment.

---


### PipelineEngine <a name="PipelineEngine" id="projen-pipelines.PipelineEngine"></a>

The CI/CD tooling used to run your pipeline.

The component will render workflows for the given system

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.PipelineEngine.GITHUB">GITHUB</a></code> | Create GitHub actions. |
| <code><a href="#projen-pipelines.PipelineEngine.GITLAB">GITLAB</a></code> | Create a .gitlab-ci.yaml file. |

---

##### `GITHUB` <a name="GITHUB" id="projen-pipelines.PipelineEngine.GITHUB"></a>

Create GitHub actions.

---


##### `GITLAB` <a name="GITLAB" id="projen-pipelines.PipelineEngine.GITLAB"></a>

Create a .gitlab-ci.yaml file.

---

