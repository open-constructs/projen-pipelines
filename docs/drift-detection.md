# Drift Detection for CloudFormation/CDK Stacks

The drift detection feature allows you to automatically check for configuration drift in your CloudFormation and CDK stacks. It supports both scheduled checks and integration into existing CI/CD pipelines.

## Features

- **Automated Drift Detection**: Schedule regular drift checks for your stacks
- **Multi-Platform Support**: Works with GitHub Actions, GitLab CI/CD, and Bash scripts
- **External Script**: Drift detection logic in a separate TypeScript script for better maintainability
- **Custom Error Handling**: Define special cases for known drift issues
- **Flexible Configuration**: Check specific stacks or all stacks in a region
- **Issue Creation**: Automatically create GitHub issues when drift is detected
- **Pipeline Integration**: Add drift checks as steps in your deployment pipeline

## Architecture

The drift detection feature is organized into separate components:

- **`detect-drift.ts`**: Standalone TypeScript script that performs the actual drift detection
- **Platform-specific workflows**: GitHub, GitLab, and Bash implementations
- **`DriftDetectionStep`**: Integration for existing pipelines

## Usage

### GitHub Actions Scheduled Workflow

Create a scheduled GitHub Actions workflow:

```typescript
import { GitHubDriftDetectionWorkflow } from 'projen-pipelines';

new GitHubDriftDetectionWorkflow(project, {
  name: 'drift-detection',
  schedule: '0 0 * * *', // Daily at midnight
  stages: [
    {
      name: 'production',
      region: 'us-east-1',
      roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
      stackNames: ['MyApp-Production-Stack'],
      failOnDrift: true,
      errorHandlers: {
        'Lambda.*': {
          pattern: 'Lambda.*',
          action: 'ignore',
          message: 'Ignoring Lambda runtime updates',
        },
      },
    },
    {
      name: 'staging',
      region: 'us-east-1',
      roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
      failOnDrift: false, // Just report, don't fail
    },
  ],
  createIssues: true, // Create GitHub issues on drift
});
```

### GitLab CI Scheduled Pipeline

Create a scheduled GitLab CI pipeline:

```typescript
import { GitLabDriftDetectionWorkflow } from 'projen-pipelines';

new GitLabDriftDetectionWorkflow(project, {
  name: 'drift-detection',
  schedule: '0 */6 * * *', // Every 6 hours
  runnerTags: ['docker', 'aws'],
  image: 'node:18-alpine',
  stages: [
    {
      name: 'production',
      region: 'us-east-1',
      roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
      stackNames: ['MyApp-Production-Stack'],
      failOnDrift: true,
    },
  ],
});
```

### Bash Script for Manual Runs

Generate a bash script for manual drift detection:

```typescript
import { BashDriftDetectionWorkflow } from 'projen-pipelines';

new BashDriftDetectionWorkflow(project, {
  scriptPath: 'scripts/check-drift.sh',
  stages: [
    {
      name: 'production',
      region: 'us-east-1',
      roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
      stackNames: ['MyApp-Production-Stack'],
    },
  ],
});

// Run manually:
// ./scripts/check-drift.sh
// ./scripts/check-drift.sh --stage production
```

### Pipeline Integration

Add drift detection as a step in your CI/CD pipeline:

```typescript
import { DriftDetectionStep } from 'projen-pipelines';

const driftCheck = new DriftDetectionStep(project, {
  name: 'CheckDrift',
  region: 'us-east-1',
  roleArn: 'arn:aws:iam::123456789012:role/DriftDetectionRole',
  stackNames: ['MyStack'],
  failOnDrift: true,
  timeout: 30, // 30 minutes
});

// Use in your pipeline
```

## Configuration Options

### Common Options

All workflow types support these stage options:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | `string` | Stage name | Required |
| `region` | `string` | AWS region | Required |
| `roleArn` | `string` | IAM role for drift detection | - |
| `stackNames` | `string[]` | Specific stacks to check | All stacks |
| `failOnDrift` | `boolean` | Fail if drift detected | `true` |
| `errorHandlers` | `Record<string, DriftErrorHandler>` | Custom error handlers | - |
| `environment` | `Record<string, string>` | Environment variables | - |

### GitHubDriftDetectionWorkflow Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | `string` | Workflow name | `drift-detection` |
| `schedule` | `string` | Cron schedule | `0 0 * * *` |
| `permissions` | `Record<string, string>` | GitHub permissions | - |
| `createIssues` | `boolean` | Create issues on drift | `true` |

### GitLabDriftDetectionWorkflow Options  

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | `string` | Pipeline name | `drift-detection` |
| `schedule` | `string` | Cron schedule | `0 0 * * *` |
| `runnerTags` | `string[]` | GitLab runner tags | `[]` |
| `image` | `string` | Docker image | `node:18` |

### BashDriftDetectionWorkflow Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | `string` | Script name | `drift-detection` |
| `scriptPath` | `string` | Output script path | `drift-detection.sh` |

## Error Handling

Define custom error handlers with different actions:

```typescript
errorHandlers: {
  'Lambda.*': {
    pattern: 'Lambda.*',
    action: 'ignore', // ignore | warn | fail
    message: 'Lambda runtime drift is expected',
  },
  'DynamoDB-.*': {
    pattern: 'DynamoDB-.*', 
    action: 'warn',
    message: 'DynamoDB drift detected but continuing',
  },
}
```

Actions:
- `ignore`: Skip checking this stack entirely
- `warn`: Check the stack but don't fail on drift
- `fail`: Normal behavior (fail on drift)

## IAM Permissions

The drift detection role needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:DetectStackDrift",
        "cloudformation:DescribeStackDriftDetectionStatus",
        "cloudformation:DescribeStackResourceDrifts",
        "cloudformation:ListStackResources",
        "cloudformation:ListStacks"
      ],
      "Resource": "*"
    }
  ]
}
```

## GitHub Actions Integration

When drift is detected in a scheduled run, the workflow automatically creates a GitHub issue with:
- Drift detection summary
- Link to the workflow run
- Labels for tracking (`drift-detection`, stage name)

## GitLab CI Integration

For GitLab, create a scheduled pipeline with the `DRIFT_DETECTION=true` variable:
1. Go to CI/CD > Schedules
2. Create a new schedule
3. Add variable: `DRIFT_DETECTION=true`
4. Set your desired cron schedule

## Output

The drift detection provides detailed output including:
- Stack drift status (IN_SYNC, DRIFTED, etc.)
- List of drifted resources
- Resource drift details showing property differences
- Summary of all checked stacks

Example output:
```
Checking drift for stack: MyApp-Production-Stack
Started drift detection with ID: 12345678-1234-1234-1234-123456789012
Drift detection status: DETECTION_COMPLETE (120s elapsed)
Stack drift status: DRIFTED

DRIFT DETECTED in stack MyApp-Production-Stack!
LogicalResourceId    ResourceType              DriftStatus
MyFunction          AWS::Lambda::Function     MODIFIED
MyTable             AWS::DynamoDB::Table      MODIFIED

Drift details for resource: MyFunction
[
  {
    "PropertyDifferences": [
      {
        "PropertyPath": "/Runtime",
        "ExpectedValue": "nodejs16.x",
        "ActualValue": "nodejs18.x",
        "DifferenceType": "NOT_EQUAL"
      }
    ]
  }
]
```