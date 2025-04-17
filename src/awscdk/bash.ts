import { TextFile, awscdk } from 'projen';
import { CdkDiffType, CDKPipeline, CDKPipelineOptions } from './base';
import { PipelineEngine } from '../engine';

export interface BashCDKPipelineOptions extends CDKPipelineOptions {
  //
}

export class BashCDKPipeline extends CDKPipeline {

  constructor(app: awscdk.AwsCdkTypeScriptApp, options: BashCDKPipelineOptions) {
    super(app, options);

    const readme = new TextFile(this, 'pipeline.md', { lines: [] });

    readme.addLine('# How to run your pipeline');
    readme.addLine('');
    readme.addLine('## Build phase');
    readme.addLine('');

    readme.addLine('Synthesize your CDK project:');
    readme.addLine('```bash');
    readme.addLine(`${this.provideInstallStep().toBash().commands.join('\n')}`);
    readme.addLine(`${this.provideSynthStep().toBash().commands.join('\n')}`);
    readme.addLine('```');
    readme.addLine('');

    readme.addLine('Publish all your CDK assets like Lambda function code and container images:');
    readme.addLine('```bash');
    readme.addLine(`${this.provideInstallStep().toBash().commands.join('\n')}`);
    readme.addLine(`${this.provideAssetUploadStep().toBash().commands.join('\n')}`);
    readme.addLine('```');
    readme.addLine('');
    readme.addLine('If you want to store your cloud assembly and assets for future use or compliance reasons, use:');
    readme.addLine('```bash');
    readme.addLine(`${this.provideInstallStep().toBash().commands.join('\n')}`);
    readme.addLine(`${this.provideAssetUploadStep().toBash().commands.join('\n')}`);
    if (this.baseOptions.pkgNamespace) {
      readme.addLine(`${this.provideAssemblyUploadStep().toBash().commands.join('\n')}`);
    }
    readme.addLine('```');
    readme.addLine('');
    readme.addLine('## Deployment phase');
    readme.addLine('');
    readme.addLine('For every stage some scripts are generated for diff and deploy');
    readme.addLine('');

    for (const stage of options.stages) {
      readme.addLine(`Stage: ${stage.name}`);
      readme.addLine('```bash');
      if (stage.diffType !== CdkDiffType.NONE) {
        readme.addLine(`${this.provideDiffStep(stage, stage.diffType == CdkDiffType.FAST).toBash().commands.join('\n')}`);
        readme.addLine('');
      }
      readme.addLine(`${this.provideDeployStep(stage).toBash().commands.join('\n')}`);
      readme.addLine('```');
      readme.addLine('');
    }

    readme.addLine('The stage `personal` is meant to be deployed manually by the developer and also has a watch script for live updates.');
    readme.addLine('```bash');
    readme.addLine('npx projen diff:personal');
    readme.addLine('npx projen deploy:personal');
    readme.addLine('npx projen destroy:personal');
    readme.addLine('npx projen watch:personal');
    readme.addLine('```');
    readme.addLine('');
    readme.addLine('The stage `feature` is meant to be deployed for feature branches.');
    readme.addLine('```bash');
    readme.addLine('npx projen diff:feature');
    readme.addLine('npx projen deploy:feature');
    readme.addLine('npx projen destroy:feature');
    readme.addLine('```');
    readme.addLine('');

  }

  public engineType(): PipelineEngine {
    return PipelineEngine.BASH;
  }

}
