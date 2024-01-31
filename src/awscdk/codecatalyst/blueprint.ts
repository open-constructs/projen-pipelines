import { Blueprint as ParentBlueprint, Options as ParentOptions } from '@amazon-codecatalyst/blueprints.blueprint';

/**
This file is only required because the Blueprint API needs it
 */
export interface Options extends ParentOptions {

  /**
   * The main API id
   * @displayName This is the main API id (required)
   * @validationRegex /^[a-zA-Z0-9_]+$/
   * @validationMessage Must contain only upper and lowercase letters, numbers and underscores
   */
  mainApiId?: string;

  /**
   * The sub-api path to add
   * @displayName This is the sub-api path to add
   * @validationRegex /^[a-zA-Z0-9_]+$/
   * @validationMessage Must contain only upper and lowercase letters, numbers and underscores
   * @defaultEntropy 5
   */
  subApiPath?: string;

}

export class Blueprint extends ParentBlueprint {
  constructor(options_: Options) {
    super(options_);
    //this.context.environmentId = 'prod';
  }

}
