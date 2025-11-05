import { Project } from 'projen';
import {
  AwsInspectorSbomStep,
  DockerBuildStep,
  DockerHubLoginStep,
  DockerPushStep,
  DockerTagStep,
  EcrLoginStep,
  HarborLoginStep,
  TrivyScanStep,
} from '../src';

describe('Container Build Steps', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({ name: 'test-project' });
  });

  test('DockerHubLoginStep generates correct configurations', () => {
    const step = new DockerHubLoginStep(project, {
      username: '${{ secrets.DOCKERHUB_USERNAME }}',
      password: '${{ secrets.DOCKERHUB_TOKEN }}',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('HarborLoginStep generates correct configurations', () => {
    const step = new HarborLoginStep(project, {
      registryUrl: 'harbor.example.com',
      username: '${{ secrets.HARBOR_USERNAME }}',
      password: '${{ secrets.HARBOR_PASSWORD }}',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('EcrLoginStep generates correct configurations', () => {
    const step = new EcrLoginStep(project, {
      region: 'us-east-1',
      accountId: '123456789012',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('EcrLoginStep with role ARN', () => {
    const step = new EcrLoginStep(project, {
      region: 'us-east-1',
      accountId: '123456789012',
      roleArn: 'arn:aws:iam::123456789012:role/ECRAccessRole',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('DockerBuildStep generates correct configurations', () => {
    const step = new DockerBuildStep(project, {
      tags: ['myapp:latest', 'myapp:v1.0.0'],
      dockerfile: './Dockerfile',
      context: '.',
      buildArgs: {
        NODE_VERSION: '20',
        BUILD_ENV: 'production',
      },
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('DockerBuildStep with multi-stage and platforms', () => {
    const step = new DockerBuildStep(project, {
      tags: ['myapp:latest'],
      target: 'production',
      platforms: ['linux/amd64', 'linux/arm64'],
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('DockerTagStep generates correct configurations', () => {
    const step = new DockerTagStep(project, {
      sourceImage: 'myapp:build',
      targetTags: ['myapp:latest', 'myapp:v1.0.0', 'registry.example.com/myapp:latest'],
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('DockerPushStep generates correct configurations', () => {
    const step = new DockerPushStep(project, {
      tags: ['myapp:latest', 'myapp:v1.0.0', 'registry.example.com/myapp:latest'],
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('TrivyScanStep generates correct configurations', () => {
    const step = new TrivyScanStep(project, {
      image: 'myapp:latest',
      severity: ['CRITICAL', 'HIGH'],
      format: 'sarif',
      outputFile: 'trivy-results.sarif',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('TrivyScanStep with ignore unfixed', () => {
    const step = new TrivyScanStep(project, {
      image: 'myapp:latest',
      ignoreUnfixed: true,
      exitCode: 0,
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });

  test('AwsInspectorSbomStep generates correct configurations', () => {
    const step = new AwsInspectorSbomStep(project, {
      image: 'myapp:latest',
      region: 'us-east-1',
      format: 'cyclonedx',
      outputFile: 'sbom.json',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
    expect(step.toBash()).toMatchSnapshot();
  });

  test('AwsInspectorSbomStep with role ARN', () => {
    const step = new AwsInspectorSbomStep(project, {
      image: 'myapp:latest',
      region: 'us-east-1',
      roleArn: 'arn:aws:iam::123456789012:role/InspectorRole',
      format: 'spdx',
    });

    expect(step.toGithub()).toMatchSnapshot();
    expect(step.toGitlab()).toMatchSnapshot();
  });
});
