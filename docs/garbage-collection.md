# CDK Garbage Collection

The garbage collection feature generates scheduled workflows that run `cdk gc` against your CDK bootstrap resources. Every deployment writes new file and image assets into the bootstrap S3 bucket and ECR repository, but nothing removes the old ones. Over time this causes storage cost growth and can hit ECR image-count quotas.

Since projen-pipelines already knows your stages, accounts, regions, and IAM roles, it can generate a complete cleanup workflow automatically -- no hand-rolled YAML required.

## Features

- **Automated Cleanup**: Schedule regular garbage collection for bootstrap S3 and ECR assets
- **Multi-Platform Support**: Works with GitHub Actions, GitLab CI/CD, and Bash scripts
- **Per-Stage Configuration**: Override GC options per stage (action, asset type, buffer days)
- **Deduplication**: Stages sharing the same account/region are deduplicated in GitHub workflows
- **Projen Tasks**: Generates `gc:<stage>` tasks for local or CI usage
- **Safe Defaults**: Weekly schedule with `--confirm=false` for unattended CI runs

## Architecture

The garbage collection feature is organized into components:

- **`GarbageCollectionWorkflow`**: Abstract base class handling schedule, stages, and package manager detection
- **`GarbageCollectionStep`**: Builds the `cdk gc` command, handles option merging, and registers projen tasks
- **Platform-specific workflows**: GitHub Actions, GitLab CI, and Bash implementations

## Usage

### GitHub Actions Scheduled Workflow

```typescript
import { GitHubGarbageCollectionWorkflow, GcAction, GcAssetType } from 'projen-pipelines';

new GitHubGarbageCollectionWorkflow(project, {
  schedule: '0 3 * * 0', // Weekly, Sunday 03:00 UTC (default)
  gcOptions: {
    action: GcAction.FULL,
    type: GcAssetType.ALL,
    rollbackBufferDays: 30,
    createdBufferDays: 1,
  },
  stages: [
    {
      name: 'production',
      env: { account: '123456789012', region: 'eu-central-1' },
      roleArn: 'arn:aws:iam::123456789012:role/GarbageCollectionRole',
      timeoutMinutes: 120,
    },
    {
      name: 'staging',
      env: { account: '234567890123', region: 'eu-central-1' },
      roleArn: 'arn:aws:iam::234567890123:role/GarbageCollectionRole',
      gcOptions: {
        action: GcAction.TAG, // Override: only tag, don't delete yet
      },
    },
  ],
});
```

### GitLab CI Scheduled Pipeline

```typescript
import { GitLabGarbageCollectionWorkflow, GcAction, GcAssetType } from 'projen-pipelines';

new GitLabGarbageCollectionWorkflow(project, {
  schedule: '0 3 * * 0',
  runnerTags: ['docker', 'aws'],
  image: 'node:20',
  gcOptions: {
    action: GcAction.FULL,
    type: GcAssetType.ALL,
    rollbackBufferDays: 30,
    createdBufferDays: 1,
  },
  stages: [
    {
      name: 'production',
      env: { account: '123456789012', region: 'eu-central-1' },
      roleArn: 'arn:aws:iam::123456789012:role/GarbageCollectionRole',
    },
  ],
});
```

To trigger the GitLab pipeline on a schedule:
1. Go to CI/CD > Schedules
2. Create a new schedule with your desired cron expression
3. Add variable: `CDK_GC=true`

### Bash Script for Manual Runs

```typescript
import { BashGarbageCollectionWorkflow, GcAction, GcAssetType } from 'projen-pipelines';

new BashGarbageCollectionWorkflow(project, {
  scriptPath: 'scripts/cdk-gc.sh',
  gcOptions: {
    action: GcAction.FULL,
    type: GcAssetType.ALL,
    rollbackBufferDays: 30,
    createdBufferDays: 1,
  },
  stages: [
    {
      name: 'production',
      env: { account: '123456789012', region: 'eu-central-1' },
      roleArn: 'arn:aws:iam::123456789012:role/GarbageCollectionRole',
    },
  ],
});

// Run manually:
// ./scripts/cdk-gc.sh
// ./scripts/cdk-gc.sh --stage production
```

