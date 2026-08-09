import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ResourceCounter, ResourceCountResult } from '../src/awscdk/count-resources';

describe('ResourceCounter', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), 'count-resources-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function createCloudAssembly(stacks: Record<string, number>): string {
    const cdkOutDir = path.join(tmpDir, 'cdk.out');
    mkdirSync(cdkOutDir, { recursive: true });

    const artifacts: Record<string, any> = {};
    for (const [stackName, resourceCount] of Object.entries(stacks)) {
      const templateFile = `${stackName}.template.json`;
      artifacts[stackName] = {
        type: 'aws:cloudformation:stack',
        properties: {
          templateFile,
        },
      };

      // Create a template with the specified number of resources
      const resources: Record<string, any> = {};
      for (let i = 0; i < resourceCount; i++) {
        resources[`Resource${i}`] = {
          Type: 'AWS::CloudFormation::WaitConditionHandle',
        };
      }
      writeFileSync(
        path.join(cdkOutDir, templateFile),
        JSON.stringify({ Resources: resources }),
      );
    }

    writeFileSync(
      path.join(cdkOutDir, 'manifest.json'),
      JSON.stringify({ artifacts }),
    );

    return cdkOutDir;
  }

  test('counts resources in a single stack', () => {
    const cdkOut = createCloudAssembly({ MyStack: 10 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks).toHaveLength(1);
    expect(result.stacks[0].stackName).toBe('MyStack');
    expect(result.stacks[0].resourceCount).toBe(10);
    expect(result.stacks[0].resourceLimit).toBe(500);
    expect(result.stacks[0].warningThreshold).toBe(450);
    expect(result.stacks[0].warning).toBe(false);
    expect(result.stacks[0].exceeded).toBe(false);
    expect(result.stacks[0].percentUsed).toBe(2);
    expect(result.hasWarnings).toBe(false);
    expect(result.hasExceeded).toBe(false);
  });

  test('counts resources in multiple stacks', () => {
    const cdkOut = createCloudAssembly({
      StackA: 100,
      StackB: 200,
      StackC: 50,
    });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks).toHaveLength(3);
    expect(result.stacks.find(s => s.stackName === 'StackA')?.resourceCount).toBe(100);
    expect(result.stacks.find(s => s.stackName === 'StackB')?.resourceCount).toBe(200);
    expect(result.stacks.find(s => s.stackName === 'StackC')?.resourceCount).toBe(50);
    expect(result.hasWarnings).toBe(false);
    expect(result.hasExceeded).toBe(false);
  });

  test('reports warning when stack exceeds warning threshold', () => {
    const cdkOut = createCloudAssembly({ BigStack: 460 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks[0].warning).toBe(true);
    expect(result.stacks[0].exceeded).toBe(false);
    expect(result.hasWarnings).toBe(true);
    expect(result.hasExceeded).toBe(false);
  });

  test('reports exceeded when stack reaches the resource limit', () => {
    const cdkOut = createCloudAssembly({ HugeStack: 500 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks[0].warning).toBe(true);
    expect(result.stacks[0].exceeded).toBe(true);
    expect(result.hasWarnings).toBe(true);
    expect(result.hasExceeded).toBe(true);
  });

  test('reports exceeded when stack exceeds the resource limit', () => {
    const cdkOut = createCloudAssembly({ OverStack: 510 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks[0].exceeded).toBe(true);
    expect(result.stacks[0].percentUsed).toBe(102);
    expect(result.hasExceeded).toBe(true);
  });

  test('uses custom warning threshold and resource limit', () => {
    const cdkOut = createCloudAssembly({ CustomStack: 85 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 80,
      resourceLimit: 100,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks[0].warning).toBe(true);
    expect(result.stacks[0].exceeded).toBe(false);
    expect(result.stacks[0].percentUsed).toBe(85);
    expect(result.stacks[0].resourceLimit).toBe(100);
    expect(result.stacks[0].warningThreshold).toBe(80);
  });

  test('handles stacks with no resources', () => {
    const cdkOut = createCloudAssembly({ EmptyStack: 0 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks[0].resourceCount).toBe(0);
    expect(result.stacks[0].percentUsed).toBe(0);
    expect(result.stacks[0].warning).toBe(false);
    expect(result.stacks[0].exceeded).toBe(false);
  });

  test('skips non-stack artifacts in manifest', () => {
    const cdkOut = path.join(tmpDir, 'cdk.out');
    mkdirSync(cdkOut, { recursive: true });

    const manifest = {
      artifacts: {
        Tree: {
          type: 'cdk:tree',
          properties: { file: 'tree.json' },
        },
        MyStack: {
          type: 'aws:cloudformation:stack',
          properties: { templateFile: 'MyStack.template.json' },
        },
        AssetManifest: {
          type: 'cdk:asset-manifest',
          properties: { file: 'assets.json' },
        },
      },
    };

    writeFileSync(path.join(cdkOut, 'manifest.json'), JSON.stringify(manifest));
    writeFileSync(
      path.join(cdkOut, 'MyStack.template.json'),
      JSON.stringify({ Resources: { Bucket: { Type: 'AWS::S3::Bucket' } } }),
    );

    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    // Should only count the CloudFormation stack, not the tree or asset manifest
    expect(result.stacks).toHaveLength(1);
    expect(result.stacks[0].stackName).toBe('MyStack');
    expect(result.stacks[0].resourceCount).toBe(1);
  });

  test('handles template without Resources key', () => {
    const cdkOut = path.join(tmpDir, 'cdk.out');
    mkdirSync(cdkOut, { recursive: true });

    const manifest = {
      artifacts: {
        NoResources: {
          type: 'aws:cloudformation:stack',
          properties: { templateFile: 'NoResources.template.json' },
        },
      },
    };

    writeFileSync(path.join(cdkOut, 'manifest.json'), JSON.stringify(manifest));
    writeFileSync(
      path.join(cdkOut, 'NoResources.template.json'),
      JSON.stringify({ AWSTemplateFormatVersion: '2010-09-09' }),
    );

    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks).toHaveLength(1);
    expect(result.stacks[0].resourceCount).toBe(0);
  });

  test('writes results to output file', () => {
    const cdkOut = createCloudAssembly({ TestStack: 25 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    counter.run();

    const written: ResourceCountResult = JSON.parse(readFileSync(outputFile, 'utf8'));
    expect(written.stacks).toHaveLength(1);
    expect(written.stacks[0].stackName).toBe('TestStack');
    expect(written.stacks[0].resourceCount).toBe(25);
    expect(written.hasWarnings).toBe(false);
    expect(written.hasExceeded).toBe(false);
  });

  test('throws error when manifest is not found', () => {
    const nonExistentDir = path.join(tmpDir, 'does-not-exist');
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: nonExistentDir,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    expect(() => counter.run()).toThrow('Cloud assembly manifest not found');
  });

  test('handles manifest with empty artifacts', () => {
    const cdkOut = path.join(tmpDir, 'cdk.out');
    mkdirSync(cdkOut, { recursive: true });

    writeFileSync(
      path.join(cdkOut, 'manifest.json'),
      JSON.stringify({ artifacts: {} }),
    );

    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks).toHaveLength(0);
    expect(result.hasWarnings).toBe(false);
    expect(result.hasExceeded).toBe(false);
  });

  test('handles manifest with no artifacts key', () => {
    const cdkOut = path.join(tmpDir, 'cdk.out');
    mkdirSync(cdkOut, { recursive: true });

    writeFileSync(
      path.join(cdkOut, 'manifest.json'),
      JSON.stringify({ version: '1.0.0' }),
    );

    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks).toHaveLength(0);
    expect(result.hasWarnings).toBe(false);
    expect(result.hasExceeded).toBe(false);
  });

  test('correctly calculates percentUsed at boundary values', () => {
    const cdkOut = createCloudAssembly({ ExactThreshold: 450 });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks[0].resourceCount).toBe(450);
    expect(result.stacks[0].percentUsed).toBe(90);
    // At exactly the threshold, warning should be true
    expect(result.stacks[0].warning).toBe(true);
    expect(result.stacks[0].exceeded).toBe(false);
  });

  test('mixed stacks with some warning and some exceeded', () => {
    const cdkOut = createCloudAssembly({
      OkStack: 100,
      WarnStack: 460,
      ExceededStack: 510,
    });
    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    expect(result.stacks).toHaveLength(3);

    const okStack = result.stacks.find(s => s.stackName === 'OkStack')!;
    expect(okStack.warning).toBe(false);
    expect(okStack.exceeded).toBe(false);

    const warnStack = result.stacks.find(s => s.stackName === 'WarnStack')!;
    expect(warnStack.warning).toBe(true);
    expect(warnStack.exceeded).toBe(false);

    const exceededStack = result.stacks.find(s => s.stackName === 'ExceededStack')!;
    expect(exceededStack.warning).toBe(true);
    expect(exceededStack.exceeded).toBe(true);

    expect(result.hasWarnings).toBe(true);
    expect(result.hasExceeded).toBe(true);
  });

  test('skips stack when template file is missing', () => {
    const cdkOut = path.join(tmpDir, 'cdk.out');
    mkdirSync(cdkOut, { recursive: true });

    const manifest = {
      artifacts: {
        MissingTemplate: {
          type: 'aws:cloudformation:stack',
          properties: { templateFile: 'MissingTemplate.template.json' },
        },
        ValidStack: {
          type: 'aws:cloudformation:stack',
          properties: { templateFile: 'ValidStack.template.json' },
        },
      },
    };

    writeFileSync(path.join(cdkOut, 'manifest.json'), JSON.stringify(manifest));
    // Only create the valid stack template
    writeFileSync(
      path.join(cdkOut, 'ValidStack.template.json'),
      JSON.stringify({ Resources: { Bucket: { Type: 'AWS::S3::Bucket' } } }),
    );

    const outputFile = path.join(tmpDir, 'results.json');

    const counter = new ResourceCounter({
      cloudAssemblyDir: cdkOut,
      warningThreshold: 450,
      resourceLimit: 500,
      outputFile,
      githubSummary: false,
    });

    const result = counter.run();

    // Should only have the valid stack (missing template is skipped with a warning)
    expect(result.stacks).toHaveLength(1);
    expect(result.stacks[0].stackName).toBe('ValidStack');
  });

  test('writes GitHub summary when GITHUB_STEP_SUMMARY is set', () => {
    const cdkOut = createCloudAssembly({ SummaryStack: 460 });
    const outputFile = path.join(tmpDir, 'results.json');
    const summaryFile = path.join(tmpDir, 'summary.md');

    // Set the environment variable for GitHub summary
    const originalEnv = process.env.GITHUB_STEP_SUMMARY;
    process.env.GITHUB_STEP_SUMMARY = summaryFile;

    // Create the summary file (GitHub Actions creates it before the step runs)
    writeFileSync(summaryFile, '');

    try {
      const counter = new ResourceCounter({
        cloudAssemblyDir: cdkOut,
        warningThreshold: 450,
        resourceLimit: 500,
        outputFile,
        githubSummary: true,
      });

      counter.run();

      const summary = readFileSync(summaryFile, 'utf8');
      expect(summary).toContain('CloudFormation Resource Count');
      expect(summary).toContain('SummaryStack');
      expect(summary).toContain('Warning');
    } finally {
      process.env.GITHUB_STEP_SUMMARY = originalEnv;
    }
  });
});
