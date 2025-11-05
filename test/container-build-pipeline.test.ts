import { Project, Testing } from 'projen';
import { GitHubProject } from 'projen/lib/github';
import { GithubContainerBuildPipeline, GitlabContainerBuildPipeline } from '../src';

describe('Container Build Pipeline', () => {
  describe('GitHub Container Build Pipeline', () => {
    test('creates basic pipeline with single stage', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      new GithubContainerBuildPipeline(project, {
        buildConfig: {
          dockerfile: './Dockerfile',
          context: '.',
        },
        tagging: {
          imageName: 'myapp',
          tagWithCommitSha: true,
          tagWithBranch: true,
        },
        stages: [
          {
            name: 'production',
            registries: [
              {
                type: 'dockerhub',
                usernameSecret: '${{ secrets.DOCKERHUB_USERNAME }}',
                passwordSecret: '${{ secrets.DOCKERHUB_TOKEN }}',
              },
            ],
          },
        ],
      });

      const snapshot = Testing.synth(project);
      expect(snapshot['.github/workflows/container-build.yml']).toMatchSnapshot();
    });

    test('creates pipeline with multiple stages and registries', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      new GithubContainerBuildPipeline(project, {
        buildConfig: {
          dockerfile: './Dockerfile',
          context: '.',
          buildArgs: {
            NODE_VERSION: '20',
          },
          platforms: ['linux/amd64', 'linux/arm64'],
        },
        tagging: {
          imageName: 'myapp',
          tagWithCommitSha: true,
          tagWithBranch: true,
          includeLatest: true,
        },
        stages: [
          {
            name: 'staging',
            registries: [
              {
                type: 'ecr',
                region: 'us-east-1',
                accountId: '123456789012',
              },
            ],
            scan: {
              trivy: true,
              trivySeverity: ['CRITICAL', 'HIGH'],
            },
          },
          {
            name: 'production',
            registries: [
              {
                type: 'dockerhub',
                usernameSecret: '${{ secrets.DOCKERHUB_USERNAME }}',
                passwordSecret: '${{ secrets.DOCKERHUB_TOKEN }}',
              },
              {
                type: 'harbor',
                url: 'harbor.example.com',
                usernameSecret: '${{ secrets.HARBOR_USERNAME }}',
                passwordSecret: '${{ secrets.HARBOR_PASSWORD }}',
              },
            ],
            manualApproval: true,
            scan: {
              trivy: true,
              awsInspectorSbom: true,
              awsInspectorRegion: 'us-east-1',
            },
          },
        ],
      });

      const snapshot = Testing.synth(project);
      expect(snapshot['.github/workflows/container-build.yml']).toMatchSnapshot();
    });

    test('creates pipeline with feature branch support', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      new GithubContainerBuildPipeline(project, {
        buildConfig: {
          dockerfile: './Dockerfile',
        },
        tagging: {
          imageName: 'myapp',
          tagWithCommitSha: true,
        },
        stages: [
          {
            name: 'production',
            registries: [
              {
                type: 'ecr',
                region: 'us-east-1',
              },
            ],
          },
        ],
        enableFeatureBranches: true,
        featureBranchRegistry: {
          type: 'ecr',
          region: 'us-east-1',
          accountId: '123456789012',
        },
      });

      const snapshot = Testing.synth(project);
      expect(snapshot['.github/workflows/container-build.yml']).toMatchSnapshot();
      expect(snapshot['.github/workflows/container-build-feature.yml']).toMatchSnapshot();
    });

    test('validates configuration - requires at least one stage', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      expect(() => {
        new GithubContainerBuildPipeline(project, {
          buildConfig: {
            dockerfile: './Dockerfile',
          },
          tagging: {
            imageName: 'myapp',
          },
          stages: [],
        });
      }).toThrow('At least one stage must be defined');
    });

    test('validates configuration - requires at least one registry per stage', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      expect(() => {
        new GithubContainerBuildPipeline(project, {
          buildConfig: {
            dockerfile: './Dockerfile',
          },
          tagging: {
            imageName: 'myapp',
          },
          stages: [
            {
              name: 'production',
              registries: [],
            },
          ],
        });
      }).toThrow("Stage 'production' must have at least one registry configured");
    });

    test('validates configuration - ECR requires region', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      expect(() => {
        new GithubContainerBuildPipeline(project, {
          buildConfig: {
            dockerfile: './Dockerfile',
          },
          tagging: {
            imageName: 'myapp',
          },
          stages: [
            {
              name: 'production',
              registries: [
                {
                  type: 'ecr',
                } as any,
              ],
            },
          ],
        });
      }).toThrow("ECR registry in stage 'production' must specify a region");
    });

    test('validates configuration - Harbor requires URL', () => {
      const project = new GitHubProject({
        name: 'test-container-project',
      });

      expect(() => {
        new GithubContainerBuildPipeline(project, {
          buildConfig: {
            dockerfile: './Dockerfile',
          },
          tagging: {
            imageName: 'myapp',
          },
          stages: [
            {
              name: 'production',
              registries: [
                {
                  type: 'harbor',
                  usernameSecret: '$USERNAME',
                  passwordSecret: '$PASSWORD',
                } as any,
              ],
            },
          ],
        });
      }).toThrow("Harbor registry in stage 'production' must specify a URL");
    });
  });

  describe('GitLab Container Build Pipeline', () => {
    test('creates basic pipeline with single stage', () => {
      const project = new Project({
        name: 'test-container-project',
      });

      new GitlabContainerBuildPipeline(project, {
        buildConfig: {
          dockerfile: './Dockerfile',
          context: '.',
        },
        tagging: {
          imageName: 'myapp',
          tagWithCommitSha: true,
          tagWithBranch: true,
        },
        stages: [
          {
            name: 'production',
            registries: [
              {
                type: 'dockerhub',
                usernameSecret: '$DOCKERHUB_USERNAME',
                passwordSecret: '$DOCKERHUB_TOKEN',
              },
            ],
          },
        ],
      });

      const snapshot = Testing.synth(project);
      expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
    });

    test('creates pipeline with multiple stages', () => {
      const project = new Project({
        name: 'test-container-project',
      });

      new GitlabContainerBuildPipeline(project, {
        buildConfig: {
          dockerfile: './Dockerfile',
          buildArgs: {
            NODE_VERSION: '20',
          },
        },
        tagging: {
          imageName: 'myapp',
          tagWithCommitSha: true,
          includeLatest: true,
        },
        stages: [
          {
            name: 'staging',
            registries: [
              {
                type: 'ecr',
                region: 'us-east-1',
              },
            ],
            scan: {
              trivy: true,
            },
          },
          {
            name: 'production',
            registries: [
              {
                type: 'harbor',
                url: 'harbor.example.com',
                usernameSecret: '$HARBOR_USERNAME',
                passwordSecret: '$HARBOR_PASSWORD',
              },
            ],
            manualApproval: true,
            scan: {
              awsInspectorSbom: true,
              awsInspectorRegion: 'us-east-1',
            },
          },
        ],
      });

      const snapshot = Testing.synth(project);
      expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
    });

    test('creates pipeline with feature branch support', () => {
      const project = new Project({
        name: 'test-container-project',
      });

      new GitlabContainerBuildPipeline(project, {
        buildConfig: {
          dockerfile: './Dockerfile',
        },
        tagging: {
          imageName: 'myapp',
          tagWithCommitSha: true,
        },
        stages: [
          {
            name: 'production',
            registries: [
              {
                type: 'ecr',
                region: 'us-east-1',
              },
            ],
          },
        ],
        enableFeatureBranches: true,
        featureBranchRegistry: {
          type: 'ecr',
          region: 'us-east-1',
        },
      });

      const snapshot = Testing.synth(project);
      expect(snapshot['.gitlab-ci.yml']).toMatchSnapshot();
    });
  });
});