### Projen Tasks

For each configured stage, a projen task `gc:<stage-name>` is registered. Run locally with:

```bash
npx projen gc:production
npx projen gc:staging
```

These tasks execute the same `cdk gc` command that the CI workflow runs.

## Configuration Options

### GcOptions (Workflow-Level and Per-Stage)

Workflow-level `gcOptions` apply to all stages. Per-stage `gcOptions` are shallow-merged over the workflow-level defaults (stage values win).

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `action` | `GcAction` | Action to perform (see below) | `GcAction.FULL` |
| `type` | `GcAssetType` | Asset type to collect (see below) | `GcAssetType.ALL` |
| `rollbackBufferDays` | `number` | Days to keep assets referenced by rolled-back stacks | `30` |
| `createdBufferDays` | `number` | Days to keep assets based on creation date | `1` |
| `bootstrapStackName` | `string` | Name of the CDK bootstrap stack | CDK default (`CDKToolkit`) |

### GcAction Enum

| Value | CLI Flag | Description |
|-------|----------|-------------|
| `GcAction.PRINT` | `--action=print` | List assets that would be garbage collected, without taking action |
| `GcAction.TAG` | `--action=tag` | Tag assets for deletion without actually deleting them |
| `GcAction.DELETE_TAGGED` | `--action=delete-tagged` | Delete previously tagged assets |
| `GcAction.FULL` | `--action=full` | Tag and delete in one pass |

A common pattern is to run `TAG` first in a separate schedule, review the tagged assets, then run `DELETE_TAGGED` once confident.

### GcAssetType Enum

| Value | CLI Flag | Description |
|-------|----------|-------------|
| `GcAssetType.S3` | `--type=s3` | Only garbage collect S3 file assets |
| `GcAssetType.ECR` | `--type=ecr` | Only garbage collect ECR container images |
| `GcAssetType.ALL` | `--type=all` | Garbage collect both S3 and ECR assets |

### GcStageOptions

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `name` | `string` | Stage name (used in job names and projen task) | Yes |
| `env` | `{ account: string; region: string }` | AWS account and region | Yes |
| `roleArn` | `string` | IAM role ARN to assume via OIDC | No |
| `jumpRoleArn` | `string` | Intermediate role to assume before the target role | No |
| `gcOptions` | `GcOptions` | Per-stage overrides (shallow-merged over workflow-level) | No |
| `environment` | `Record<string, string>` | Additional environment variables | No |
| `timeoutMinutes` | `number` | Job timeout in minutes (useful for large bootstrap buckets) | No |

### GarbageCollectionWorkflowOptions

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `pipelineName` | `string` | Prefix for workflow files (prevents collisions in monorepos) | No prefix |
| `schedule` | `string` | Cron schedule expression | `0 3 * * 0` (weekly, Sunday 03:00 UTC) |
| `gcOptions` | `GcOptions` | Default GC options applied to all stages | `{}` |
| `stages` | `GcStageOptions[]` | Stages to run garbage collection against | Required |
| `preInstallSteps` | `PipelineStep[]` | Additional steps before dependency install | `[]` |

### GitHubGarbageCollectionWorkflow Options

Extends `GarbageCollectionWorkflowOptions` with:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `permissions` | `Record<string, string>` | Additional GitHub Actions permissions | - |

### GitLabGarbageCollectionWorkflow Options

Extends `GarbageCollectionWorkflowOptions` with:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `runnerTags` | `string[]` | GitLab runner tags | `[]` |
| `image` | `string` | Docker image for jobs | `node:20` |

### BashGarbageCollectionWorkflow Options

Extends `GarbageCollectionWorkflowOptions` with:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `scriptPath` | `string` | Output path for the generated script | `cdk-gc.sh` |

## Deduplication (GitHub)

When multiple stages share the same AWS account and region, the GitHub workflow deduplicates them. Since `cdk gc` operates on the bootstrap bucket/repository (which is per-account-per-region, not per-stack), running it once per unique account/region pair is sufficient. The first stage configuration for a given account/region is used.

## Per-Stage Override Behavior

