# Projen Pipelines - LLM Context

This document provides comprehensive information about the projen-pipelines library to assist LLMs in generating code and providing accurate guidance.

## Overview

Projen Pipelines is an open-source project that automates CI/CD pipeline generation using Projen (a project configuration tool created by the inventor of AWS CDK). It provides high-level abstractions for defining continuous delivery pipelines with a focus on AWS CDK applications.

The library supports multiple CI/CD platforms (currently GitHub Actions, GitLab CI, and bash scripts) and allows users to easily switch between them without rewriting pipeline configurations.

## Key Features

- **Automated pipeline code generation**: Generate CI/CD configuration files without manual writing
- **Multi-platform support**: Deploy to GitHub Actions, GitLab CI, or bash scripts
- **Baked-in proven defaults**: Optimized pipeline configurations
- **Compliance-as-code integration**: Integrate compliance requirements directly into pipelines
- **Platform migration support**: Switch CI/CD platforms with minimal code changes
- **Complex deployment scenarios**: Handle multi-stage, multi-account deployments
- **AWS infrastructure management**: Streamlined deployment to AWS environments

## Core Architecture

Projen-pipelines is built on these architectural components:

1. **Pipeline Engines**: Abstract interfaces with concrete implementations for each CI/CD platform
2. **Pipeline Steps**: Modular, composable actions that make up pipeline workflows
3. **CDK Integration**: Specialized components for AWS CDK applications
4. **Configuration Generation**: Automated creation of platform-specific configuration files

## Pipeline Steps

Steps are the fundamental building blocks. Key step types include:

- `PipelineStep` (abstract base class)
- `SimpleCommandStep` (execute shell commands)
- `ProjenScriptStep` (run projen scripts)
- `StepSequence` (combine multiple steps)
- `AwsAssumeRoleStep` (assume AWS IAM roles)
- Various artifact management steps

## CDK Pipeline Integration

For AWS CDK applications, the library provides:

- `CDKPipeline` (abstract base class)
- Platform-specific implementations (e.g., `GithubCDKPipeline`)
- Support for multi-stage deployments (dev, prod, personal)
- Asset publishing and versioning
- Automated CloudFormation deployment

## Usage Example

```typescript
import { awscdk } from 'projen';
import { GithubCDKPipeline } from 'projen-pipelines';

// Define your AWS CDK TypeScript App
const app = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.150.0',
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
  useGithubEnvironments: true,
  stages: [
    {
      name: 'dev',
      env: { account: '123456789013', region: 'eu-central-1' },
    }, {
      name: 'prod',
      manualApproval: true,
      env: { account: '123456789014', region: 'eu-central-1' },
    }],
});
```

After running `npx projen`, a specialized `app.ts` file is created for your CDK application. 
Use it in your main.ts:

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

## Pipeline Configuration Options

When creating a CDK pipeline, these are key configuration options:

| Option | Description |
|--------|-------------|
| `stackPrefix` | Prefix for CloudFormation stack names |
| `iamRoleArns` | IAM roles for AWS access during deployment |
| `pkgNamespace` | Namespace for published packages |
| `stages` | Array of deployment stages with environment settings |
| `useGithubPackagesForAssembly` | Use GitHub Packages for assembly storage |

## Deployment Stages

Each stage can have these properties:

| Property | Description |
|----------|-------------|
| `name` | Stage name (e.g., 'dev', 'prod') |
| `env` | AWS environment (account ID and region) |
| `manualApproval` | Require manual approval before deployment |

## IAM Trust Configuration

For multi-account deployments, trust relationships are needed between accounts:

1. Bootstrap each account with CDK: 
   ```bash
   cdk bootstrap --trust <deployment_account_id> --cloudformation-execution-policies "arn:aws:iam::aws:policy/AdministratorAccess"
   ```

2. Create an IAM role in the deployment account that can assume roles in target accounts:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": "sts:AssumeRole",
               "Resource": [
                   "arn:aws:iam::123456789013:role/cdk-*-123456789013-*",
                   "arn:aws:iam::123456789014:role/cdk-*-123456789014-*"
               ]
           }
       ]
   }
   ```

3. Configure OIDC trust for GitHub Actions (see [GitHub documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services))

## Generated Tasks

The CDK pipeline adds these tasks to your projen project:

| Task | Description |
|------|-------------|
| `deploy:personal` | Deploy personal development environment |
| `watch:personal` | Deploy personal environment in watch mode |
| `diff:personal` | Compare personal environment with code |
| `destroy:personal` | Remove personal environment |
| `deploy:feature` | Deploy feature branch environment |
| `diff:feature` | Compare feature environment with code |
| `destroy:feature` | Remove feature environment |
| `deploy:<stageName>` | Deploy a specific stage |
| `diff:<stageName>` | Compare stage with code |
| `publish:assets` | Publish CDK assets to all accounts |
| `bump` | Bump version based on git tags |
| `release:push-assembly` | Publish cloud assembly to registry |

## Best Practices

1. **IAM Role Setup**: Create minimal permission IAM roles for deployment
2. **Account Bootstrapping**: Bootstrap all accounts with appropriate trust relationships
3. **Testing Locally**: Use the `deploy:personal` task for testing changes locally
4. **Environment Variables**: For GitHub token issues, run `GITHUB_TOKEN= npx projen`
5. **Security**: Never use `AdministratorAccess` in production; use custom IAM policies

## Current Status and Limitations

Projen-Pipelines is currently in version 0.x, awaiting Projen's 1.0 release. Despite being pre-1.0, it's being used in production environments.

## Extension Points

The library is designed for extension via:

1. Creating custom pipeline steps
2. Implementing new engine adapters
3. Adding support for new application types
4. Contributing new deployment patterns

## For More Information

- GitHub Repository: https://github.com/open-constructs/projen-pipelines
- API Documentation: See the API.md file
- Examples: See the README.md for usage examples