import { Project, TextFile } from 'projen';
import { PipelineEngine } from '../engine';
import { TerraformPipeline, TerraformPipelineOptions } from './base';

export class BashTerraformPipeline extends TerraformPipeline {
  constructor(project: Project, options: TerraformPipelineOptions) {
    super(project, options);

    const readme = new TextFile(this, 'pipeline.md', { lines: [] });

    readme.addLine('# How to run your pipeline');
    readme.addLine('');
    readme.addLine('## Build phase');
    readme.addLine('');

    readme.addLine('Plan your Terraform project:');
    readme.addLine('```bash');
    readme.addLine(`${this.providePlanStep().toBash().commands.join('\n')}`);
    readme.addLine('```');
    readme.addLine('');

    readme.addLine('Deploy your Terraform project:');
    readme.addLine('```bash');
    readme.addLine(`${this.provideDeployStep().toBash().commands.join('\n')}`);
    readme.addLine('```');
    readme.addLine('');
  }

  public engineType(): PipelineEngine {
    return PipelineEngine.BASH;
  }

}