Per-stage `gcOptions` are shallow-merged over workflow-level `gcOptions`. This means individual fields in the stage override replace the corresponding workflow-level fields, but unspecified fields fall back to the workflow default:

```typescript
new GitHubGarbageCollectionWorkflow(project, {
  gcOptions: {
    action: GcAction.FULL,
    type: GcAssetType.ALL,
    rollbackBufferDays: 30,
    createdBufferDays: 1,
  },
  stages: [
    {
      name: 'production',
      env: { account: '123456789012', region: 'eu-central-1' },
      roleArn: 'arn:aws:iam::123456789012:role/GCRole',
      gcOptions: {
        action: GcAction.TAG, // Override action only; type, buffer days inherit from workflow
      },
    },
  ],
});
// Effective options for production: action=TAG, type=ALL, rollbackBufferDays=30, createdBufferDays=1
```

## IAM Permissions

The garbage collection role needs permissions to read CloudFormation stacks and manage assets in the bootstrap bucket and ECR repository. Below is a ready-to-use policy document.

Replace `<account>`, `<region>`, and `<qualifier>` with your values. The default qualifier is `hnb659fds` unless you customized it during bootstrap.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationReadAccess",
      "Effect": "Allow",
      "Action": [
        "cloudformation:ListStacks",
        "cloudformation:GetTemplate",
        "cloudformation:GetTemplateSummary"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3BootstrapBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutObjectTagging",
        "s3:GetObjectTagging",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cdk-<qualifier>-assets-<account>-<region>",
        "arn:aws:s3:::cdk-<qualifier>-assets-<account>-<region>/*"
      ]
    },
    {
      "Sid": "ECRBootstrapRepositoryAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchDeleteImage",
        "ecr:BatchGetImage",
        "ecr:DescribeImages",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:PutImage"
      ],
      "Resource": "arn:aws:ecr:<region>:<account>:repository/cdk-<qualifier>-container-assets-<account>-<region>"
    }
  ]
}
```

If you use OIDC federation (recommended for GitHub Actions and GitLab CI), the role's trust policy must allow the CI provider to assume it. See the [AWS CDK documentation](https://docs.aws.amazon.com/cdk/v2/guide/configure-access.html) for OIDC trust policy examples.

## Caveats

### Unstable Flag

The `cdk gc` command is gated behind the `--unstable=gc` flag. This means the command interface may change between CDK CLI versions. The generated workflows always include this flag. When `cdk gc` graduates to stable, this library will be updated to drop the flag.

### Bootstrap Version

`cdk gc` requires a modern bootstrap stack (v2+). If your account was bootstrapped with an older template, you may need to re-bootstrap before garbage collection works correctly.

### SCP and Permission Failures

Some organizations apply Service Control Policies (SCPs) that restrict access to the bootstrap bucket or ECR repository. If garbage collection fails with `AccessDenied` errors, verify that your SCPs allow the actions listed in the IAM Permissions section above.

See [aws/aws-cdk-cli#640](https://github.com/aws/aws-cdk-cli/issues/640) for known issues related to SCP and permission failures with `cdk gc`.

### Large Bootstrap Buckets

For accounts with a long deployment history, the bootstrap bucket may contain tens of thousands of objects. In this case `cdk gc` can take a long time to complete. Use the `timeoutMinutes` option on stages to prevent CI jobs from being killed prematurely:

```typescript
{
  name: 'legacy-production',
  env: { account: '123456789012', region: 'eu-central-1' },
  roleArn: 'arn:aws:iam::123456789012:role/GCRole',
  timeoutMinutes: 180, // 3 hours for large buckets
}
```

### Confirm Behavior

The generated commands always include `--confirm=false` to prevent interactive prompts in CI environments. This is safe because the buffer day settings (rollback and created) provide protection against deleting assets that are still in use.

## Generated Command Format

The underlying command generated for each stage follows this format:

```
npx cdk gc aws://<account>/<region> --unstable=gc --confirm=false --type=<type> --action=<action> --rollback-buffer-days=<N> --created-buffer-days=<N> [--bootstrap-stack-name=<name>]
```

All flags are derived from the merged `gcOptions` (workflow-level defaults with per-stage overrides applied).
