import { SampleWorkspaces, Workspace, WorkspaceDefinition } from '@amazon-codecatalyst/blueprint-component.dev-environments';
import { Environment, EnvironmentDefinition, AccountConnection, Role } from '@amazon-codecatalyst/blueprint-component.environments';
import { SourceRepository, SourceFile, SubstitionAsset, File } from '@amazon-codecatalyst/blueprint-component.source-repositories';
import { Workflow, WorkflowBuilder, convertToWorkflowEnvironment } from '@amazon-codecatalyst/blueprint-component.workflows';
import { MergeStrategies, Blueprint as ParentBlueprint, Options as ParentOptions } from '@amazon-codecatalyst/blueprints.blueprint';
import defaults from './defaults.json';

/**
 * This is the 'Options' interface. The 'Options' interface is interpreted by the wizard to dynamically generate a selection UI.
 * 1. It MUST be called 'Options' in order to be interpreted by the wizard
 * 2. This is how you control the fields that show up on a wizard selection panel. Keeping this small leads to a better user experience.
 * 3. You can use JSDOCs and annotations such as: '?', @advanced, @hidden, @display - textarea, etc. to control how the wizard displays certain fields.
 * 4. All required members of 'Options' must be defined in 'defaults.json' to synth your blueprint locally
 * 5. The 'Options' member values defined in 'defaults.json' will be used to populate the wizard selection panel with default values
 */
export interface Options extends ParentOptions {
  /**
   * Set up environment to deploy to
   * This is optional
   * @displayName Choose environment to deploy to
   */
  environment?: EnvironmentDefinition<{
    /**
     * Select an AWS account connection that will be used for deployment
     * @displayName Select account connection
     */
    awsAccount: AccountConnection<{
      /**
       * Role on my aws account. I can ask for multiple roles per account.
       * e.g. here's a copy-pastable policy: [to a link]
       * @displayName This role has an overriden name
       */
      role: Role<[]>;
    }>;
  }>;

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

/**
 * This is the actual blueprint class.
 * 1. This MUST be the only 'class' exported, as 'Blueprint'
 * 2. This Blueprint should extend another ParentBlueprint
 */
export class Blueprint extends ParentBlueprint {
  constructor(options_: Options) {
    super(options_);
    console.log(defaults);
    // helpful typecheck for defaults
    const typeCheck: Options = {
      outdir: this.outdir,
      ...defaults,
      mainApiId: 'TBD',
      subApiPath: 'sub-path',
    };
    const options = Object.assign(typeCheck, options_);

    var repositories = this.context.project.src.listRepositoryNames();
    if (repositories.length>1) {
      console.error('Illegal State: More than one repository in current project found: '+repositories);
      throw new Error('Illegal State: More than one repository in current project found: '+repositories);
    }
    if (repositories.length==0) {
      console.error('Illegal State: This Custom Blue Print cannot be applied on a project without source repository: '+repositories);
      //throw new Error('Illegal State: This Custom Blue Print cannot be applied on a project without source repository: '+repositories);
      repositories[0] = 'source';
    }
    // add a repository
    const repository = new SourceRepository(this, { title: repositories[0] });

    // add some code to my repository by copying everything in static-assets

    SubstitionAsset.findAll('*.md').forEach(asset => {
      new SourceFile(repository, asset.path(), asset.substitute({ subApiPath: options.subApiPath }).toString());
    });
    SubstitionAsset.findAll('**/constructs/*.ts').forEach(asset => {
      new SourceFile(repository, 'src/'+asset.path(), asset.substitute({ mainApiId: options.mainApiId }).toString());
    });
    new File(repository, 'src/'+options.subApiPath+'-stack.ts', Buffer.from(new SubstitionAsset('sub-api-stack.ts').substitute({ subApiPath: options.subApiPath })));
    new File(repository, 'src/lambda/'+options.subApiPath+'-lambda.ts', Buffer.from(new SubstitionAsset('lambda/subapi-lambda.ts').substitute({ subApiPath: options.subApiPath })));

    this.addToBinaryExecutionFile(repository, options.subApiPath);

    // create an environment, if I have one
    let environment: Environment | undefined = undefined;
    if (options.environment) {
      environment = new Environment(this, options.environment);
    }

    const workflowBuilder = new WorkflowBuilder(this);
    workflowBuilder.setName('sub-workflow-'+options.subApiPath);
    workflowBuilder.addBranchTrigger(['main']);

    /**
     * We can use a build action to execute some arbitrary steps
     */
    workflowBuilder.addBuildAction({
      actionName: 'do-something-in-an-action',
      input: {
        Sources: ['WorkflowSource'],
      },
      steps: [
        'ls -la',
        'echo "Hello world from a workflow!"',
        'echo "If theres an account connection, I can execute in the context of that account"',
        'aws sts get-caller-identity',
      ],
      // is there is an environment, connect it to the workflow
      environment: environment && convertToWorkflowEnvironment(environment),
      output: {},
    });

    // write a workflow to my repository
    new Workflow(this, repository, workflowBuilder.getDefinition());

    // Create a dev environment workspace in my project
    const devEnvironementDefiniton: WorkspaceDefinition = SampleWorkspaces.default;
    new Workspace(this, repository, devEnvironementDefiniton);

    repository.setResynthStrategies([
      {
        identifier: 'force-current-blueprints',
        globs: ['**/added_blueprints.json'],
        strategy: MergeStrategies.alwaysUpdate,
      },
    ]);

    repository.setResynthStrategies([
      {
        identifier: 'force-constructs',
        globs: ['constructs/*.ts'],
        strategy: MergeStrategies.alwaysUpdate,
      },
    ]);

    this.updateAddedBluePrintsFile(repository, options);

  }
  addToBinaryExecutionFile(repository: SourceRepository, subApiPath: string) {
    var buff = repository.getFiles()['api-gateway-bin.ts'];
    if (buff==null) {
      console.log('api-gateway-bin.ts not found, please manually add the stack to your main stack.');
      return;
    }
    var stringContent = buff.toString();
    if (stringContent.match(subApiPath+'SubApiStack')==null) {
      console.log('Adding stack to bin file.');
      stringContent.replace('// Additional API', 'new '+subApiPath+'SubApiStack(this, \''+subApiPath+'SubApiStack\' );\n// Additional API');
      new File(repository, 'api-gateway-bin.ts', Buffer.from(stringContent));
    } else {
      console.log('Stack is already added.');
    }

  }

  updateAddedBluePrintsFile(repository: SourceRepository, options: Options) {
    const contextFiles = this.context.project.src.findAll({
      fileGlobs: ['**/added_blueprints.json'],
    });
    var added_blue_prints: string[] = [];
    if (contextFiles.length==0) {
      added_blue_prints.push(this.name+'-'+options.subApiPath);
    } else {
      let contextFile = contextFiles[0];
      let contextFileContents = contextFile.buffer.toString();
      const contextFileJson = JSON.parse(contextFileContents);

      const existing = contextFileJson.blueprints as string[];
      (existing).forEach((elem) =>
        added_blue_prints.push(elem));
      if (!existing.includes(this.name+'-'+options.subApiPath)) {
        added_blue_prints.push(this.name+'-'+options.subApiPath);
      }
    }
    new SourceFile(repository, 'added_blueprints.json', JSON.stringify({ blueprints: added_blue_prints }));
  }
}
