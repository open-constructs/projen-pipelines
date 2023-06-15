import { awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions, Environment } from '../pipeline';

export interface SynthStageOptions {
  readonly commands: string[];
}

export interface AssetUploadStageOptions {
  readonly commands: string[];
}

export interface DeployStageOptions {
  readonly stageName: string;
  readonly commands: string[];
  readonly env: Environment;
}

export abstract class BaseEngine {
  constructor(protected app: awscdk.AwsCdkTypeScriptApp, protected props: CDKPipelineOptions, protected pipeline: CDKPipeline) {


  }

  abstract createSynth(options: SynthStageOptions): void;
  abstract createAssetUpload(options: AssetUploadStageOptions): void;
  abstract createDeployment(options: DeployStageOptions): void;

}