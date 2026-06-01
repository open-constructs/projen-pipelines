import { Project } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { BashStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

/**
 * Options for the CreateReleaseStep.
 */
export interface CreateReleaseStepOptions {
  /**
   * The stage name this release is for.
   */
  readonly stageName: string;

  /**
   * Path to the file containing version info from before the deployment.
   * This file should contain a JSON object with at least a `commitHash` field.
   * @default `version-info-<stageName>-before.json`
   */
  readonly previousVersionFile?: string;

  /**
   * Path to the file containing version info from after the deployment.
   * This file should contain a JSON object with at least a `commitHash` and `version` field.
   * @default `version-info-<stageName>-after.json`
   */
  readonly currentVersionFile?: string;

  /**
   * The GitHub environment name to associate the release with.
   * If provided, the release will reference this environment.
   * @default - the stage name
   */
  readonly environment?: string;

  /**
   * Whether to create the release as a draft.
   * @default false
   */
  readonly draft?: boolean;

  /**
   * Whether to mark the release as a prerelease.
   * @default false
   */
  readonly prerelease?: boolean;

  /**
   * Optional prefix for the git tag.
   * @default 'v'
   */
  readonly tagPrefix?: string;

  /**
   * Optional suffix for the git tag to distinguish per-environment releases.
   * @default - the stage name (e.g., v1.0.0-production)
   */
  readonly tagSuffix?: string;

  /**
   * Whether to include the stage/environment name as a suffix in the tag.
   * @default true
   */
  readonly includeEnvironmentInTag?: boolean;
}

/**
 * A pipeline step that creates a release with a changelog generated from
 * git history between two commit hashes.
 *
 * This step:
 * 1. Reads the previous and current version info files (produced by SaveVersionInfoStep)
 * 2. Extracts the commit hashes from both
 * 3. Generates a changelog from git log between the two commits
 * 4. Creates a GitHub release (or GitLab release) with the version tag and changelog
 *
 * For GitHub: Uses the `gh` CLI to create releases with environment association.
 * For GitLab: Uses the GitLab release CLI or API to create releases with environment association.
 */
export class CreateReleaseStep extends PipelineStep {

  private readonly options: CreateReleaseStepOptions;

  constructor(project: Project, options: CreateReleaseStepOptions) {
    super(project);
    this.options = options;
  }

  private get previousVersionFile(): string {
    return this.options.previousVersionFile ?? `version-info-${this.options.stageName}-before.json`;
  }

  private get currentVersionFile(): string {
    return this.options.currentVersionFile ?? `version-info-${this.options.stageName}-after.json`;
  }

  private get tagPrefix(): string {
    return this.options.tagPrefix ?? 'v';
  }

  private get environment(): string {
    return this.options.environment ?? this.options.stageName;
  }

  private generateGithubScript(): string {
    const previousFile = this.previousVersionFile;
    const currentFile = this.currentVersionFile;
    const tagPrefix = this.tagPrefix;
    const includeEnvInTag = this.options.includeEnvironmentInTag ?? true;
    const tagSuffix = this.options.tagSuffix ?? (includeEnvInTag ? `-${this.options.stageName}` : '');
    const draft = this.options.draft ?? false;
    const prerelease = this.options.prerelease ?? false;

    return `
echo "Creating release for stage ${this.options.stageName}..."

# Read version info files
if [ ! -f "${currentFile}" ]; then
  echo "Error: Current version file not found: ${currentFile}"
  exit 1
fi

CURRENT_VERSION=$(jq -r '.version // empty' "${currentFile}")
CURRENT_COMMIT=$(jq -r '.commitHash // empty' "${currentFile}")

if [ -z "$CURRENT_VERSION" ] || [ -z "$CURRENT_COMMIT" ]; then
  echo "Error: Could not read version or commit hash from ${currentFile}"
  exit 1
fi

# Determine previous commit hash
PREVIOUS_COMMIT=""
if [ -f "${previousFile}" ]; then
  PREVIOUS_COMMIT=$(jq -r '.commitHash // empty' "${previousFile}")
fi

# Build the tag name
TAG_NAME="${tagPrefix}\${CURRENT_VERSION}${tagSuffix}"

echo "Current version: $CURRENT_VERSION"
echo "Current commit: $CURRENT_COMMIT"
echo "Previous commit: $PREVIOUS_COMMIT"
echo "Tag: $TAG_NAME"

# Generate changelog
CHANGELOG=""
if [ -n "$PREVIOUS_COMMIT" ] && [ "$PREVIOUS_COMMIT" != "null" ] && git cat-file -t "$PREVIOUS_COMMIT" > /dev/null 2>&1; then
  echo "Generating changelog from $PREVIOUS_COMMIT to $CURRENT_COMMIT..."
  CHANGELOG=$(git log --pretty=format:"- %s (%h)" "$PREVIOUS_COMMIT".."$CURRENT_COMMIT" 2>/dev/null || echo "")
else
  echo "No previous commit found or commit not in history. Generating changelog from last 10 commits..."
  CHANGELOG=$(git log --pretty=format:"- %s (%h)" -10 "$CURRENT_COMMIT" 2>/dev/null || echo "")
fi

if [ -z "$CHANGELOG" ]; then
  CHANGELOG="- Initial deployment"
fi

# Build release notes
RELEASE_NOTES="## Deployment to ${this.options.stageName}

**Version:** \${CURRENT_VERSION}
**Commit:** \${CURRENT_COMMIT}
**Environment:** ${this.environment}

### Changes

\${CHANGELOG}
"

echo "Release notes:"
echo "$RELEASE_NOTES"

# Create or update the tag
git tag -f "$TAG_NAME" "$CURRENT_COMMIT"
git push -f origin "$TAG_NAME"

# Create the GitHub release
RELEASE_FLAGS=""
${draft ? 'RELEASE_FLAGS="$RELEASE_FLAGS --draft"' : ''}
${prerelease ? 'RELEASE_FLAGS="$RELEASE_FLAGS --prerelease"' : ''}

# Delete existing release if it exists (to allow re-deployment)
gh release delete "$TAG_NAME" --yes 2>/dev/null || true

gh release create "$TAG_NAME" \\
  --title "Release \${CURRENT_VERSION} (${this.options.stageName})" \\
  --notes "$RELEASE_NOTES" \\
  --target "$CURRENT_COMMIT" \\
  $RELEASE_FLAGS

echo "Release created successfully: $TAG_NAME"
`.trim();
  }

  private generateGitlabScript(): string[] {
    const previousFile = this.previousVersionFile;
    const currentFile = this.currentVersionFile;
    const tagPrefix = this.tagPrefix;
    const includeEnvInTag = this.options.includeEnvironmentInTag ?? true;
    const tagSuffix = this.options.tagSuffix ?? (includeEnvInTag ? `-${this.options.stageName}` : '');

    return [
      `echo "Creating release for stage ${this.options.stageName}..."`,
      '',
      '# Read version info files',
      `if [ ! -f "${currentFile}" ]; then`,
      `  echo "Error: Current version file not found: ${currentFile}"`,
      '  exit 1',
      'fi',
      '',
      `CURRENT_VERSION=$(jq -r '.version // empty' "${currentFile}")`,
      `CURRENT_COMMIT=$(jq -r '.commitHash // empty' "${currentFile}")`,
      '',
      'if [ -z "$CURRENT_VERSION" ] || [ -z "$CURRENT_COMMIT" ]; then',
      `  echo "Error: Could not read version or commit hash from ${currentFile}"`,
      '  exit 1',
      'fi',
      '',
      '# Determine previous commit hash',
      'PREVIOUS_COMMIT=""',
      `if [ -f "${previousFile}" ]; then`,
      `  PREVIOUS_COMMIT=$(jq -r '.commitHash // empty' "${previousFile}")`,
      'fi',
      '',
      '# Build the tag name',
      `TAG_NAME="${tagPrefix}\${CURRENT_VERSION}${tagSuffix}"`,
      '',
      'echo "Current version: $CURRENT_VERSION"',
      'echo "Current commit: $CURRENT_COMMIT"',
      'echo "Previous commit: $PREVIOUS_COMMIT"',
      'echo "Tag: $TAG_NAME"',
      '',
      '# Generate changelog',
      'CHANGELOG=""',
      'if [ -n "$PREVIOUS_COMMIT" ] && [ "$PREVIOUS_COMMIT" != "null" ] && git cat-file -t "$PREVIOUS_COMMIT" > /dev/null 2>&1; then',
      '  echo "Generating changelog from $PREVIOUS_COMMIT to $CURRENT_COMMIT..."',
      '  CHANGELOG=$(git log --pretty=format:"- %s (%h)" "$PREVIOUS_COMMIT".."$CURRENT_COMMIT" 2>/dev/null || echo "")',
      'else',
      '  echo "No previous commit found. Generating changelog from last 10 commits..."',
      '  CHANGELOG=$(git log --pretty=format:"- %s (%h)" -10 "$CURRENT_COMMIT" 2>/dev/null || echo "")',
      'fi',
      '',
      'if [ -z "$CHANGELOG" ]; then',
      '  CHANGELOG="- Initial deployment"',
      'fi',
      '',
      '# Build release description',
      `RELEASE_DESC="## Deployment to ${this.options.stageName}`,
      '',
      '**Version:** ${CURRENT_VERSION}',
      '**Commit:** ${CURRENT_COMMIT}',
      `**Environment:** ${this.environment}`,
      '',
      '### Changes',
      '',
      '${CHANGELOG}"',
      '',
      '# Create the tag',
      'git tag -f "$TAG_NAME" "$CURRENT_COMMIT"',
      'git push -f origin "$TAG_NAME"',
      '',
      '# Create GitLab release using the API',
      'curl --header "PRIVATE-TOKEN: ${GITLAB_TOKEN:-$CI_JOB_TOKEN}" \\',
      '  --header "Content-Type: application/json" \\',
      '  --request POST \\',
      '  --data "{',
      '    \\"tag_name\\": \\"$TAG_NAME\\",',
      `    \\"name\\": \\"Release \${CURRENT_VERSION} (${this.options.stageName})\\",`,
      '    \\"description\\": $(echo "$RELEASE_DESC" | jq -Rs .),',
      `    \\"milestones\\": [],`,
      `    \\"assets\\": { \\"links\\": [] }`,
      '  }" \\',
      '  "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/releases" || echo "Release may already exist, skipping..."',
      '',
      `echo "Release created successfully: $TAG_NAME"`,
    ];
  }

  public toGithub(): GithubStepConfig {
    return {
      needs: [],
      steps: [
        {
          name: `Create release - ${this.options.stageName}`,
          run: this.generateGithubScript(),
          env: {
            GH_TOKEN: '${{ github.token }}',
          },
        },
      ],
      env: {},
      permissions: {
        contents: JobPermission.WRITE,
      },
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: this.generateGitlabScript(),
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: this.generateGithubScript().split('\n'),
    };
  }
}
