import { Project } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { AwsAssumeRoleStep } from './aws-assume-role.step';
import { BashStepConfig, CodeCatalystStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep, StepSequence } from './step';

/**
 * Options for Docker Hub login step
 */
export interface DockerHubLoginStepOptions {
  /**
   * Username for Docker Hub authentication
   * For GitHub: Use ${{ secrets.DOCKERHUB_USERNAME }}
   * For GitLab: Use $DOCKERHUB_USERNAME (from CI/CD variables)
   */
  readonly username: string;

  /**
   * Password/token for Docker Hub authentication
   * For GitHub: Use ${{ secrets.DOCKERHUB_TOKEN }}
   * For GitLab: Use $DOCKERHUB_TOKEN (from CI/CD variables)
   */
  readonly password: string;
}

/**
 * Step to login to Docker Hub registry
 */
export class DockerHubLoginStep extends PipelineStep {
  constructor(project: Project, private readonly options: DockerHubLoginStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [{
        name: 'Login to Docker Hub',
        uses: 'docker/login-action@v3',
        with: {
          username: this.options.username,
          password: this.options.password,
        },
      }],
      needs: [],
      env: {},
      permissions: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: [
        `echo "${this.options.password}" | docker login -u "${this.options.username}" --password-stdin`,
      ],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: [
        `echo "${this.options.password}" | docker login -u "${this.options.username}" --password-stdin`,
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      commands: [
        `echo "${this.options.password}" | docker login -u "${this.options.username}" --password-stdin`,
      ],
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for Harbor registry login step
 */
export interface HarborLoginStepOptions {
  /**
   * Harbor registry URL (e.g., 'harbor.example.com')
   */
  readonly registryUrl: string;

  /**
   * Username for Harbor authentication
   * For GitHub: Use ${{ secrets.HARBOR_USERNAME }}
   * For GitLab: Use $HARBOR_USERNAME (from CI/CD variables)
   */
  readonly username: string;

  /**
   * Password/token for Harbor authentication
   * For GitHub: Use ${{ secrets.HARBOR_PASSWORD }}
   * For GitLab: Use $HARBOR_PASSWORD (from CI/CD variables)
   */
  readonly password: string;
}

/**
 * Step to login to Harbor registry
 */
export class HarborLoginStep extends PipelineStep {
  constructor(project: Project, private readonly options: HarborLoginStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [{
        name: 'Login to Harbor',
        uses: 'docker/login-action@v3',
        with: {
          registry: this.options.registryUrl,
          username: this.options.username,
          password: this.options.password,
        },
      }],
      needs: [],
      env: {},
      permissions: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: [
        `echo "${this.options.password}" | docker login -u "${this.options.username}" --password-stdin ${this.options.registryUrl}`,
      ],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: [
        `echo "${this.options.password}" | docker login -u "${this.options.username}" --password-stdin ${this.options.registryUrl}`,
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      commands: [
        `echo "${this.options.password}" | docker login -u "${this.options.username}" --password-stdin ${this.options.registryUrl}`,
      ],
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for ECR login step
 */
export interface EcrLoginStepOptions {
  /**
   * AWS region for the ECR registry
   */
  readonly region: string;

  /**
   * AWS account ID (optional, will use caller account if not specified)
   */
  readonly accountId?: string;

  /**
   * IAM role to assume for ECR access (optional)
   */
  readonly roleArn?: string;
}

/**
 * Step to login to AWS Elastic Container Registry (ECR)
 */
export class EcrLoginStep extends StepSequence {
  constructor(project: Project, options: EcrLoginStepOptions) {
    const steps: PipelineStep[] = [];

    // Add role assumption if specified
    if (options.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: options.roleArn,
        region: options.region,
      }));
    }

    // Add ECR login step
    steps.push(new EcrLoginStepImpl(project, options));

    super(project, steps);
  }
}

/**
 * Internal implementation of ECR login
 */
class EcrLoginStepImpl extends PipelineStep {
  private readonly options: EcrLoginStepOptions;

  constructor(project: Project, options: EcrLoginStepOptions) {
    super(project);
    this.options = options;
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [{
        name: 'Login to Amazon ECR',
        uses: 'aws-actions/amazon-ecr-login@v2',
        with: {
          ...this.options.accountId && { registries: this.options.accountId },
        },
      }],
      needs: [],
      env: {},
      permissions: {
        idToken: JobPermission.WRITE,
      },
    };
  }

  public toGitlab(): GitlabStepConfig {
    const accountPart = this.options.accountId ?? '$(aws sts get-caller-identity --query Account --output text)';
    return {
      extensions: [],
      commands: [
        `aws ecr get-login-password --region ${this.options.region} | docker login --username AWS --password-stdin ${accountPart}.dkr.ecr.${this.options.region}.amazonaws.com`,
      ],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    const accountPart = this.options.accountId ?? '$(aws sts get-caller-identity --query Account --output text)';
    return {
      commands: [
        `aws ecr get-login-password --region ${this.options.region} | docker login --username AWS --password-stdin ${accountPart}.dkr.ecr.${this.options.region}.amazonaws.com`,
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    const accountPart = this.options.accountId ?? '$(aws sts get-caller-identity --query Account --output text)';
    return {
      commands: [
        `aws ecr get-login-password --region ${this.options.region} | docker login --username AWS --password-stdin ${accountPart}.dkr.ecr.${this.options.region}.amazonaws.com`,
      ],
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for Docker build step
 */
export interface DockerBuildStepOptions {
  /**
   * Path to the Dockerfile
   * @default './Dockerfile'
   */
  readonly dockerfile?: string;

  /**
   * Build context path
   * @default '.'
   */
  readonly context?: string;

  /**
   * Image name and tag
   * Example: 'myapp:latest' or 'registry.example.com/myapp:v1.0.0'
   */
  readonly tags: string[];

  /**
   * Build arguments
   * @default {}
   */
  readonly buildArgs?: Record<string, string>;

  /**
   * Target stage for multi-stage builds
   */
  readonly target?: string;

  /**
   * Platform(s) to build for
   * @default ['linux/amd64']
   */
  readonly platforms?: string[];

  /**
   * Enable BuildKit cache
   * @default true
   */
  readonly cache?: boolean;

  /**
   * Additional build options
   */
  readonly additionalOptions?: string[];
}

/**
 * Step to build a Docker image
 */
export class DockerBuildStep extends PipelineStep {
  constructor(project: Project, private readonly options: DockerBuildStepOptions) {
    super(project);
  }

  private buildDockerCommand(): string {
    const dockerfile = this.options.dockerfile ?? './Dockerfile';
    const context = this.options.context ?? '.';
    const tags = this.options.tags.map(tag => `-t ${tag}`).join(' ');
    const buildArgs = this.options.buildArgs
      ? Object.entries(this.options.buildArgs).map(([key, value]) => `--build-arg ${key}=${value}`).join(' ')
      : '';
    const target = this.options.target ? `--target ${this.options.target}` : '';
    const platforms = this.options.platforms?.join(',') ?? 'linux/amd64';
    const cache = this.options.cache !== false ? '--cache-from type=gha --cache-to type=gha,mode=max' : '';
    const additional = this.options.additionalOptions?.join(' ') ?? '';

    return `docker buildx build ${tags} -f ${dockerfile} ${buildArgs} ${target} --platform ${platforms} ${cache} ${additional} ${context}`.replace(/\s+/g, ' ').trim();
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [
        {
          name: 'Set up Docker Buildx',
          uses: 'docker/setup-buildx-action@v3',
        },
        {
          name: 'Build Docker image',
          uses: 'docker/build-push-action@v5',
          with: {
            context: this.options.context ?? '.',
            file: this.options.dockerfile ?? './Dockerfile',
            tags: this.options.tags.join(','),
            ...this.options.buildArgs && { 'build-args': Object.entries(this.options.buildArgs).map(([k, v]) => `${k}=${v}`).join('\n') },
            ...this.options.target && { target: this.options.target },
            platforms: this.options.platforms?.join(',') ?? 'linux/amd64',
            push: false,
            load: true,
            ...this.options.cache !== false && {
              'cache-from': 'type=gha',
              'cache-to': 'type=gha,mode=max',
            },
          },
        },
      ],
      needs: [],
      env: {},
      permissions: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: [
        'docker buildx create --use --driver docker-container || true',
        this.buildDockerCommand().replace('--cache-from type=gha --cache-to type=gha,mode=max', ''),
      ],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: [
        this.buildDockerCommand().replace('--cache-from type=gha --cache-to type=gha,mode=max', ''),
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      commands: [
        this.buildDockerCommand().replace('--cache-from type=gha --cache-to type=gha,mode=max', ''),
      ],
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for Docker tag step
 */
export interface DockerTagStepOptions {
  /**
   * Source image name and tag
   */
  readonly sourceImage: string;

  /**
   * Target tags to apply
   */
  readonly targetTags: string[];
}

/**
 * Step to tag a Docker image with additional tags
 */
export class DockerTagStep extends PipelineStep {
  constructor(project: Project, private readonly options: DockerTagStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: this.options.targetTags.map(tag => ({
        name: `Tag image as ${tag}`,
        run: `docker tag ${this.options.sourceImage} ${tag}`,
      })),
      needs: [],
      env: {},
      permissions: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: this.options.targetTags.map(tag => `docker tag ${this.options.sourceImage} ${tag}`),
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: this.options.targetTags.map(tag => `docker tag ${this.options.sourceImage} ${tag}`),
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      commands: this.options.targetTags.map(tag => `docker tag ${this.options.sourceImage} ${tag}`),
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for Docker push step
 */
export interface DockerPushStepOptions {
  /**
   * Image tags to push
   */
  readonly tags: string[];
}

/**
 * Step to push Docker image(s) to registry
 */
export class DockerPushStep extends PipelineStep {
  constructor(project: Project, private readonly options: DockerPushStepOptions) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: this.options.tags.map(tag => ({
        name: `Push image ${tag}`,
        run: `docker push ${tag}`,
      })),
      needs: [],
      env: {},
      permissions: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: this.options.tags.map(tag => `docker push ${tag}`),
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: this.options.tags.map(tag => `docker push ${tag}`),
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      commands: this.options.tags.map(tag => `docker push ${tag}`),
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for Trivy scan step
 */
export interface TrivyScanStepOptions {
  /**
   * Image to scan
   */
  readonly image: string;

  /**
   * Severity levels to report
   * @default ['CRITICAL', 'HIGH']
   */
  readonly severity?: string[];

  /**
   * Exit code when vulnerabilities are found
   * @default 1
   */
  readonly exitCode?: number;

  /**
   * Output format
   * @default 'table'
   */
  readonly format?: 'table' | 'json' | 'sarif';

  /**
   * Output file path (optional)
   */
  readonly outputFile?: string;

  /**
   * Scan type
   * @default 'image'
   */
  readonly scanType?: 'image' | 'fs' | 'config';

  /**
   * Ignore unfixed vulnerabilities
   * @default false
   */
  readonly ignoreUnfixed?: boolean;
}

/**
 * Step to scan Docker image with Trivy
 */
export class TrivyScanStep extends PipelineStep {
  constructor(project: Project, private readonly options: TrivyScanStepOptions) {
    super(project);
  }

  private buildTrivyCommand(): string {
    const severity = this.options.severity?.join(',') ?? 'CRITICAL,HIGH';
    const exitCode = this.options.exitCode ?? 1;
    const format = this.options.format ?? 'table';
    const output = this.options.outputFile ? `-o ${this.options.outputFile}` : '';
    const scanType = this.options.scanType ?? 'image';
    const ignoreUnfixed = this.options.ignoreUnfixed ? '--ignore-unfixed' : '';

    return `trivy ${scanType} --severity ${severity} --exit-code ${exitCode} --format ${format} ${output} ${ignoreUnfixed} ${this.options.image}`.replace(/\s+/g, ' ').trim();
  }

  public toGithub(): GithubStepConfig {
    return {
      steps: [
        {
          name: 'Run Trivy vulnerability scanner',
          uses: 'aquasecurity/trivy-action@master',
          with: {
            'image-ref': this.options.image,
            'format': this.options.format ?? 'table',
            'exit-code': (this.options.exitCode ?? 1).toString(),
            'severity': this.options.severity?.join(',') ?? 'CRITICAL,HIGH',
            ...this.options.outputFile && { output: this.options.outputFile },
            ...this.options.ignoreUnfixed && { 'ignore-unfixed': 'true' },
          },
        },
      ],
      needs: [],
      env: {},
      permissions: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      commands: [
        'wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -',
        'echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list',
        'apt-get update && apt-get install -y trivy',
        this.buildTrivyCommand(),
      ],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: [
        this.buildTrivyCommand(),
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      commands: [
        this.buildTrivyCommand(),
      ],
      needs: [],
      env: {},
    };
  }
}

/**
 * Options for AWS Inspector SBOM generation step
 */
export interface AwsInspectorSbomStepOptions {
  /**
   * Image to generate SBOM for
   */
  readonly image: string;

  /**
   * AWS region
   */
  readonly region: string;

  /**
   * ECR repository name (if using ECR)
   */
  readonly repositoryName?: string;

  /**
   * Output file for SBOM
   * @default 'sbom.json'
   */
  readonly outputFile?: string;

  /**
   * SBOM format
   * @default 'cyclonedx'
   */
  readonly format?: 'cyclonedx' | 'spdx';

  /**
   * IAM role to assume for AWS Inspector
   */
  readonly roleArn?: string;
}

/**
 * Step to generate SBOM using AWS Inspector
 */
export class AwsInspectorSbomStep extends StepSequence {
  constructor(project: Project, options: AwsInspectorSbomStepOptions) {
    const steps: PipelineStep[] = [];

    // Add role assumption if specified
    if (options.roleArn) {
      steps.push(new AwsAssumeRoleStep(project, {
        roleArn: options.roleArn,
        region: options.region,
      }));
    }

    // Add SBOM generation step
    steps.push(new AwsInspectorSbomStepImpl(project, options));

    super(project, steps);
  }
}

/**
 * Internal implementation of AWS Inspector SBOM generation
 */
class AwsInspectorSbomStepImpl extends PipelineStep {
  private readonly options: AwsInspectorSbomStepOptions;

  constructor(project: Project, options: AwsInspectorSbomStepOptions) {
    super(project);
    this.options = options;
  }

  public toGithub(): GithubStepConfig {
    const outputFile = this.options.outputFile ?? 'sbom.json';
    return {
      steps: [{
        name: 'Generate SBOM with AWS Inspector',
        run: `
          # Install Inspector SBOM generator
          curl -Lo inspector-sbomgen https://inspector-sbomgen-releases-${this.options.region}.s3.${this.options.region}.amazonaws.com/latest/linux/amd64/inspector-sbomgen
          chmod +x inspector-sbomgen

          # Generate SBOM
          ./inspector-sbomgen ${this.options.format ?? 'cyclonedx'} -i ${this.options.image} -o ${outputFile}

          echo "SBOM generated at ${outputFile}"
        `.trim(),
      }],
      needs: [],
      env: {},
      permissions: {
        idToken: JobPermission.WRITE,
      },
    };
  }

  public toGitlab(): GitlabStepConfig {
    const outputFile = this.options.outputFile ?? 'sbom.json';
    return {
      extensions: [],
      commands: [
        `curl -Lo inspector-sbomgen https://inspector-sbomgen-releases-${this.options.region}.s3.${this.options.region}.amazonaws.com/latest/linux/amd64/inspector-sbomgen`,
        'chmod +x inspector-sbomgen',
        `./inspector-sbomgen ${this.options.format ?? 'cyclonedx'} -i ${this.options.image} -o ${outputFile}`,
        `echo "SBOM generated at ${outputFile}"`,
      ],
      needs: [],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    const outputFile = this.options.outputFile ?? 'sbom.json';
    return {
      commands: [
        `curl -Lo inspector-sbomgen https://inspector-sbomgen-releases-${this.options.region}.s3.${this.options.region}.amazonaws.com/latest/linux/amd64/inspector-sbomgen`,
        'chmod +x inspector-sbomgen',
        `./inspector-sbomgen ${this.options.format ?? 'cyclonedx'} -i ${this.options.image} -o ${outputFile}`,
        `echo "SBOM generated at ${outputFile}"`,
      ],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    const outputFile = this.options.outputFile ?? 'sbom.json';
    return {
      commands: [
        `curl -Lo inspector-sbomgen https://inspector-sbomgen-releases-${this.options.region}.s3.${this.options.region}.amazonaws.com/latest/linux/amd64/inspector-sbomgen`,
        'chmod +x inspector-sbomgen',
        `./inspector-sbomgen ${this.options.format ?? 'cyclonedx'} -i ${this.options.image} -o ${outputFile}`,
        `echo "SBOM generated at ${outputFile}"`,
      ],
      needs: [],
      env: {},
    };
  }
}
