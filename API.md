# Projen Pipelines

[![npm version](https://badge.fury.io/js/projen-pipelines.svg)](https://www.npmjs.com/package/projen-pipelines)


Projen Pipelines is a projen library that provides high-level abstractions for defining continuous delivery (CD) pipelines for AWS CDK applications.
It is specifically designed to work with the projen project configuration engine.

This library provides high-level abstractions for defining multi-environment and multi-account AWS CDK applications with ease.
With this library, you can handle complex deployment scenarios with less code and manage your AWS infrastructure in a more efficient and straightforward way.

## Getting Started

### Installation

To install the package, add teh package `projen-pipelines` to your projects devDeps in your projen configuration file.


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

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.CDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

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

## Classes <a name="Classes" id="Classes"></a>

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

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.CDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---



