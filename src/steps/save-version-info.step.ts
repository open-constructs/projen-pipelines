import { Project } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { BashStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

/**
 * Options for the SaveVersionInfoStep.
 */
export interface SaveVersionInfoStepOptions {
  /**
   * The CloudFormation stack name to query for version outputs.
   */
  readonly stackName: string;

  /**
   * The AWS region where the stack is deployed.
   */
  readonly region: string;

  /**
   * The stage name, used for naming the output file.
   */
  readonly stageName: string;

  /**
   * The output file path to write version info to.
   * @default `version-info-<stageName>-<suffix>.json`
   */
  readonly outputFile?: string;

  /**
   * Whether this is capturing the "before" or "after" deployment state.
   * @default 'before'
   */
  readonly phase?: 'before' | 'after';
}

/**
 * A pipeline step that fetches current version information from CloudFormation
 * stack outputs and saves it to a JSON file.
 *
 * This step is designed to be used before and after deployment:
 * - Before: captures the currently deployed version (previous commit hash)
 * - After: captures the newly deployed version (current commit hash)
 *
 * The output files can then be consumed by CreateReleaseStep to generate changelogs.
 */
export class SaveVersionInfoStep extends PipelineStep {

  private readonly options: SaveVersionInfoStepOptions;

  constructor(project: Project, options: SaveVersionInfoStepOptions) {
    super(project);
    this.options = options;
  }

  private get outputFile(): string {
    return this.options.outputFile ?? `version-info-${this.options.stageName}-${this.options.phase ?? 'before'}.json`;
  }

  private generateScript(): string {
    const { stackName, region } = this.options;
    const outputFile = this.outputFile;

    return `
echo "Fetching version info from CloudFormation stack ${stackName} in ${region}..."

# Try to get version info from CloudFormation outputs
VERSION_JSON=$(aws cloudformation describe-stacks \
  --stack-name "${stackName}" \
  --region "${region}" \
  --query "Stacks[0].Outputs[?OutputKey=='AppVersionInfo'].OutputValue | [0]" \
  --output text 2>/dev/null || echo "")

if [ -n "$VERSION_JSON" ] && [ "$VERSION_JSON" != "None" ] && [ "$VERSION_JSON" != "null" ]; then
  echo "$VERSION_JSON" > "${outputFile}"
  echo "Version info saved to ${outputFile}"
  echo "Content: $(cat ${outputFile})"
else
  # Fallback: try to get individual outputs
  COMMIT_HASH=$(aws cloudformation describe-stacks \
    --stack-name "${stackName}" \
    --region "${region}" \
    --query "Stacks[0].Outputs[?OutputKey=='AppVersionCommitHash'].OutputValue | [0]" \
    --output text 2>/dev/null || echo "")

  VERSION=$(aws cloudformation describe-stacks \
    --stack-name "${stackName}" \
    --region "${region}" \
    --query "Stacks[0].Outputs[?OutputKey=='AppVersion'].OutputValue | [0]" \
    --output text 2>/dev/null || echo "")

  if [ -n "$COMMIT_HASH" ] && [ "$COMMIT_HASH" != "None" ]; then
    echo "{\\"version\\":\\"$VERSION\\",\\"commitHash\\":\\"$COMMIT_HASH\\"}" > "${outputFile}"
    echo "Version info (partial) saved to ${outputFile}"
  else
    echo "No version info found in stack outputs. Stack may not exist yet or versioning is not enabled."
    echo "{}" > "${outputFile}"
  fi
fi
`.trim();
  }

  public toGithub(): GithubStepConfig {
    return {
      needs: [],
      steps: [
        {
          name: `Save version info (${this.options.phase ?? 'before'} deploy) - ${this.options.stageName}`,
          run: this.generateScript(),
        },
      ],
      env: {},
      permissions: {
        idToken: JobPermission.WRITE,
      },
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: this.generateScript().split('\n'),
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: this.generateScript().split('\n'),
    };
  }
}
