# Projen Pipelines

[![npm version](https://badge.fury.io/js/projen-pipelines.svg)](https://www.npmjs.com/package/projen-pipelines)


Projen Pipelines is a projen library that provides high-level abstractions for defining continuous delivery (CD) pipelines for AWS CDK applications.
It is specifically designed to work with the projen project configuration engine.

This library provides high-level abstractions for defining multi-environment and multi-account AWS CDK applications with ease.
With this library, you can handle complex deployment scenarios with less code and manage your AWS infrastructure in a more efficient and straightforward way.
## How Projen Pipelines work
![High level Projen Pipelines Overview](documentation/overview.png)
Under the hood, after you defined the pipeline and selected target engine that you want to work on, we are using code generation methods that will create - in your project - the required CI/CD pipeline.

We are considering to allow selecting multiple engines going forward - please let us know if this is a feature you would use or not!

## Getting Started

### Installation

To install the package, add the package `projen-pipelines` to your projects devDeps in your projen configuration file.

After installing the package, you can import and use the constructs to define your CDK Pipelines.

You will also have to setup an IAM role that can be used by GitHub Actions. You can find a tutorial on how set this up here: [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

### Usage

You can start using the constructs provided by Projen Pipelines in your AWS CDK applications. Here's a brief example:

```typescript
import { awscdk } from 'projen';
import { GithubCDKPipeline } from 'projen-pipelines';

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
new GithubCDKPipeline(app, {
  stackPrefix: 'MyApp',
  iamRoleArns: {
    default: 'arn:aws:iam::123456789012:role/GithubDeploymentRole',
  },
  pkgNamespace: '@company-assemblies',
  useGithubPackagesForAssembly: true,
  stages: [
    {
      name: 'dev',
      env: { account: '123456789012', region: 'eu-central-1' },
    }, {
      name: 'prod',
      manualApproval: true,
      env: {account: '123456789012', region: 'eu-central-1' },
    }],
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

### Setting Up Trust Relationships Between Accounts

When planning to manage multiple staging environments, you will need to establish trust relationships. This process centralizes deployment control, improving operational efficiency and security by consolidating deployment management through a singular, monitored channel. Here is a simplified diagram for the setup:

![Trust relationship](documentation/trust.svg)

#### Step 1: Bootstrapping Each Account

Bootstrapping initializes the AWS CDK environment in each account. It prepares the account to work with AWS CDK apps deployed from other accounts. Use the `cdk bootstrap` command for this purpose. Replace `<deployment_account_id>` with the actual AWS account ID of your deployment account.

You can use the [CloudShell](https://aws.amazon.com/cloudshell/) to bootstrap each staging account:

```bash
cdk bootstrap --trust <deployment_account_id> --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess"
```

**Note:**

While `AdministratorAccess` grants full access to all AWS services and resources, it's not recommended for production environments due to security risks. Instead, create custom IAM policies that grant only the necessary permissions required for deployment operations.

### Deployment

The `<Engine>CDKPipeline` class creates and adds several tasks to the projen project that then can be used in your pipeline to deploy your application to AWS.

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
### By raising feature requests or issues
Use the Github integrated "[Issues](https://github.com/taimos/projen-pipelines/issues/new)" view to create an item that you would love to have added to our open source project.

***No request is too big or too small*** - get your thoughts created and we'll get back to you if we have questions!


### By committing code

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
