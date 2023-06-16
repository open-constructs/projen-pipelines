import { awscdk } from 'projen';
import { CDKPipeline, CDKPipelineOptions, DeploymentStage } from '../pipeline';

export interface SynthStageOptions {
  readonly commands: string[];
}

export interface AssetUploadStageOptions {
  readonly commands: string[];
}

export interface DeployStageOptions {
  readonly config: DeploymentStage;
  readonly installCommands: string[];
  readonly deployCommands: string[];
}

export abstract class BaseEngine {

  public abstract readonly needsVersionedArtifacts: boolean;

  constructor(protected app: awscdk.AwsCdkTypeScriptApp, protected props: CDKPipelineOptions, protected pipeline: CDKPipeline) {
    //
  }

  abstract createSynth(options: SynthStageOptions): void;
  abstract createAssetUpload(options: AssetUploadStageOptions): void;
  abstract createDeployment(options: DeployStageOptions): void;

}