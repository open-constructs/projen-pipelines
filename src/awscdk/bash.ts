import { awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions } from './base';

export interface BashCDKPipelineOptions extends CDKPipelineOptions {
  //
}

export class BashCDKPipeline extends CDKPipeline {

  constructor(app: awscdk.AwsCdkTypeScriptApp, options: BashCDKPipelineOptions) {
    super(app, options);

    // TODO automatically write pipeline.md explaining the generated scripts

  }

}

