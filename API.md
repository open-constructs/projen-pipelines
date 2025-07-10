# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AssignApprover <a name="AssignApprover" id="projen-pipelines.AssignApprover"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.AssignApprover.Initializer"></a>

```typescript
import { AssignApprover } from 'projen-pipelines'

new AssignApprover(scope: Project, baseOptions: AssignApproverOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.AssignApprover.Initializer.parameter.scope">scope</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.AssignApprover.Initializer.parameter.baseOptions">baseOptions</a></code> | <code><a href="#projen-pipelines.AssignApproverOptions">AssignApproverOptions</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="projen-pipelines.AssignApprover.Initializer.parameter.scope"></a>

- *Type:* projen.Project

---

##### `baseOptions`<sup>Required</sup> <a name="baseOptions" id="projen-pipelines.AssignApprover.Initializer.parameter.baseOptions"></a>

- *Type:* <a href="#projen-pipelines.AssignApproverOptions">AssignApproverOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.AssignApprover.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.AssignApprover.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.AssignApprover.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.AssignApprover.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |

---

##### `toString` <a name="toString" id="projen-pipelines.AssignApprover.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.AssignApprover.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.AssignApprover.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.AssignApprover.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.AssignApprover.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.AssignApprover.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.AssignApprover.isConstruct"></a>

```typescript
import { AssignApprover } from 'projen-pipelines'

AssignApprover.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.AssignApprover.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.AssignApprover.isComponent"></a>

```typescript
import { AssignApprover } from 'projen-pipelines'

AssignApprover.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.AssignApprover.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.AssignApprover.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.AssignApprover.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.AssignApprover.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.AssignApprover.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---


### BashCDKPipeline <a name="BashCDKPipeline" id="projen-pipelines.BashCDKPipeline"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.BashCDKPipeline.Initializer"></a>

```typescript
import { BashCDKPipeline } from 'projen-pipelines'

new BashCDKPipeline(app: AwsCdkTypeScriptApp, options: BashCDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.BashCDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipeline.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.BashCDKPipelineOptions">BashCDKPipelineOptions</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.BashCDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.BashCDKPipeline.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.BashCDKPipelineOptions">BashCDKPipelineOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.BashCDKPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.BashCDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.BashCDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.BashCDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |
| <code><a href="#projen-pipelines.BashCDKPipeline.engineType">engineType</a></code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipeline.generateVersioningAppCode">generateVersioningAppCode</a></code> | Generate CDK application code for versioning. |
| <code><a href="#projen-pipelines.BashCDKPipeline.generateVersioningImports">generateVersioningImports</a></code> | Generate versioning imports for CDK application. |
| <code><a href="#projen-pipelines.BashCDKPipeline.generateVersioningUtilities">generateVersioningUtilities</a></code> | Generate versioning utility functions for CDK application. |

---

##### `toString` <a name="toString" id="projen-pipelines.BashCDKPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.BashCDKPipeline.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.BashCDKPipeline.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.BashCDKPipeline.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

##### `engineType` <a name="engineType" id="projen-pipelines.BashCDKPipeline.engineType"></a>

```typescript
public engineType(): PipelineEngine
```

##### `generateVersioningAppCode` <a name="generateVersioningAppCode" id="projen-pipelines.BashCDKPipeline.generateVersioningAppCode"></a>

```typescript
public generateVersioningAppCode(_config: VersioningConfig): string
```

Generate CDK application code for versioning.

###### `_config`<sup>Required</sup> <a name="_config" id="projen-pipelines.BashCDKPipeline.generateVersioningAppCode.parameter._config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningImports` <a name="generateVersioningImports" id="projen-pipelines.BashCDKPipeline.generateVersioningImports"></a>

```typescript
public generateVersioningImports(config: VersioningConfig): string
```

Generate versioning imports for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.BashCDKPipeline.generateVersioningImports.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningUtilities` <a name="generateVersioningUtilities" id="projen-pipelines.BashCDKPipeline.generateVersioningUtilities"></a>

```typescript
public generateVersioningUtilities(config: VersioningConfig): string
```

Generate versioning utility functions for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.BashCDKPipeline.generateVersioningUtilities.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.BashCDKPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.BashCDKPipeline.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.BashCDKPipeline.isConstruct"></a>

```typescript
import { BashCDKPipeline } from 'projen-pipelines'

BashCDKPipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.BashCDKPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.BashCDKPipeline.isComponent"></a>

```typescript
import { BashCDKPipeline } from 'projen-pipelines'

BashCDKPipeline.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.BashCDKPipeline.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.BashCDKPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.BashCDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipeline.property.branchName">branchName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipeline.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.BashCDKPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.BashCDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---

##### `branchName`<sup>Required</sup> <a name="branchName" id="projen-pipelines.BashCDKPipeline.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.BashCDKPipeline.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---


### CDKPipeline <a name="CDKPipeline" id="projen-pipelines.CDKPipeline"></a>

The CDKPipeline class extends the Component class and sets up the necessary configuration for deploying AWS CDK (Cloud Development Kit) applications across multiple stages.

It also manages tasks such as publishing CDK assets, bumping version based on git tags, and cleaning up conflicting tasks.

#### Initializers <a name="Initializers" id="projen-pipelines.CDKPipeline.Initializer"></a>

```typescript
import { CDKPipeline } from 'projen-pipelines'

new CDKPipeline(app: AwsCdkTypeScriptApp, baseOptions: CDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.Initializer.parameter.baseOptions">baseOptions</a></code> | <code><a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.CDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `baseOptions`<sup>Required</sup> <a name="baseOptions" id="projen-pipelines.CDKPipeline.Initializer.parameter.baseOptions"></a>

- *Type:* <a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.CDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.CDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.CDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |
| <code><a href="#projen-pipelines.CDKPipeline.engineType">engineType</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.generateVersioningAppCode">generateVersioningAppCode</a></code> | Generate CDK application code for versioning. |
| <code><a href="#projen-pipelines.CDKPipeline.generateVersioningImports">generateVersioningImports</a></code> | Generate versioning imports for CDK application. |
| <code><a href="#projen-pipelines.CDKPipeline.generateVersioningUtilities">generateVersioningUtilities</a></code> | Generate versioning utility functions for CDK application. |

---

##### `toString` <a name="toString" id="projen-pipelines.CDKPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.CDKPipeline.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.CDKPipeline.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.CDKPipeline.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

##### `engineType` <a name="engineType" id="projen-pipelines.CDKPipeline.engineType"></a>

```typescript
public engineType(): PipelineEngine
```

##### `generateVersioningAppCode` <a name="generateVersioningAppCode" id="projen-pipelines.CDKPipeline.generateVersioningAppCode"></a>

```typescript
public generateVersioningAppCode(_config: VersioningConfig): string
```

Generate CDK application code for versioning.

###### `_config`<sup>Required</sup> <a name="_config" id="projen-pipelines.CDKPipeline.generateVersioningAppCode.parameter._config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningImports` <a name="generateVersioningImports" id="projen-pipelines.CDKPipeline.generateVersioningImports"></a>

```typescript
public generateVersioningImports(config: VersioningConfig): string
```

Generate versioning imports for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.CDKPipeline.generateVersioningImports.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningUtilities` <a name="generateVersioningUtilities" id="projen-pipelines.CDKPipeline.generateVersioningUtilities"></a>

```typescript
public generateVersioningUtilities(config: VersioningConfig): string
```

Generate versioning utility functions for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.CDKPipeline.generateVersioningUtilities.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.CDKPipeline.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.CDKPipeline.isConstruct"></a>

```typescript
import { CDKPipeline } from 'projen-pipelines'

CDKPipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.CDKPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.CDKPipeline.isComponent"></a>

```typescript
import { CDKPipeline } from 'projen-pipelines'

CDKPipeline.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.CDKPipeline.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.CDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.property.branchName">branchName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.CDKPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.CDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---

##### `branchName`<sup>Required</sup> <a name="branchName" id="projen-pipelines.CDKPipeline.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.CDKPipeline.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---


### GitHubAssignApprover <a name="GitHubAssignApprover" id="projen-pipelines.GitHubAssignApprover"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.GitHubAssignApprover.Initializer"></a>

```typescript
import { GitHubAssignApprover } from 'projen-pipelines'

new GitHubAssignApprover(scope: GitHubProject, options: GitHubAssignApproverOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitHubAssignApprover.Initializer.parameter.scope">scope</a></code> | <code>projen.github.GitHubProject</code> | *No description.* |
| <code><a href="#projen-pipelines.GitHubAssignApprover.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.GitHubAssignApproverOptions">GitHubAssignApproverOptions</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="projen-pipelines.GitHubAssignApprover.Initializer.parameter.scope"></a>

- *Type:* projen.github.GitHubProject

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GitHubAssignApprover.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.GitHubAssignApproverOptions">GitHubAssignApproverOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GitHubAssignApprover.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.GitHubAssignApprover.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.GitHubAssignApprover.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.GitHubAssignApprover.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |
| <code><a href="#projen-pipelines.GitHubAssignApprover.renderPermissions">renderPermissions</a></code> | Get the required permissions for the GitHub workflow. |

---

##### `toString` <a name="toString" id="projen-pipelines.GitHubAssignApprover.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.GitHubAssignApprover.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.GitHubAssignApprover.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.GitHubAssignApprover.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

##### `renderPermissions` <a name="renderPermissions" id="projen-pipelines.GitHubAssignApprover.renderPermissions"></a>

```typescript
public renderPermissions(): JobPermissions
```

Get the required permissions for the GitHub workflow.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GitHubAssignApprover.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.GitHubAssignApprover.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.GitHubAssignApprover.isConstruct"></a>

```typescript
import { GitHubAssignApprover } from 'projen-pipelines'

GitHubAssignApprover.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.GitHubAssignApprover.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.GitHubAssignApprover.isComponent"></a>

```typescript
import { GitHubAssignApprover } from 'projen-pipelines'

GitHubAssignApprover.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.GitHubAssignApprover.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitHubAssignApprover.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.GitHubAssignApprover.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.GitHubAssignApprover.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.GitHubAssignApprover.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---


### GithubCDKPipeline <a name="GithubCDKPipeline" id="projen-pipelines.GithubCDKPipeline"></a>

Implements a CDK Pipeline configured specifically for GitHub workflows.

#### Initializers <a name="Initializers" id="projen-pipelines.GithubCDKPipeline.Initializer"></a>

```typescript
import { GithubCDKPipeline } from 'projen-pipelines'

new GithubCDKPipeline(app: AwsCdkTypeScriptApp, options: GithubCDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubCDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | - The CDK app associated with this pipeline. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.GithubCDKPipelineOptions">GithubCDKPipelineOptions</a></code> | - Configuration options for the pipeline. |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.GithubCDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

The CDK app associated with this pipeline.

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GithubCDKPipeline.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.GithubCDKPipelineOptions">GithubCDKPipelineOptions</a>

Configuration options for the pipeline.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GithubCDKPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.engineType">engineType</a></code> | the type of engine this implementation of CDKPipeline is for. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.generateVersioningAppCode">generateVersioningAppCode</a></code> | Generate CDK application code for versioning. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.generateVersioningImports">generateVersioningImports</a></code> | Generate versioning imports for CDK application. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.generateVersioningUtilities">generateVersioningUtilities</a></code> | Generate versioning utility functions for CDK application. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.createAssetUpload">createAssetUpload</a></code> | Creates a job to upload assets to AWS as part of the pipeline. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.createDeployment">createDeployment</a></code> | Creates a job to deploy the CDK application to AWS. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.createIndependentDeployment">createIndependentDeployment</a></code> | Creates a job to deploy the CDK application to AWS. |

---

##### `toString` <a name="toString" id="projen-pipelines.GithubCDKPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.GithubCDKPipeline.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.GithubCDKPipeline.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.GithubCDKPipeline.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

##### `engineType` <a name="engineType" id="projen-pipelines.GithubCDKPipeline.engineType"></a>

```typescript
public engineType(): PipelineEngine
```

the type of engine this implementation of CDKPipeline is for.

##### `generateVersioningAppCode` <a name="generateVersioningAppCode" id="projen-pipelines.GithubCDKPipeline.generateVersioningAppCode"></a>

```typescript
public generateVersioningAppCode(_config: VersioningConfig): string
```

Generate CDK application code for versioning.

###### `_config`<sup>Required</sup> <a name="_config" id="projen-pipelines.GithubCDKPipeline.generateVersioningAppCode.parameter._config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningImports` <a name="generateVersioningImports" id="projen-pipelines.GithubCDKPipeline.generateVersioningImports"></a>

```typescript
public generateVersioningImports(config: VersioningConfig): string
```

Generate versioning imports for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.GithubCDKPipeline.generateVersioningImports.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningUtilities` <a name="generateVersioningUtilities" id="projen-pipelines.GithubCDKPipeline.generateVersioningUtilities"></a>

```typescript
public generateVersioningUtilities(config: VersioningConfig): string
```

Generate versioning utility functions for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.GithubCDKPipeline.generateVersioningUtilities.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `createAssetUpload` <a name="createAssetUpload" id="projen-pipelines.GithubCDKPipeline.createAssetUpload"></a>

```typescript
public createAssetUpload(): void
```

Creates a job to upload assets to AWS as part of the pipeline.

##### `createDeployment` <a name="createDeployment" id="projen-pipelines.GithubCDKPipeline.createDeployment"></a>

```typescript
public createDeployment(stage: DeploymentStage): void
```

Creates a job to deploy the CDK application to AWS.

###### `stage`<sup>Required</sup> <a name="stage" id="projen-pipelines.GithubCDKPipeline.createDeployment.parameter.stage"></a>

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>

The deployment stage to create.

---

##### `createIndependentDeployment` <a name="createIndependentDeployment" id="projen-pipelines.GithubCDKPipeline.createIndependentDeployment"></a>

```typescript
public createIndependentDeployment(stage: IndependentStage): void
```

Creates a job to deploy the CDK application to AWS.

###### `stage`<sup>Required</sup> <a name="stage" id="projen-pipelines.GithubCDKPipeline.createIndependentDeployment.parameter.stage"></a>

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>

The independent stage to create.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GithubCDKPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.GithubCDKPipeline.isConstruct"></a>

```typescript
import { GithubCDKPipeline } from 'projen-pipelines'

GithubCDKPipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.GithubCDKPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.GithubCDKPipeline.isComponent"></a>

```typescript
import { GithubCDKPipeline } from 'projen-pipelines'

GithubCDKPipeline.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.GithubCDKPipeline.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubCDKPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.GithubCDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipeline.property.branchName">branchName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipeline.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipeline.property.needsVersionedArtifacts">needsVersionedArtifacts</a></code> | <code>boolean</code> | Indicates if versioned artifacts are needed based on manual approval requirements. |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.GithubCDKPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.GithubCDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---

##### `branchName`<sup>Required</sup> <a name="branchName" id="projen-pipelines.GithubCDKPipeline.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.GithubCDKPipeline.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---

##### `needsVersionedArtifacts`<sup>Required</sup> <a name="needsVersionedArtifacts" id="projen-pipelines.GithubCDKPipeline.property.needsVersionedArtifacts"></a>

```typescript
public readonly needsVersionedArtifacts: boolean;
```

- *Type:* boolean

Indicates if versioned artifacts are needed based on manual approval requirements.

---


### GitlabCDKPipeline <a name="GitlabCDKPipeline" id="projen-pipelines.GitlabCDKPipeline"></a>

The GitlabCDKPipeline class extends CDKPipeline to provide a way to configure and execute AWS CDK deployment pipelines within GitLab CI/CD environments.

It integrates IAM role management,
runner configuration, and defines stages and jobs for the deployment workflow.

#### Initializers <a name="Initializers" id="projen-pipelines.GitlabCDKPipeline.Initializer"></a>

```typescript
import { GitlabCDKPipeline } from 'projen-pipelines'

new GitlabCDKPipeline(app: AwsCdkTypeScriptApp, options: GitlabCDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | - The AWS CDK app associated with the pipeline. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.GitlabCDKPipelineOptions">GitlabCDKPipelineOptions</a></code> | - Configuration options for the pipeline. |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.GitlabCDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

The AWS CDK app associated with the pipeline.

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GitlabCDKPipeline.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.GitlabCDKPipelineOptions">GitlabCDKPipelineOptions</a>

Configuration options for the pipeline.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.engineType">engineType</a></code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.generateVersioningAppCode">generateVersioningAppCode</a></code> | Generate CDK application code for versioning. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.generateVersioningImports">generateVersioningImports</a></code> | Generate versioning imports for CDK application. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.generateVersioningUtilities">generateVersioningUtilities</a></code> | Generate versioning utility functions for CDK application. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.createIndependentDeployment">createIndependentDeployment</a></code> | Creates a job to deploy the CDK application to AWS. |

---

##### `toString` <a name="toString" id="projen-pipelines.GitlabCDKPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.GitlabCDKPipeline.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.GitlabCDKPipeline.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.GitlabCDKPipeline.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

##### `engineType` <a name="engineType" id="projen-pipelines.GitlabCDKPipeline.engineType"></a>

```typescript
public engineType(): PipelineEngine
```

##### `generateVersioningAppCode` <a name="generateVersioningAppCode" id="projen-pipelines.GitlabCDKPipeline.generateVersioningAppCode"></a>

```typescript
public generateVersioningAppCode(_config: VersioningConfig): string
```

Generate CDK application code for versioning.

###### `_config`<sup>Required</sup> <a name="_config" id="projen-pipelines.GitlabCDKPipeline.generateVersioningAppCode.parameter._config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningImports` <a name="generateVersioningImports" id="projen-pipelines.GitlabCDKPipeline.generateVersioningImports"></a>

```typescript
public generateVersioningImports(config: VersioningConfig): string
```

Generate versioning imports for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.GitlabCDKPipeline.generateVersioningImports.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `generateVersioningUtilities` <a name="generateVersioningUtilities" id="projen-pipelines.GitlabCDKPipeline.generateVersioningUtilities"></a>

```typescript
public generateVersioningUtilities(config: VersioningConfig): string
```

Generate versioning utility functions for CDK application.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.GitlabCDKPipeline.generateVersioningUtilities.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

##### `createIndependentDeployment` <a name="createIndependentDeployment" id="projen-pipelines.GitlabCDKPipeline.createIndependentDeployment"></a>

```typescript
public createIndependentDeployment(stage: IndependentStage): void
```

Creates a job to deploy the CDK application to AWS.

###### `stage`<sup>Required</sup> <a name="stage" id="projen-pipelines.GitlabCDKPipeline.createIndependentDeployment.parameter.stage"></a>

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>

The independent stage to create.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.GitlabCDKPipeline.isConstruct"></a>

```typescript
import { GitlabCDKPipeline } from 'projen-pipelines'

GitlabCDKPipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.GitlabCDKPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.GitlabCDKPipeline.isComponent"></a>

```typescript
import { GitlabCDKPipeline } from 'projen-pipelines'

GitlabCDKPipeline.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.GitlabCDKPipeline.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.branchName">branchName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.config">config</a></code> | <code>projen.gitlab.GitlabConfiguration</code> | GitLab CI/CD configuration object. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.jobImage">jobImage</a></code> | <code>string</code> | The Docker image used for pipeline jobs. |
| <code><a href="#projen-pipelines.GitlabCDKPipeline.property.needsVersionedArtifacts">needsVersionedArtifacts</a></code> | <code>boolean</code> | Indicates if versioned artifacts are required. |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.GitlabCDKPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.GitlabCDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---

##### `branchName`<sup>Required</sup> <a name="branchName" id="projen-pipelines.GitlabCDKPipeline.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.GitlabCDKPipeline.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---

##### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.GitlabCDKPipeline.property.config"></a>

```typescript
public readonly config: GitlabConfiguration;
```

- *Type:* projen.gitlab.GitlabConfiguration

GitLab CI/CD configuration object.

---

##### `jobImage`<sup>Required</sup> <a name="jobImage" id="projen-pipelines.GitlabCDKPipeline.property.jobImage"></a>

```typescript
public readonly jobImage: string;
```

- *Type:* string

The Docker image used for pipeline jobs.

Defaults to a specified image or a default value.

---

##### `needsVersionedArtifacts`<sup>Required</sup> <a name="needsVersionedArtifacts" id="projen-pipelines.GitlabCDKPipeline.property.needsVersionedArtifacts"></a>

```typescript
public readonly needsVersionedArtifacts: boolean;
```

- *Type:* boolean

Indicates if versioned artifacts are required.

Currently set to false

---


## Structs <a name="Structs" id="Structs"></a>

### ApproverMapping <a name="ApproverMapping" id="projen-pipelines.ApproverMapping"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.ApproverMapping.Initializer"></a>

```typescript
import { ApproverMapping } from 'projen-pipelines'

const approverMapping: ApproverMapping = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.ApproverMapping.property.approvers">approvers</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.ApproverMapping.property.author">author</a></code> | <code>string</code> | *No description.* |

---

##### `approvers`<sup>Required</sup> <a name="approvers" id="projen-pipelines.ApproverMapping.property.approvers"></a>

```typescript
public readonly approvers: string[];
```

- *Type:* string[]

---

##### `author`<sup>Required</sup> <a name="author" id="projen-pipelines.ApproverMapping.property.author"></a>

```typescript
public readonly author: string;
```

- *Type:* string

---

### AssignApproverOptions <a name="AssignApproverOptions" id="projen-pipelines.AssignApproverOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.AssignApproverOptions.Initializer"></a>

```typescript
import { AssignApproverOptions } from 'projen-pipelines'

const assignApproverOptions: AssignApproverOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.AssignApproverOptions.property.approverMapping">approverMapping</a></code> | <code><a href="#projen-pipelines.ApproverMapping">ApproverMapping</a>[]</code> | The mapping of authors to approvers. |
| <code><a href="#projen-pipelines.AssignApproverOptions.property.defaultApprovers">defaultApprovers</a></code> | <code>string[]</code> | The GitHub token to use for the API calls. |

---

##### `approverMapping`<sup>Required</sup> <a name="approverMapping" id="projen-pipelines.AssignApproverOptions.property.approverMapping"></a>

```typescript
public readonly approverMapping: ApproverMapping[];
```

- *Type:* <a href="#projen-pipelines.ApproverMapping">ApproverMapping</a>[]

The mapping of authors to approvers.

---

##### `defaultApprovers`<sup>Required</sup> <a name="defaultApprovers" id="projen-pipelines.AssignApproverOptions.property.defaultApprovers"></a>

```typescript
public readonly defaultApprovers: string[];
```

- *Type:* string[]

The GitHub token to use for the API calls.

---

### AwsAssumeRoleStepConfig <a name="AwsAssumeRoleStepConfig" id="projen-pipelines.AwsAssumeRoleStepConfig"></a>

Configuration for an AWS AssumeRoleStep.

#### Initializer <a name="Initializer" id="projen-pipelines.AwsAssumeRoleStepConfig.Initializer"></a>

```typescript
import { AwsAssumeRoleStepConfig } from 'projen-pipelines'

const awsAssumeRoleStepConfig: AwsAssumeRoleStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.AwsAssumeRoleStepConfig.property.roleArn">roleArn</a></code> | <code>string</code> | The ARN of the role to assume. |
| <code><a href="#projen-pipelines.AwsAssumeRoleStepConfig.property.region">region</a></code> | <code>string</code> | The AWS region that should be set. |
| <code><a href="#projen-pipelines.AwsAssumeRoleStepConfig.property.sessionName">sessionName</a></code> | <code>string</code> | An identifier for the assumed role session. |

---

##### `roleArn`<sup>Required</sup> <a name="roleArn" id="projen-pipelines.AwsAssumeRoleStepConfig.property.roleArn"></a>

```typescript
public readonly roleArn: string;
```

- *Type:* string

The ARN of the role to assume.

---

##### `region`<sup>Optional</sup> <a name="region" id="projen-pipelines.AwsAssumeRoleStepConfig.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS region that should be set.

---

##### `sessionName`<sup>Optional</sup> <a name="sessionName" id="projen-pipelines.AwsAssumeRoleStepConfig.property.sessionName"></a>

```typescript
public readonly sessionName: string;
```

- *Type:* string

An identifier for the assumed role session.

---

### BashCDKPipelineOptions <a name="BashCDKPipelineOptions" id="projen-pipelines.BashCDKPipelineOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.BashCDKPipelineOptions.Initializer"></a>

```typescript
import { BashCDKPipelineOptions } from 'projen-pipelines'

const bashCDKPipelineOptions: BashCDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.iamRoleArns">iamRoleArns</a></code> | <code><a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a></code> | IAM config. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.versioning">versioning</a></code> | <code><a href="#projen-pipelines.VersioningConfig">VersioningConfig</a></code> | Versioning configuration. |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.BashCDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `stages`<sup>Required</sup> <a name="stages" id="projen-pipelines.BashCDKPipelineOptions.property.stages"></a>

```typescript
public readonly stages: DeploymentStage[];
```

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]

This field specifies a list of stages that should be deployed using a CI/CD pipeline.

---

##### `branchName`<sup>Optional</sup> <a name="branchName" id="projen-pipelines.BashCDKPipelineOptions.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string
- *Default:* main

the name of the branch to deploy from.

---

##### `deploySubStacks`<sup>Optional</sup> <a name="deploySubStacks" id="projen-pipelines.BashCDKPipelineOptions.property.deploySubStacks"></a>

```typescript
public readonly deploySubStacks: boolean;
```

- *Type:* boolean
- *Default:* false

If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack.

You can use this to deploy CDk applications containing multiple stacks.

---

##### `featureStages`<sup>Optional</sup> <a name="featureStages" id="projen-pipelines.BashCDKPipelineOptions.property.featureStages"></a>

```typescript
public readonly featureStages: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for feature stages.

---

##### `independentStages`<sup>Optional</sup> <a name="independentStages" id="projen-pipelines.BashCDKPipelineOptions.property.independentStages"></a>

```typescript
public readonly independentStages: IndependentStage[];
```

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]

This specifies details for independent stages.

---

##### `personalStage`<sup>Optional</sup> <a name="personalStage" id="projen-pipelines.BashCDKPipelineOptions.property.personalStage"></a>

```typescript
public readonly personalStage: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for a personal stage.

---

##### `pkgNamespace`<sup>Optional</sup> <a name="pkgNamespace" id="projen-pipelines.BashCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string
- *Default:* 

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

This is only needed if you need to version and upload the cloud assembly to a package repository.

---

##### `postSynthCommands`<sup>Optional</sup> <a name="postSynthCommands" id="projen-pipelines.BashCDKPipelineOptions.property.postSynthCommands"></a>

```typescript
public readonly postSynthCommands: string[];
```

- *Type:* string[]

---

##### `postSynthSteps`<sup>Optional</sup> <a name="postSynthSteps" id="projen-pipelines.BashCDKPipelineOptions.property.postSynthSteps"></a>

```typescript
public readonly postSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preInstallCommands`<sup>Optional</sup> <a name="preInstallCommands" id="projen-pipelines.BashCDKPipelineOptions.property.preInstallCommands"></a>

```typescript
public readonly preInstallCommands: string[];
```

- *Type:* string[]

---

##### `preInstallSteps`<sup>Optional</sup> <a name="preInstallSteps" id="projen-pipelines.BashCDKPipelineOptions.property.preInstallSteps"></a>

```typescript
public readonly preInstallSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preSynthCommands`<sup>Optional</sup> <a name="preSynthCommands" id="projen-pipelines.BashCDKPipelineOptions.property.preSynthCommands"></a>

```typescript
public readonly preSynthCommands: string[];
```

- *Type:* string[]

---

##### `preSynthSteps`<sup>Optional</sup> <a name="preSynthSteps" id="projen-pipelines.BashCDKPipelineOptions.property.preSynthSteps"></a>

```typescript
public readonly preSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="projen-pipelines.BashCDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string
- *Default:* project name

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

---

##### `versioning`<sup>Optional</sup> <a name="versioning" id="projen-pipelines.BashCDKPipelineOptions.property.versioning"></a>

```typescript
public readonly versioning: VersioningConfig;
```

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

Versioning configuration.

---

### BashStepConfig <a name="BashStepConfig" id="projen-pipelines.BashStepConfig"></a>

Configuration interface for a bash script step.

#### Initializer <a name="Initializer" id="projen-pipelines.BashStepConfig.Initializer"></a>

```typescript
import { BashStepConfig } from 'projen-pipelines'

const bashStepConfig: BashStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.BashStepConfig.property.commands">commands</a></code> | <code>string[]</code> | Shell commands to execute. |

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.BashStepConfig.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

Shell commands to execute.

---

### BuildNumberConfig <a name="BuildNumberConfig" id="projen-pipelines.BuildNumberConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.BuildNumberConfig.Initializer"></a>

```typescript
import { BuildNumberConfig } from 'projen-pipelines'

const buildNumberConfig: BuildNumberConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.BuildNumberConfig.property.commitCount">commitCount</a></code> | <code><a href="#projen-pipelines.CommitCountConfig">CommitCountConfig</a></code> | *No description.* |
| <code><a href="#projen-pipelines.BuildNumberConfig.property.prefix">prefix</a></code> | <code>string</code> | *No description.* |

---

##### `commitCount`<sup>Optional</sup> <a name="commitCount" id="projen-pipelines.BuildNumberConfig.property.commitCount"></a>

```typescript
public readonly commitCount: CommitCountConfig;
```

- *Type:* <a href="#projen-pipelines.CommitCountConfig">CommitCountConfig</a>

---

##### `prefix`<sup>Optional</sup> <a name="prefix" id="projen-pipelines.BuildNumberConfig.property.prefix"></a>

```typescript
public readonly prefix: string;
```

- *Type:* string

---

### CDKPipelineOptions <a name="CDKPipelineOptions" id="projen-pipelines.CDKPipelineOptions"></a>

The CDKPipelineOptions interface is designed to provide configuration options for a CDK (Cloud Development Kit) pipeline.

It allows the definition
of settings such as the stack prefix and package namespace to be used in the
AWS stack, along with the environments configuration to be used.

#### Initializer <a name="Initializer" id="projen-pipelines.CDKPipelineOptions.Initializer"></a>

```typescript
import { CDKPipelineOptions } from 'projen-pipelines'

const cDKPipelineOptions: CDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.iamRoleArns">iamRoleArns</a></code> | <code><a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a></code> | IAM config. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.versioning">versioning</a></code> | <code><a href="#projen-pipelines.VersioningConfig">VersioningConfig</a></code> | Versioning configuration. |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.CDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `stages`<sup>Required</sup> <a name="stages" id="projen-pipelines.CDKPipelineOptions.property.stages"></a>

```typescript
public readonly stages: DeploymentStage[];
```

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]

This field specifies a list of stages that should be deployed using a CI/CD pipeline.

---

##### `branchName`<sup>Optional</sup> <a name="branchName" id="projen-pipelines.CDKPipelineOptions.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string
- *Default:* main

the name of the branch to deploy from.

---

##### `deploySubStacks`<sup>Optional</sup> <a name="deploySubStacks" id="projen-pipelines.CDKPipelineOptions.property.deploySubStacks"></a>

```typescript
public readonly deploySubStacks: boolean;
```

- *Type:* boolean
- *Default:* false

If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack.

You can use this to deploy CDk applications containing multiple stacks.

---

##### `featureStages`<sup>Optional</sup> <a name="featureStages" id="projen-pipelines.CDKPipelineOptions.property.featureStages"></a>

```typescript
public readonly featureStages: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for feature stages.

---

##### `independentStages`<sup>Optional</sup> <a name="independentStages" id="projen-pipelines.CDKPipelineOptions.property.independentStages"></a>

```typescript
public readonly independentStages: IndependentStage[];
```

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]

This specifies details for independent stages.

---

##### `personalStage`<sup>Optional</sup> <a name="personalStage" id="projen-pipelines.CDKPipelineOptions.property.personalStage"></a>

```typescript
public readonly personalStage: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for a personal stage.

---

##### `pkgNamespace`<sup>Optional</sup> <a name="pkgNamespace" id="projen-pipelines.CDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string
- *Default:* 

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

This is only needed if you need to version and upload the cloud assembly to a package repository.

---

##### `postSynthCommands`<sup>Optional</sup> <a name="postSynthCommands" id="projen-pipelines.CDKPipelineOptions.property.postSynthCommands"></a>

```typescript
public readonly postSynthCommands: string[];
```

- *Type:* string[]

---

##### `postSynthSteps`<sup>Optional</sup> <a name="postSynthSteps" id="projen-pipelines.CDKPipelineOptions.property.postSynthSteps"></a>

```typescript
public readonly postSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preInstallCommands`<sup>Optional</sup> <a name="preInstallCommands" id="projen-pipelines.CDKPipelineOptions.property.preInstallCommands"></a>

```typescript
public readonly preInstallCommands: string[];
```

- *Type:* string[]

---

##### `preInstallSteps`<sup>Optional</sup> <a name="preInstallSteps" id="projen-pipelines.CDKPipelineOptions.property.preInstallSteps"></a>

```typescript
public readonly preInstallSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preSynthCommands`<sup>Optional</sup> <a name="preSynthCommands" id="projen-pipelines.CDKPipelineOptions.property.preSynthCommands"></a>

```typescript
public readonly preSynthCommands: string[];
```

- *Type:* string[]

---

##### `preSynthSteps`<sup>Optional</sup> <a name="preSynthSteps" id="projen-pipelines.CDKPipelineOptions.property.preSynthSteps"></a>

```typescript
public readonly preSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="projen-pipelines.CDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string
- *Default:* project name

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

---

##### `versioning`<sup>Optional</sup> <a name="versioning" id="projen-pipelines.CDKPipelineOptions.property.versioning"></a>

```typescript
public readonly versioning: VersioningConfig;
```

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

Versioning configuration.

---

### CloudFormationOnlyOptions <a name="CloudFormationOnlyOptions" id="projen-pipelines.CloudFormationOnlyOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.CloudFormationOnlyOptions.Initializer"></a>

```typescript
import { CloudFormationOnlyOptions } from 'projen-pipelines'

const cloudFormationOnlyOptions: CloudFormationOnlyOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CloudFormationOnlyOptions.property.exportName">exportName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CloudFormationOnlyOptions.property.format">format</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CloudFormationOnlyOptions.property.stackOutputName">stackOutputName</a></code> | <code>string</code> | *No description.* |

---

##### `exportName`<sup>Optional</sup> <a name="exportName" id="projen-pipelines.CloudFormationOnlyOptions.property.exportName"></a>

```typescript
public readonly exportName: string;
```

- *Type:* string

---

##### `format`<sup>Optional</sup> <a name="format" id="projen-pipelines.CloudFormationOnlyOptions.property.format"></a>

```typescript
public readonly format: string;
```

- *Type:* string

---

##### `stackOutputName`<sup>Optional</sup> <a name="stackOutputName" id="projen-pipelines.CloudFormationOnlyOptions.property.stackOutputName"></a>

```typescript
public readonly stackOutputName: string;
```

- *Type:* string

---

### CloudFormationOutputConfig <a name="CloudFormationOutputConfig" id="projen-pipelines.CloudFormationOutputConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.CloudFormationOutputConfig.Initializer"></a>

```typescript
import { CloudFormationOutputConfig } from 'projen-pipelines'

const cloudFormationOutputConfig: CloudFormationOutputConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CloudFormationOutputConfig.property.enabled">enabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.CloudFormationOutputConfig.property.exportName">exportName</a></code> | <code>string</code> | *No description.* |

---

##### `enabled`<sup>Required</sup> <a name="enabled" id="projen-pipelines.CloudFormationOutputConfig.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

---

##### `exportName`<sup>Optional</sup> <a name="exportName" id="projen-pipelines.CloudFormationOutputConfig.property.exportName"></a>

```typescript
public readonly exportName: string;
```

- *Type:* string

---

### CodeArtifactLoginStepOptions <a name="CodeArtifactLoginStepOptions" id="projen-pipelines.CodeArtifactLoginStepOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.CodeArtifactLoginStepOptions.Initializer"></a>

```typescript
import { CodeArtifactLoginStepOptions } from 'projen-pipelines'

const codeArtifactLoginStepOptions: CodeArtifactLoginStepOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CodeArtifactLoginStepOptions.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeArtifactLoginStepOptions.property.ownerAccount">ownerAccount</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeArtifactLoginStepOptions.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeArtifactLoginStepOptions.property.role">role</a></code> | <code>string</code> | *No description.* |

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="projen-pipelines.CodeArtifactLoginStepOptions.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `ownerAccount`<sup>Required</sup> <a name="ownerAccount" id="projen-pipelines.CodeArtifactLoginStepOptions.property.ownerAccount"></a>

```typescript
public readonly ownerAccount: string;
```

- *Type:* string

---

##### `region`<sup>Required</sup> <a name="region" id="projen-pipelines.CodeArtifactLoginStepOptions.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `role`<sup>Required</sup> <a name="role" id="projen-pipelines.CodeArtifactLoginStepOptions.property.role"></a>

```typescript
public readonly role: string;
```

- *Type:* string

---

### CodeCatalystStepConfig <a name="CodeCatalystStepConfig" id="projen-pipelines.CodeCatalystStepConfig"></a>

Configuration interface for a CodeCatalyst Actions step.

#### Initializer <a name="Initializer" id="projen-pipelines.CodeCatalystStepConfig.Initializer"></a>

```typescript
import { CodeCatalystStepConfig } from 'projen-pipelines'

const codeCatalystStepConfig: CodeCatalystStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CodeCatalystStepConfig.property.commands">commands</a></code> | <code>string[]</code> | Commands wrapped as GitHub Action job steps. |
| <code><a href="#projen-pipelines.CodeCatalystStepConfig.property.env">env</a></code> | <code>{[ key: string ]: string}</code> | Additional environment variables to set for this step. |
| <code><a href="#projen-pipelines.CodeCatalystStepConfig.property.needs">needs</a></code> | <code>string[]</code> | Dependencies which need to be completed before this step. |

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.CodeCatalystStepConfig.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

Commands wrapped as GitHub Action job steps.

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.CodeCatalystStepConfig.property.env"></a>

```typescript
public readonly env: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Additional environment variables to set for this step.

---

##### `needs`<sup>Required</sup> <a name="needs" id="projen-pipelines.CodeCatalystStepConfig.property.needs"></a>

```typescript
public readonly needs: string[];
```

- *Type:* string[]

Dependencies which need to be completed before this step.

---

### CommitCountConfig <a name="CommitCountConfig" id="projen-pipelines.CommitCountConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.CommitCountConfig.Initializer"></a>

```typescript
import { CommitCountConfig } from 'projen-pipelines'

const commitCountConfig: CommitCountConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CommitCountConfig.property.countFrom">countFrom</a></code> | <code>string</code> | Count from: 'all' \| 'branch' \| 'since-tag'. |
| <code><a href="#projen-pipelines.CommitCountConfig.property.includeBranch">includeBranch</a></code> | <code>boolean</code> | Include branch name. |
| <code><a href="#projen-pipelines.CommitCountConfig.property.padding">padding</a></code> | <code>number</code> | Padding for count. |
| <code><a href="#projen-pipelines.CommitCountConfig.property.resetOnMajor">resetOnMajor</a></code> | <code>boolean</code> | Reset on major version. |

---

##### `countFrom`<sup>Optional</sup> <a name="countFrom" id="projen-pipelines.CommitCountConfig.property.countFrom"></a>

```typescript
public readonly countFrom: string;
```

- *Type:* string

Count from: 'all' | 'branch' | 'since-tag'.

---

##### `includeBranch`<sup>Optional</sup> <a name="includeBranch" id="projen-pipelines.CommitCountConfig.property.includeBranch"></a>

```typescript
public readonly includeBranch: boolean;
```

- *Type:* boolean

Include branch name.

---

##### `padding`<sup>Optional</sup> <a name="padding" id="projen-pipelines.CommitCountConfig.property.padding"></a>

```typescript
public readonly padding: number;
```

- *Type:* number

Padding for count.

---

##### `resetOnMajor`<sup>Optional</sup> <a name="resetOnMajor" id="projen-pipelines.CommitCountConfig.property.resetOnMajor"></a>

```typescript
public readonly resetOnMajor: boolean;
```

- *Type:* boolean

Reset on major version.

---

### ComputationContext <a name="ComputationContext" id="projen-pipelines.ComputationContext"></a>

Context for version computation.

#### Initializer <a name="Initializer" id="projen-pipelines.ComputationContext.Initializer"></a>

```typescript
import { ComputationContext } from 'projen-pipelines'

const computationContext: ComputationContext = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.ComputationContext.property.deployedBy">deployedBy</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ComputationContext.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ComputationContext.property.gitInfo">gitInfo</a></code> | <code><a href="#projen-pipelines.GitInfo">GitInfo</a></code> | *No description.* |
| <code><a href="#projen-pipelines.ComputationContext.property.buildNumber">buildNumber</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ComputationContext.property.pipelineVersion">pipelineVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ComputationContext.property.repository">repository</a></code> | <code>string</code> | *No description.* |

---

##### `deployedBy`<sup>Required</sup> <a name="deployedBy" id="projen-pipelines.ComputationContext.property.deployedBy"></a>

```typescript
public readonly deployedBy: string;
```

- *Type:* string

---

##### `environment`<sup>Required</sup> <a name="environment" id="projen-pipelines.ComputationContext.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `gitInfo`<sup>Required</sup> <a name="gitInfo" id="projen-pipelines.ComputationContext.property.gitInfo"></a>

```typescript
public readonly gitInfo: GitInfo;
```

- *Type:* <a href="#projen-pipelines.GitInfo">GitInfo</a>

---

##### `buildNumber`<sup>Optional</sup> <a name="buildNumber" id="projen-pipelines.ComputationContext.property.buildNumber"></a>

```typescript
public readonly buildNumber: string;
```

- *Type:* string

---

##### `pipelineVersion`<sup>Optional</sup> <a name="pipelineVersion" id="projen-pipelines.ComputationContext.property.pipelineVersion"></a>

```typescript
public readonly pipelineVersion: string;
```

- *Type:* string

---

##### `repository`<sup>Optional</sup> <a name="repository" id="projen-pipelines.ComputationContext.property.repository"></a>

```typescript
public readonly repository: string;
```

- *Type:* string

---

### CustomVersioningConfig <a name="CustomVersioningConfig" id="projen-pipelines.CustomVersioningConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.CustomVersioningConfig.Initializer"></a>

```typescript
import { CustomVersioningConfig } from 'projen-pipelines'

const customVersioningConfig: CustomVersioningConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CustomVersioningConfig.property.outputs">outputs</a></code> | <code><a href="#projen-pipelines.VersioningOutputConfig">VersioningOutputConfig</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CustomVersioningConfig.property.strategy">strategy</a></code> | <code><a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CustomVersioningConfig.property.enabled">enabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.CustomVersioningConfig.property.stageOverrides">stageOverrides</a></code> | <code>{[ key: string ]: <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>}</code> | *No description.* |

---

##### `outputs`<sup>Required</sup> <a name="outputs" id="projen-pipelines.CustomVersioningConfig.property.outputs"></a>

```typescript
public readonly outputs: VersioningOutputConfig;
```

- *Type:* <a href="#projen-pipelines.VersioningOutputConfig">VersioningOutputConfig</a>

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.CustomVersioningConfig.property.strategy"></a>

```typescript
public readonly strategy: IVersioningStrategy;
```

- *Type:* <a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a>

---

##### `enabled`<sup>Optional</sup> <a name="enabled" id="projen-pipelines.CustomVersioningConfig.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

---

##### `stageOverrides`<sup>Optional</sup> <a name="stageOverrides" id="projen-pipelines.CustomVersioningConfig.property.stageOverrides"></a>

```typescript
public readonly stageOverrides: {[ key: string ]: VersioningConfig};
```

- *Type:* {[ key: string ]: <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>}

---

### DeploymentInfoInput <a name="DeploymentInfoInput" id="projen-pipelines.DeploymentInfoInput"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.DeploymentInfoInput.Initializer"></a>

```typescript
import { DeploymentInfoInput } from 'projen-pipelines'

const deploymentInfoInput: DeploymentInfoInput = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.DeploymentInfoInput.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentInfoInput.property.buildNumber">buildNumber</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentInfoInput.property.deployedBy">deployedBy</a></code> | <code>string</code> | *No description.* |

---

##### `environment`<sup>Required</sup> <a name="environment" id="projen-pipelines.DeploymentInfoInput.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `buildNumber`<sup>Optional</sup> <a name="buildNumber" id="projen-pipelines.DeploymentInfoInput.property.buildNumber"></a>

```typescript
public readonly buildNumber: string;
```

- *Type:* string

---

##### `deployedBy`<sup>Optional</sup> <a name="deployedBy" id="projen-pipelines.DeploymentInfoInput.property.deployedBy"></a>

```typescript
public readonly deployedBy: string;
```

- *Type:* string

---

### DeploymentStage <a name="DeploymentStage" id="projen-pipelines.DeploymentStage"></a>

Options for stages that are part of the pipeline.

#### Initializer <a name="Initializer" id="projen-pipelines.DeploymentStage.Initializer"></a>

```typescript
import { DeploymentStage } from 'projen-pipelines'

const deploymentStage: DeploymentStage = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.DeploymentStage.property.env">env</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentStage.property.diffType">diffType</a></code> | <code><a href="#projen-pipelines.CdkDiffType">CdkDiffType</a></code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentStage.property.postDeploySteps">postDeploySteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentStage.property.postDiffSteps">postDiffSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentStage.property.watchable">watchable</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.DeploymentStage.property.manualApproval">manualApproval</a></code> | <code>boolean</code> | *No description.* |

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.DeploymentStage.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

---

##### `name`<sup>Required</sup> <a name="name" id="projen-pipelines.DeploymentStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `diffType`<sup>Optional</sup> <a name="diffType" id="projen-pipelines.DeploymentStage.property.diffType"></a>

```typescript
public readonly diffType: CdkDiffType;
```

- *Type:* <a href="#projen-pipelines.CdkDiffType">CdkDiffType</a>

---

##### `postDeploySteps`<sup>Optional</sup> <a name="postDeploySteps" id="projen-pipelines.DeploymentStage.property.postDeploySteps"></a>

```typescript
public readonly postDeploySteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `postDiffSteps`<sup>Optional</sup> <a name="postDiffSteps" id="projen-pipelines.DeploymentStage.property.postDiffSteps"></a>

```typescript
public readonly postDiffSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `watchable`<sup>Optional</sup> <a name="watchable" id="projen-pipelines.DeploymentStage.property.watchable"></a>

```typescript
public readonly watchable: boolean;
```

- *Type:* boolean

---

##### `manualApproval`<sup>Optional</sup> <a name="manualApproval" id="projen-pipelines.DeploymentStage.property.manualApproval"></a>

```typescript
public readonly manualApproval: boolean;
```

- *Type:* boolean

---

### DownloadArtifactStepConfig <a name="DownloadArtifactStepConfig" id="projen-pipelines.DownloadArtifactStepConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.DownloadArtifactStepConfig.Initializer"></a>

```typescript
import { DownloadArtifactStepConfig } from 'projen-pipelines'

const downloadArtifactStepConfig: DownloadArtifactStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.DownloadArtifactStepConfig.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.DownloadArtifactStepConfig.property.path">path</a></code> | <code>string</code> | *No description.* |

---

##### `name`<sup>Required</sup> <a name="name" id="projen-pipelines.DownloadArtifactStepConfig.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `path`<sup>Required</sup> <a name="path" id="projen-pipelines.DownloadArtifactStepConfig.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

---

### Environment <a name="Environment" id="projen-pipelines.Environment"></a>

The Environment interface is designed to hold AWS related information for a specific deployment environment within your infrastructure.

Each environment requires a specific account and region for its resources.

#### Initializer <a name="Initializer" id="projen-pipelines.Environment.Initializer"></a>

```typescript
import { Environment } from 'projen-pipelines'

const environment: Environment = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.Environment.property.account">account</a></code> | <code>string</code> | The AWS Account ID associated with the environment. |
| <code><a href="#projen-pipelines.Environment.property.region">region</a></code> | <code>string</code> | The AWS Region for the environment. |

---

##### `account`<sup>Required</sup> <a name="account" id="projen-pipelines.Environment.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS Account ID associated with the environment.

It's important because
different services or features could have distinct permissions and settings
in different accounts.

---

##### `region`<sup>Required</sup> <a name="region" id="projen-pipelines.Environment.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS Region for the environment.

This determines where your resources
are created and where your application will run. It can affect latency,
availability, and pricing.

---

### GitHubAssignApproverOptions <a name="GitHubAssignApproverOptions" id="projen-pipelines.GitHubAssignApproverOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.GitHubAssignApproverOptions.Initializer"></a>

```typescript
import { GitHubAssignApproverOptions } from 'projen-pipelines'

const gitHubAssignApproverOptions: GitHubAssignApproverOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitHubAssignApproverOptions.property.approverMapping">approverMapping</a></code> | <code><a href="#projen-pipelines.ApproverMapping">ApproverMapping</a>[]</code> | The mapping of authors to approvers. |
| <code><a href="#projen-pipelines.GitHubAssignApproverOptions.property.defaultApprovers">defaultApprovers</a></code> | <code>string[]</code> | The GitHub token to use for the API calls. |
| <code><a href="#projen-pipelines.GitHubAssignApproverOptions.property.runnerTags">runnerTags</a></code> | <code>string[]</code> | runner tags to use to select runners. |

---

##### `approverMapping`<sup>Required</sup> <a name="approverMapping" id="projen-pipelines.GitHubAssignApproverOptions.property.approverMapping"></a>

```typescript
public readonly approverMapping: ApproverMapping[];
```

- *Type:* <a href="#projen-pipelines.ApproverMapping">ApproverMapping</a>[]

The mapping of authors to approvers.

---

##### `defaultApprovers`<sup>Required</sup> <a name="defaultApprovers" id="projen-pipelines.GitHubAssignApproverOptions.property.defaultApprovers"></a>

```typescript
public readonly defaultApprovers: string[];
```

- *Type:* string[]

The GitHub token to use for the API calls.

---

##### `runnerTags`<sup>Optional</sup> <a name="runnerTags" id="projen-pipelines.GitHubAssignApproverOptions.property.runnerTags"></a>

```typescript
public readonly runnerTags: string[];
```

- *Type:* string[]
- *Default:* ['ubuntu-latest']

runner tags to use to select runners.

---

### GithubCDKPipelineOptions <a name="GithubCDKPipelineOptions" id="projen-pipelines.GithubCDKPipelineOptions"></a>

Extension of the base CDKPipeline options including specific configurations for GitHub.

#### Initializer <a name="Initializer" id="projen-pipelines.GithubCDKPipelineOptions.Initializer"></a>

```typescript
import { GithubCDKPipelineOptions } from 'projen-pipelines'

const githubCDKPipelineOptions: GithubCDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.iamRoleArns">iamRoleArns</a></code> | <code><a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a></code> | IAM config. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.versioning">versioning</a></code> | <code><a href="#projen-pipelines.VersioningConfig">VersioningConfig</a></code> | Versioning configuration. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.runnerTags">runnerTags</a></code> | <code>string[]</code> | runner tags to use to select runners. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.useGithubEnvironments">useGithubEnvironments</a></code> | <code>boolean</code> | whether to use GitHub environments for deployment stages. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.useGithubPackagesForAssembly">useGithubPackagesForAssembly</a></code> | <code>boolean</code> | use GitHub Packages to store vesioned artifacts of cloud assembly; |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.GithubCDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `stages`<sup>Required</sup> <a name="stages" id="projen-pipelines.GithubCDKPipelineOptions.property.stages"></a>

```typescript
public readonly stages: DeploymentStage[];
```

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]

This field specifies a list of stages that should be deployed using a CI/CD pipeline.

---

##### `branchName`<sup>Optional</sup> <a name="branchName" id="projen-pipelines.GithubCDKPipelineOptions.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string
- *Default:* main

the name of the branch to deploy from.

---

##### `deploySubStacks`<sup>Optional</sup> <a name="deploySubStacks" id="projen-pipelines.GithubCDKPipelineOptions.property.deploySubStacks"></a>

```typescript
public readonly deploySubStacks: boolean;
```

- *Type:* boolean
- *Default:* false

If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack.

You can use this to deploy CDk applications containing multiple stacks.

---

##### `featureStages`<sup>Optional</sup> <a name="featureStages" id="projen-pipelines.GithubCDKPipelineOptions.property.featureStages"></a>

```typescript
public readonly featureStages: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for feature stages.

---

##### `independentStages`<sup>Optional</sup> <a name="independentStages" id="projen-pipelines.GithubCDKPipelineOptions.property.independentStages"></a>

```typescript
public readonly independentStages: IndependentStage[];
```

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]

This specifies details for independent stages.

---

##### `personalStage`<sup>Optional</sup> <a name="personalStage" id="projen-pipelines.GithubCDKPipelineOptions.property.personalStage"></a>

```typescript
public readonly personalStage: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for a personal stage.

---

##### `pkgNamespace`<sup>Optional</sup> <a name="pkgNamespace" id="projen-pipelines.GithubCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string
- *Default:* 

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

This is only needed if you need to version and upload the cloud assembly to a package repository.

---

##### `postSynthCommands`<sup>Optional</sup> <a name="postSynthCommands" id="projen-pipelines.GithubCDKPipelineOptions.property.postSynthCommands"></a>

```typescript
public readonly postSynthCommands: string[];
```

- *Type:* string[]

---

##### `postSynthSteps`<sup>Optional</sup> <a name="postSynthSteps" id="projen-pipelines.GithubCDKPipelineOptions.property.postSynthSteps"></a>

```typescript
public readonly postSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preInstallCommands`<sup>Optional</sup> <a name="preInstallCommands" id="projen-pipelines.GithubCDKPipelineOptions.property.preInstallCommands"></a>

```typescript
public readonly preInstallCommands: string[];
```

- *Type:* string[]

---

##### `preInstallSteps`<sup>Optional</sup> <a name="preInstallSteps" id="projen-pipelines.GithubCDKPipelineOptions.property.preInstallSteps"></a>

```typescript
public readonly preInstallSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preSynthCommands`<sup>Optional</sup> <a name="preSynthCommands" id="projen-pipelines.GithubCDKPipelineOptions.property.preSynthCommands"></a>

```typescript
public readonly preSynthCommands: string[];
```

- *Type:* string[]

---

##### `preSynthSteps`<sup>Optional</sup> <a name="preSynthSteps" id="projen-pipelines.GithubCDKPipelineOptions.property.preSynthSteps"></a>

```typescript
public readonly preSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="projen-pipelines.GithubCDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string
- *Default:* project name

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

---

##### `versioning`<sup>Optional</sup> <a name="versioning" id="projen-pipelines.GithubCDKPipelineOptions.property.versioning"></a>

```typescript
public readonly versioning: VersioningConfig;
```

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

Versioning configuration.

---

##### `runnerTags`<sup>Optional</sup> <a name="runnerTags" id="projen-pipelines.GithubCDKPipelineOptions.property.runnerTags"></a>

```typescript
public readonly runnerTags: string[];
```

- *Type:* string[]
- *Default:* ['ubuntu-latest']

runner tags to use to select runners.

---

##### `useGithubEnvironments`<sup>Optional</sup> <a name="useGithubEnvironments" id="projen-pipelines.GithubCDKPipelineOptions.property.useGithubEnvironments"></a>

```typescript
public readonly useGithubEnvironments: boolean;
```

- *Type:* boolean
- *Default:* false

whether to use GitHub environments for deployment stages.

INFO: When using environments consider protection rules instead of using the manual option of projen-pipelines for stages

---

##### `useGithubPackagesForAssembly`<sup>Optional</sup> <a name="useGithubPackagesForAssembly" id="projen-pipelines.GithubCDKPipelineOptions.property.useGithubPackagesForAssembly"></a>

```typescript
public readonly useGithubPackagesForAssembly: boolean;
```

- *Type:* boolean

use GitHub Packages to store vesioned artifacts of cloud assembly;

also needed for manual approvals

---

### GithubPackagesLoginStepOptions <a name="GithubPackagesLoginStepOptions" id="projen-pipelines.GithubPackagesLoginStepOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.GithubPackagesLoginStepOptions.Initializer"></a>

```typescript
import { GithubPackagesLoginStepOptions } from 'projen-pipelines'

const githubPackagesLoginStepOptions: GithubPackagesLoginStepOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubPackagesLoginStepOptions.property.write">write</a></code> | <code>boolean</code> | Whether or not to grant the step write permissions to the registry. |

---

##### `write`<sup>Optional</sup> <a name="write" id="projen-pipelines.GithubPackagesLoginStepOptions.property.write"></a>

```typescript
public readonly write: boolean;
```

- *Type:* boolean
- *Default:* false

Whether or not to grant the step write permissions to the registry.

---

### GithubStepConfig <a name="GithubStepConfig" id="projen-pipelines.GithubStepConfig"></a>

Configuration interface for a GitHub Actions step.

#### Initializer <a name="Initializer" id="projen-pipelines.GithubStepConfig.Initializer"></a>

```typescript
import { GithubStepConfig } from 'projen-pipelines'

const githubStepConfig: GithubStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubStepConfig.property.env">env</a></code> | <code>{[ key: string ]: string}</code> | Additional environment variables to set for this step. |
| <code><a href="#projen-pipelines.GithubStepConfig.property.needs">needs</a></code> | <code>string[]</code> | Dependencies which need to be completed before this step. |
| <code><a href="#projen-pipelines.GithubStepConfig.property.steps">steps</a></code> | <code>projen.github.workflows.JobStep[]</code> | Commands wrapped as GitHub Action job steps. |
| <code><a href="#projen-pipelines.GithubStepConfig.property.permissions">permissions</a></code> | <code>projen.github.workflows.JobPermissions</code> | Additional job permissions needed. |

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.GithubStepConfig.property.env"></a>

```typescript
public readonly env: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Additional environment variables to set for this step.

---

##### `needs`<sup>Required</sup> <a name="needs" id="projen-pipelines.GithubStepConfig.property.needs"></a>

```typescript
public readonly needs: string[];
```

- *Type:* string[]

Dependencies which need to be completed before this step.

---

##### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.GithubStepConfig.property.steps"></a>

```typescript
public readonly steps: JobStep[];
```

- *Type:* projen.github.workflows.JobStep[]

Commands wrapped as GitHub Action job steps.

---

##### `permissions`<sup>Optional</sup> <a name="permissions" id="projen-pipelines.GithubStepConfig.property.permissions"></a>

```typescript
public readonly permissions: JobPermissions;
```

- *Type:* projen.github.workflows.JobPermissions

Additional job permissions needed.

---

### GitInfo <a name="GitInfo" id="projen-pipelines.GitInfo"></a>

Git information extracted from repository.

#### Initializer <a name="Initializer" id="projen-pipelines.GitInfo.Initializer"></a>

```typescript
import { GitInfo } from 'projen-pipelines'

const gitInfo: GitInfo = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitInfo.property.branch">branch</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfo.property.commitCount">commitCount</a></code> | <code>number</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfo.property.commitHash">commitHash</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfo.property.commitHashShort">commitHashShort</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfo.property.commitsSinceTag">commitsSinceTag</a></code> | <code>number</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfo.property.packageVersion">packageVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfo.property.tag">tag</a></code> | <code>string</code> | *No description.* |

---

##### `branch`<sup>Required</sup> <a name="branch" id="projen-pipelines.GitInfo.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

---

##### `commitCount`<sup>Required</sup> <a name="commitCount" id="projen-pipelines.GitInfo.property.commitCount"></a>

```typescript
public readonly commitCount: number;
```

- *Type:* number

---

##### `commitHash`<sup>Required</sup> <a name="commitHash" id="projen-pipelines.GitInfo.property.commitHash"></a>

```typescript
public readonly commitHash: string;
```

- *Type:* string

---

##### `commitHashShort`<sup>Required</sup> <a name="commitHashShort" id="projen-pipelines.GitInfo.property.commitHashShort"></a>

```typescript
public readonly commitHashShort: string;
```

- *Type:* string

---

##### `commitsSinceTag`<sup>Optional</sup> <a name="commitsSinceTag" id="projen-pipelines.GitInfo.property.commitsSinceTag"></a>

```typescript
public readonly commitsSinceTag: number;
```

- *Type:* number

---

##### `packageVersion`<sup>Optional</sup> <a name="packageVersion" id="projen-pipelines.GitInfo.property.packageVersion"></a>

```typescript
public readonly packageVersion: string;
```

- *Type:* string

---

##### `tag`<sup>Optional</sup> <a name="tag" id="projen-pipelines.GitInfo.property.tag"></a>

```typescript
public readonly tag: string;
```

- *Type:* string

---

### GitInfoInput <a name="GitInfoInput" id="projen-pipelines.GitInfoInput"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.GitInfoInput.Initializer"></a>

```typescript
import { GitInfoInput } from 'projen-pipelines'

const gitInfoInput: GitInfoInput = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitInfoInput.property.branch">branch</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfoInput.property.commitCount">commitCount</a></code> | <code>number</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfoInput.property.commitHash">commitHash</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfoInput.property.commitsSinceTag">commitsSinceTag</a></code> | <code>number</code> | *No description.* |
| <code><a href="#projen-pipelines.GitInfoInput.property.tag">tag</a></code> | <code>string</code> | *No description.* |

---

##### `branch`<sup>Required</sup> <a name="branch" id="projen-pipelines.GitInfoInput.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

---

##### `commitCount`<sup>Required</sup> <a name="commitCount" id="projen-pipelines.GitInfoInput.property.commitCount"></a>

```typescript
public readonly commitCount: number;
```

- *Type:* number

---

##### `commitHash`<sup>Required</sup> <a name="commitHash" id="projen-pipelines.GitInfoInput.property.commitHash"></a>

```typescript
public readonly commitHash: string;
```

- *Type:* string

---

##### `commitsSinceTag`<sup>Optional</sup> <a name="commitsSinceTag" id="projen-pipelines.GitInfoInput.property.commitsSinceTag"></a>

```typescript
public readonly commitsSinceTag: number;
```

- *Type:* number

---

##### `tag`<sup>Optional</sup> <a name="tag" id="projen-pipelines.GitInfoInput.property.tag"></a>

```typescript
public readonly tag: string;
```

- *Type:* string

---

### GitlabCDKPipelineOptions <a name="GitlabCDKPipelineOptions" id="projen-pipelines.GitlabCDKPipelineOptions"></a>

Options for configuring the GitLab CDK pipeline, extending the base CDK pipeline options.

#### Initializer <a name="Initializer" id="projen-pipelines.GitlabCDKPipelineOptions.Initializer"></a>

```typescript
import { GitlabCDKPipelineOptions } from 'projen-pipelines'

const gitlabCDKPipelineOptions: GitlabCDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.iamRoleArns">iamRoleArns</a></code> | <code><a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a></code> | IAM config. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.versioning">versioning</a></code> | <code><a href="#projen-pipelines.VersioningConfig">VersioningConfig</a></code> | Versioning configuration. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.image">image</a></code> | <code>string</code> | The Docker image to use for running the pipeline jobs. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.runnerTags">runnerTags</a></code> | <code><a href="#projen-pipelines.GitlabRunnerTags">GitlabRunnerTags</a></code> | Runner tags configuration for the pipeline. |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.GitlabCDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `stages`<sup>Required</sup> <a name="stages" id="projen-pipelines.GitlabCDKPipelineOptions.property.stages"></a>

```typescript
public readonly stages: DeploymentStage[];
```

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]

This field specifies a list of stages that should be deployed using a CI/CD pipeline.

---

##### `branchName`<sup>Optional</sup> <a name="branchName" id="projen-pipelines.GitlabCDKPipelineOptions.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string
- *Default:* main

the name of the branch to deploy from.

---

##### `deploySubStacks`<sup>Optional</sup> <a name="deploySubStacks" id="projen-pipelines.GitlabCDKPipelineOptions.property.deploySubStacks"></a>

```typescript
public readonly deploySubStacks: boolean;
```

- *Type:* boolean
- *Default:* false

If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack.

You can use this to deploy CDk applications containing multiple stacks.

---

##### `featureStages`<sup>Optional</sup> <a name="featureStages" id="projen-pipelines.GitlabCDKPipelineOptions.property.featureStages"></a>

```typescript
public readonly featureStages: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for feature stages.

---

##### `independentStages`<sup>Optional</sup> <a name="independentStages" id="projen-pipelines.GitlabCDKPipelineOptions.property.independentStages"></a>

```typescript
public readonly independentStages: IndependentStage[];
```

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]

This specifies details for independent stages.

---

##### `personalStage`<sup>Optional</sup> <a name="personalStage" id="projen-pipelines.GitlabCDKPipelineOptions.property.personalStage"></a>

```typescript
public readonly personalStage: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for a personal stage.

---

##### `pkgNamespace`<sup>Optional</sup> <a name="pkgNamespace" id="projen-pipelines.GitlabCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string
- *Default:* 

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

This is only needed if you need to version and upload the cloud assembly to a package repository.

---

##### `postSynthCommands`<sup>Optional</sup> <a name="postSynthCommands" id="projen-pipelines.GitlabCDKPipelineOptions.property.postSynthCommands"></a>

```typescript
public readonly postSynthCommands: string[];
```

- *Type:* string[]

---

##### `postSynthSteps`<sup>Optional</sup> <a name="postSynthSteps" id="projen-pipelines.GitlabCDKPipelineOptions.property.postSynthSteps"></a>

```typescript
public readonly postSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preInstallCommands`<sup>Optional</sup> <a name="preInstallCommands" id="projen-pipelines.GitlabCDKPipelineOptions.property.preInstallCommands"></a>

```typescript
public readonly preInstallCommands: string[];
```

- *Type:* string[]

---

##### `preInstallSteps`<sup>Optional</sup> <a name="preInstallSteps" id="projen-pipelines.GitlabCDKPipelineOptions.property.preInstallSteps"></a>

```typescript
public readonly preInstallSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preSynthCommands`<sup>Optional</sup> <a name="preSynthCommands" id="projen-pipelines.GitlabCDKPipelineOptions.property.preSynthCommands"></a>

```typescript
public readonly preSynthCommands: string[];
```

- *Type:* string[]

---

##### `preSynthSteps`<sup>Optional</sup> <a name="preSynthSteps" id="projen-pipelines.GitlabCDKPipelineOptions.property.preSynthSteps"></a>

```typescript
public readonly preSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="projen-pipelines.GitlabCDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string
- *Default:* project name

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

---

##### `versioning`<sup>Optional</sup> <a name="versioning" id="projen-pipelines.GitlabCDKPipelineOptions.property.versioning"></a>

```typescript
public readonly versioning: VersioningConfig;
```

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

Versioning configuration.

---

##### `image`<sup>Optional</sup> <a name="image" id="projen-pipelines.GitlabCDKPipelineOptions.property.image"></a>

```typescript
public readonly image: string;
```

- *Type:* string

The Docker image to use for running the pipeline jobs.

---

##### `runnerTags`<sup>Optional</sup> <a name="runnerTags" id="projen-pipelines.GitlabCDKPipelineOptions.property.runnerTags"></a>

```typescript
public readonly runnerTags: GitlabRunnerTags;
```

- *Type:* <a href="#projen-pipelines.GitlabRunnerTags">GitlabRunnerTags</a>

Runner tags configuration for the pipeline.

---

### GitlabRunnerTags <a name="GitlabRunnerTags" id="projen-pipelines.GitlabRunnerTags"></a>

Configuration for GitLab runner tags used within the CI/CD pipeline for various stages.

This allows for specifying different runners based on the tags for different stages of the pipeline.

#### Initializer <a name="Initializer" id="projen-pipelines.GitlabRunnerTags.Initializer"></a>

```typescript
import { GitlabRunnerTags } from 'projen-pipelines'

const gitlabRunnerTags: GitlabRunnerTags = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitlabRunnerTags.property.assetPublishing">assetPublishing</a></code> | <code>string[]</code> | Runner tags for the asset publishing stage. |
| <code><a href="#projen-pipelines.GitlabRunnerTags.property.default">default</a></code> | <code>string[]</code> | Default runner tags used if specific stage tags are not provided. |
| <code><a href="#projen-pipelines.GitlabRunnerTags.property.deployment">deployment</a></code> | <code>{[ key: string ]: string[]}</code> | A map of stage names to runner tags for the deployment operation. |
| <code><a href="#projen-pipelines.GitlabRunnerTags.property.diff">diff</a></code> | <code>{[ key: string ]: string[]}</code> | A map of stage names to runner tags for the diff operation. |
| <code><a href="#projen-pipelines.GitlabRunnerTags.property.synth">synth</a></code> | <code>string[]</code> | Runner tags for the synthesis stage. |

---

##### `assetPublishing`<sup>Optional</sup> <a name="assetPublishing" id="projen-pipelines.GitlabRunnerTags.property.assetPublishing"></a>

```typescript
public readonly assetPublishing: string[];
```

- *Type:* string[]

Runner tags for the asset publishing stage.

---

##### `default`<sup>Optional</sup> <a name="default" id="projen-pipelines.GitlabRunnerTags.property.default"></a>

```typescript
public readonly default: string[];
```

- *Type:* string[]

Default runner tags used if specific stage tags are not provided.

---

##### `deployment`<sup>Optional</sup> <a name="deployment" id="projen-pipelines.GitlabRunnerTags.property.deployment"></a>

```typescript
public readonly deployment: {[ key: string ]: string[]};
```

- *Type:* {[ key: string ]: string[]}

A map of stage names to runner tags for the deployment operation.

---

##### `diff`<sup>Optional</sup> <a name="diff" id="projen-pipelines.GitlabRunnerTags.property.diff"></a>

```typescript
public readonly diff: {[ key: string ]: string[]};
```

- *Type:* {[ key: string ]: string[]}

A map of stage names to runner tags for the diff operation.

---

##### `synth`<sup>Optional</sup> <a name="synth" id="projen-pipelines.GitlabRunnerTags.property.synth"></a>

```typescript
public readonly synth: string[];
```

- *Type:* string[]

Runner tags for the synthesis stage.

---

### GitlabStepConfig <a name="GitlabStepConfig" id="projen-pipelines.GitlabStepConfig"></a>

Configuration interface for a GitLab CI step.

#### Initializer <a name="Initializer" id="projen-pipelines.GitlabStepConfig.Initializer"></a>

```typescript
import { GitlabStepConfig } from 'projen-pipelines'

const gitlabStepConfig: GitlabStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitlabStepConfig.property.commands">commands</a></code> | <code>string[]</code> | Shell commands to execute in this step. |
| <code><a href="#projen-pipelines.GitlabStepConfig.property.env">env</a></code> | <code>{[ key: string ]: string}</code> | Additional environment variables to set for this step. |
| <code><a href="#projen-pipelines.GitlabStepConfig.property.extensions">extensions</a></code> | <code>string[]</code> | List of job extensions related to the step. |
| <code><a href="#projen-pipelines.GitlabStepConfig.property.needs">needs</a></code> | <code>projen.gitlab.Need[]</code> | Dependencies which need to be completed before this step. |

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.GitlabStepConfig.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

Shell commands to execute in this step.

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.GitlabStepConfig.property.env"></a>

```typescript
public readonly env: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Additional environment variables to set for this step.

---

##### `extensions`<sup>Required</sup> <a name="extensions" id="projen-pipelines.GitlabStepConfig.property.extensions"></a>

```typescript
public readonly extensions: string[];
```

- *Type:* string[]

List of job extensions related to the step.

---

##### `needs`<sup>Required</sup> <a name="needs" id="projen-pipelines.GitlabStepConfig.property.needs"></a>

```typescript
public readonly needs: Need[];
```

- *Type:* projen.gitlab.Need[]

Dependencies which need to be completed before this step.

---

### GitTagConfig <a name="GitTagConfig" id="projen-pipelines.GitTagConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.GitTagConfig.Initializer"></a>

```typescript
import { GitTagConfig } from 'projen-pipelines'

const gitTagConfig: GitTagConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GitTagConfig.property.annotatedOnly">annotatedOnly</a></code> | <code>boolean</code> | Only use annotated tags. |
| <code><a href="#projen-pipelines.GitTagConfig.property.includeSinceTag">includeSinceTag</a></code> | <code>boolean</code> | Include commits since tag. |
| <code><a href="#projen-pipelines.GitTagConfig.property.pattern">pattern</a></code> | <code>string</code> | Tag pattern to match. |
| <code><a href="#projen-pipelines.GitTagConfig.property.stripPrefix">stripPrefix</a></code> | <code>string</code> | Strip prefix from tag. |

---

##### `annotatedOnly`<sup>Optional</sup> <a name="annotatedOnly" id="projen-pipelines.GitTagConfig.property.annotatedOnly"></a>

```typescript
public readonly annotatedOnly: boolean;
```

- *Type:* boolean

Only use annotated tags.

---

##### `includeSinceTag`<sup>Optional</sup> <a name="includeSinceTag" id="projen-pipelines.GitTagConfig.property.includeSinceTag"></a>

```typescript
public readonly includeSinceTag: boolean;
```

- *Type:* boolean

Include commits since tag.

---

##### `pattern`<sup>Optional</sup> <a name="pattern" id="projen-pipelines.GitTagConfig.property.pattern"></a>

```typescript
public readonly pattern: string;
```

- *Type:* string

Tag pattern to match.

---

##### `stripPrefix`<sup>Optional</sup> <a name="stripPrefix" id="projen-pipelines.GitTagConfig.property.stripPrefix"></a>

```typescript
public readonly stripPrefix: string;
```

- *Type:* string

Strip prefix from tag.

---

### HierarchicalParametersOptions <a name="HierarchicalParametersOptions" id="projen-pipelines.HierarchicalParametersOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.HierarchicalParametersOptions.Initializer"></a>

```typescript
import { HierarchicalParametersOptions } from 'projen-pipelines'

const hierarchicalParametersOptions: HierarchicalParametersOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.HierarchicalParametersOptions.property.format">format</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.HierarchicalParametersOptions.property.includeCloudFormation">includeCloudFormation</a></code> | <code>boolean</code> | *No description.* |

---

##### `format`<sup>Optional</sup> <a name="format" id="projen-pipelines.HierarchicalParametersOptions.property.format"></a>

```typescript
public readonly format: string;
```

- *Type:* string

---

##### `includeCloudFormation`<sup>Optional</sup> <a name="includeCloudFormation" id="projen-pipelines.HierarchicalParametersOptions.property.includeCloudFormation"></a>

```typescript
public readonly includeCloudFormation: boolean;
```

- *Type:* boolean

---

### IamRoleConfig <a name="IamRoleConfig" id="projen-pipelines.IamRoleConfig"></a>

Configuration interface for IAM roles used in the CDK pipeline.

#### Initializer <a name="Initializer" id="projen-pipelines.IamRoleConfig.Initializer"></a>

```typescript
import { IamRoleConfig } from 'projen-pipelines'

const iamRoleConfig: IamRoleConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.IamRoleConfig.property.assetPublishing">assetPublishing</a></code> | <code>string</code> | IAM role ARN for the asset publishing step. |
| <code><a href="#projen-pipelines.IamRoleConfig.property.assetPublishingPerStage">assetPublishingPerStage</a></code> | <code>{[ key: string ]: string}</code> | IAM role ARN for the asset publishing step for a specific stage. |
| <code><a href="#projen-pipelines.IamRoleConfig.property.default">default</a></code> | <code>string</code> | Default IAM role ARN used if no specific role is provided. |
| <code><a href="#projen-pipelines.IamRoleConfig.property.deployment">deployment</a></code> | <code>{[ key: string ]: string}</code> | IAM role ARNs for different deployment stages. |
| <code><a href="#projen-pipelines.IamRoleConfig.property.diff">diff</a></code> | <code>{[ key: string ]: string}</code> | IAM role ARNs for different diff stages. |
| <code><a href="#projen-pipelines.IamRoleConfig.property.synth">synth</a></code> | <code>string</code> | IAM role ARN for the synthesis step. |

---

##### `assetPublishing`<sup>Optional</sup> <a name="assetPublishing" id="projen-pipelines.IamRoleConfig.property.assetPublishing"></a>

```typescript
public readonly assetPublishing: string;
```

- *Type:* string

IAM role ARN for the asset publishing step.

---

##### `assetPublishingPerStage`<sup>Optional</sup> <a name="assetPublishingPerStage" id="projen-pipelines.IamRoleConfig.property.assetPublishingPerStage"></a>

```typescript
public readonly assetPublishingPerStage: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

IAM role ARN for the asset publishing step for a specific stage.

---

##### `default`<sup>Optional</sup> <a name="default" id="projen-pipelines.IamRoleConfig.property.default"></a>

```typescript
public readonly default: string;
```

- *Type:* string

Default IAM role ARN used if no specific role is provided.

---

##### `deployment`<sup>Optional</sup> <a name="deployment" id="projen-pipelines.IamRoleConfig.property.deployment"></a>

```typescript
public readonly deployment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

IAM role ARNs for different deployment stages.

---

##### `diff`<sup>Optional</sup> <a name="diff" id="projen-pipelines.IamRoleConfig.property.diff"></a>

```typescript
public readonly diff: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

IAM role ARNs for different diff stages.

---

##### `synth`<sup>Optional</sup> <a name="synth" id="projen-pipelines.IamRoleConfig.property.synth"></a>

```typescript
public readonly synth: string;
```

- *Type:* string

IAM role ARN for the synthesis step.

---

### IndependentStage <a name="IndependentStage" id="projen-pipelines.IndependentStage"></a>

Options for stages that are not part of the pipeline.

#### Initializer <a name="Initializer" id="projen-pipelines.IndependentStage.Initializer"></a>

```typescript
import { IndependentStage } from 'projen-pipelines'

const independentStage: IndependentStage = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.IndependentStage.property.env">env</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.IndependentStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IndependentStage.property.diffType">diffType</a></code> | <code><a href="#projen-pipelines.CdkDiffType">CdkDiffType</a></code> | *No description.* |
| <code><a href="#projen-pipelines.IndependentStage.property.postDeploySteps">postDeploySteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.IndependentStage.property.postDiffSteps">postDiffSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.IndependentStage.property.watchable">watchable</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.IndependentStage.property.deployOnPush">deployOnPush</a></code> | <code>boolean</code> | This specifies whether the stage should be deployed on push. |

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.IndependentStage.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

---

##### `name`<sup>Required</sup> <a name="name" id="projen-pipelines.IndependentStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `diffType`<sup>Optional</sup> <a name="diffType" id="projen-pipelines.IndependentStage.property.diffType"></a>

```typescript
public readonly diffType: CdkDiffType;
```

- *Type:* <a href="#projen-pipelines.CdkDiffType">CdkDiffType</a>

---

##### `postDeploySteps`<sup>Optional</sup> <a name="postDeploySteps" id="projen-pipelines.IndependentStage.property.postDeploySteps"></a>

```typescript
public readonly postDeploySteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `postDiffSteps`<sup>Optional</sup> <a name="postDiffSteps" id="projen-pipelines.IndependentStage.property.postDiffSteps"></a>

```typescript
public readonly postDiffSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `watchable`<sup>Optional</sup> <a name="watchable" id="projen-pipelines.IndependentStage.property.watchable"></a>

```typescript
public readonly watchable: boolean;
```

- *Type:* boolean

---

##### `deployOnPush`<sup>Optional</sup> <a name="deployOnPush" id="projen-pipelines.IndependentStage.property.deployOnPush"></a>

```typescript
public readonly deployOnPush: boolean;
```

- *Type:* boolean
- *Default:* false

This specifies whether the stage should be deployed on push.

---

### NamedStageOptions <a name="NamedStageOptions" id="projen-pipelines.NamedStageOptions"></a>

Options for a CDK stage with a name.

#### Initializer <a name="Initializer" id="projen-pipelines.NamedStageOptions.Initializer"></a>

```typescript
import { NamedStageOptions } from 'projen-pipelines'

const namedStageOptions: NamedStageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.NamedStageOptions.property.env">env</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.NamedStageOptions.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.NamedStageOptions.property.diffType">diffType</a></code> | <code><a href="#projen-pipelines.CdkDiffType">CdkDiffType</a></code> | *No description.* |
| <code><a href="#projen-pipelines.NamedStageOptions.property.postDeploySteps">postDeploySteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.NamedStageOptions.property.postDiffSteps">postDiffSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.NamedStageOptions.property.watchable">watchable</a></code> | <code>boolean</code> | *No description.* |

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.NamedStageOptions.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

---

##### `name`<sup>Required</sup> <a name="name" id="projen-pipelines.NamedStageOptions.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `diffType`<sup>Optional</sup> <a name="diffType" id="projen-pipelines.NamedStageOptions.property.diffType"></a>

```typescript
public readonly diffType: CdkDiffType;
```

- *Type:* <a href="#projen-pipelines.CdkDiffType">CdkDiffType</a>

---

##### `postDeploySteps`<sup>Optional</sup> <a name="postDeploySteps" id="projen-pipelines.NamedStageOptions.property.postDeploySteps"></a>

```typescript
public readonly postDeploySteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `postDiffSteps`<sup>Optional</sup> <a name="postDiffSteps" id="projen-pipelines.NamedStageOptions.property.postDiffSteps"></a>

```typescript
public readonly postDiffSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `watchable`<sup>Optional</sup> <a name="watchable" id="projen-pipelines.NamedStageOptions.property.watchable"></a>

```typescript
public readonly watchable: boolean;
```

- *Type:* boolean

---

### PackageJsonConfig <a name="PackageJsonConfig" id="projen-pipelines.PackageJsonConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.PackageJsonConfig.Initializer"></a>

```typescript
import { PackageJsonConfig } from 'projen-pipelines'

const packageJsonConfig: PackageJsonConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.PackageJsonConfig.property.appendCommitInfo">appendCommitInfo</a></code> | <code>boolean</code> | Append commit info. |
| <code><a href="#projen-pipelines.PackageJsonConfig.property.includePrerelease">includePrerelease</a></code> | <code>boolean</code> | Include pre-release version. |
| <code><a href="#projen-pipelines.PackageJsonConfig.property.path">path</a></code> | <code>string</code> | Path to package.json. |

---

##### `appendCommitInfo`<sup>Optional</sup> <a name="appendCommitInfo" id="projen-pipelines.PackageJsonConfig.property.appendCommitInfo"></a>

```typescript
public readonly appendCommitInfo: boolean;
```

- *Type:* boolean

Append commit info.

---

##### `includePrerelease`<sup>Optional</sup> <a name="includePrerelease" id="projen-pipelines.PackageJsonConfig.property.includePrerelease"></a>

```typescript
public readonly includePrerelease: boolean;
```

- *Type:* boolean

Include pre-release version.

---

##### `path`<sup>Optional</sup> <a name="path" id="projen-pipelines.PackageJsonConfig.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

Path to package.json.

---

### ParameterStoreConfig <a name="ParameterStoreConfig" id="projen-pipelines.ParameterStoreConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.ParameterStoreConfig.Initializer"></a>

```typescript
import { ParameterStoreConfig } from 'projen-pipelines'

const parameterStoreConfig: ParameterStoreConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.ParameterStoreConfig.property.enabled">enabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.ParameterStoreConfig.property.allowOverwrite">allowOverwrite</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.ParameterStoreConfig.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ParameterStoreConfig.property.hierarchical">hierarchical</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#projen-pipelines.ParameterStoreConfig.property.parameterName">parameterName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ParameterStoreConfig.property.splitParameters">splitParameters</a></code> | <code>boolean</code> | *No description.* |

---

##### `enabled`<sup>Required</sup> <a name="enabled" id="projen-pipelines.ParameterStoreConfig.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

---

##### `allowOverwrite`<sup>Optional</sup> <a name="allowOverwrite" id="projen-pipelines.ParameterStoreConfig.property.allowOverwrite"></a>

```typescript
public readonly allowOverwrite: boolean;
```

- *Type:* boolean

---

##### `description`<sup>Optional</sup> <a name="description" id="projen-pipelines.ParameterStoreConfig.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `hierarchical`<sup>Optional</sup> <a name="hierarchical" id="projen-pipelines.ParameterStoreConfig.property.hierarchical"></a>

```typescript
public readonly hierarchical: boolean;
```

- *Type:* boolean

---

##### `parameterName`<sup>Optional</sup> <a name="parameterName" id="projen-pipelines.ParameterStoreConfig.property.parameterName"></a>

```typescript
public readonly parameterName: string;
```

- *Type:* string

---

##### `splitParameters`<sup>Optional</sup> <a name="splitParameters" id="projen-pipelines.ParameterStoreConfig.property.splitParameters"></a>

```typescript
public readonly splitParameters: boolean;
```

- *Type:* boolean

---

### StageOptions <a name="StageOptions" id="projen-pipelines.StageOptions"></a>

Options for a CDK stage like the target environment.

#### Initializer <a name="Initializer" id="projen-pipelines.StageOptions.Initializer"></a>

```typescript
import { StageOptions } from 'projen-pipelines'

const stageOptions: StageOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.StageOptions.property.env">env</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | *No description.* |

---

##### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.StageOptions.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

---

### StandardConfigOptions <a name="StandardConfigOptions" id="projen-pipelines.StandardConfigOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.StandardConfigOptions.Initializer"></a>

```typescript
import { StandardConfigOptions } from 'projen-pipelines'

const standardConfigOptions: StandardConfigOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.StandardConfigOptions.property.format">format</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.StandardConfigOptions.property.parameterStore">parameterStore</a></code> | <code>string \| boolean</code> | *No description.* |

---

##### `format`<sup>Optional</sup> <a name="format" id="projen-pipelines.StandardConfigOptions.property.format"></a>

```typescript
public readonly format: string;
```

- *Type:* string

---

##### `parameterStore`<sup>Optional</sup> <a name="parameterStore" id="projen-pipelines.StandardConfigOptions.property.parameterStore"></a>

```typescript
public readonly parameterStore: string | boolean;
```

- *Type:* string | boolean

---

### StandardOutputOptions <a name="StandardOutputOptions" id="projen-pipelines.StandardOutputOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.StandardOutputOptions.Initializer"></a>

```typescript
import { StandardOutputOptions } from 'projen-pipelines'

const standardOutputOptions: StandardOutputOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.StandardOutputOptions.property.format">format</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.StandardOutputOptions.property.parameterName">parameterName</a></code> | <code>string</code> | *No description.* |

---

##### `format`<sup>Optional</sup> <a name="format" id="projen-pipelines.StandardOutputOptions.property.format"></a>

```typescript
public readonly format: string;
```

- *Type:* string

---

##### `parameterName`<sup>Optional</sup> <a name="parameterName" id="projen-pipelines.StandardOutputOptions.property.parameterName"></a>

```typescript
public readonly parameterName: string;
```

- *Type:* string

---

### UploadArtifactStepConfig <a name="UploadArtifactStepConfig" id="projen-pipelines.UploadArtifactStepConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.UploadArtifactStepConfig.Initializer"></a>

```typescript
import { UploadArtifactStepConfig } from 'projen-pipelines'

const uploadArtifactStepConfig: UploadArtifactStepConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.UploadArtifactStepConfig.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.UploadArtifactStepConfig.property.path">path</a></code> | <code>string</code> | *No description.* |

---

##### `name`<sup>Required</sup> <a name="name" id="projen-pipelines.UploadArtifactStepConfig.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `path`<sup>Required</sup> <a name="path" id="projen-pipelines.UploadArtifactStepConfig.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

---

### VersioningConfig <a name="VersioningConfig" id="projen-pipelines.VersioningConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.VersioningConfig.Initializer"></a>

```typescript
import { VersioningConfig } from 'projen-pipelines'

const versioningConfig: VersioningConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersioningConfig.property.enabled">enabled</a></code> | <code>boolean</code> | Enable versioning feature. |
| <code><a href="#projen-pipelines.VersioningConfig.property.outputs">outputs</a></code> | <code><a href="#projen-pipelines.VersioningOutputConfig">VersioningOutputConfig</a></code> | Output configuration. |
| <code><a href="#projen-pipelines.VersioningConfig.property.strategy">strategy</a></code> | <code><a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a></code> | Primary versioning strategy. |
| <code><a href="#projen-pipelines.VersioningConfig.property.stageOverrides">stageOverrides</a></code> | <code>{[ key: string ]: <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>}</code> | Stage-specific overrides. |

---

##### `enabled`<sup>Required</sup> <a name="enabled" id="projen-pipelines.VersioningConfig.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable versioning feature.

---

##### `outputs`<sup>Required</sup> <a name="outputs" id="projen-pipelines.VersioningConfig.property.outputs"></a>

```typescript
public readonly outputs: VersioningOutputConfig;
```

- *Type:* <a href="#projen-pipelines.VersioningOutputConfig">VersioningOutputConfig</a>

Output configuration.

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.VersioningConfig.property.strategy"></a>

```typescript
public readonly strategy: IVersioningStrategy;
```

- *Type:* <a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a>

Primary versioning strategy.

---

##### `stageOverrides`<sup>Optional</sup> <a name="stageOverrides" id="projen-pipelines.VersioningConfig.property.stageOverrides"></a>

```typescript
public readonly stageOverrides: {[ key: string ]: VersioningConfig};
```

- *Type:* {[ key: string ]: <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>}

Stage-specific overrides.

---

### VersioningOutputConfig <a name="VersioningOutputConfig" id="projen-pipelines.VersioningOutputConfig"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.VersioningOutputConfig.Initializer"></a>

```typescript
import { VersioningOutputConfig } from 'projen-pipelines'

const versioningOutputConfig: VersioningOutputConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersioningOutputConfig.property.cloudFormation">cloudFormation</a></code> | <code><a href="#projen-pipelines.CloudFormationOutputConfig">CloudFormationOutputConfig</a></code> | Output to CloudFormation stack outputs. |
| <code><a href="#projen-pipelines.VersioningOutputConfig.property.parameterStore">parameterStore</a></code> | <code><a href="#projen-pipelines.ParameterStoreConfig">ParameterStoreConfig</a></code> | Output to SSM Parameter Store. |

---

##### `cloudFormation`<sup>Required</sup> <a name="cloudFormation" id="projen-pipelines.VersioningOutputConfig.property.cloudFormation"></a>

```typescript
public readonly cloudFormation: CloudFormationOutputConfig;
```

- *Type:* <a href="#projen-pipelines.CloudFormationOutputConfig">CloudFormationOutputConfig</a>
- *Default:* true

Output to CloudFormation stack outputs.

---

##### `parameterStore`<sup>Required</sup> <a name="parameterStore" id="projen-pipelines.VersioningOutputConfig.property.parameterStore"></a>

```typescript
public readonly parameterStore: ParameterStoreConfig;
```

- *Type:* <a href="#projen-pipelines.ParameterStoreConfig">ParameterStoreConfig</a>
- *Default:* false

Output to SSM Parameter Store.

---

### VersioningStrategyComponents <a name="VersioningStrategyComponents" id="projen-pipelines.VersioningStrategyComponents"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.VersioningStrategyComponents.Initializer"></a>

```typescript
import { VersioningStrategyComponents } from 'projen-pipelines'

const versioningStrategyComponents: VersioningStrategyComponents = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersioningStrategyComponents.property.commitCount">commitCount</a></code> | <code><a href="#projen-pipelines.CommitCountConfig">CommitCountConfig</a></code> | *No description.* |
| <code><a href="#projen-pipelines.VersioningStrategyComponents.property.gitTag">gitTag</a></code> | <code><a href="#projen-pipelines.GitTagConfig">GitTagConfig</a></code> | *No description.* |
| <code><a href="#projen-pipelines.VersioningStrategyComponents.property.packageJson">packageJson</a></code> | <code><a href="#projen-pipelines.PackageJsonConfig">PackageJsonConfig</a></code> | *No description.* |

---

##### `commitCount`<sup>Optional</sup> <a name="commitCount" id="projen-pipelines.VersioningStrategyComponents.property.commitCount"></a>

```typescript
public readonly commitCount: CommitCountConfig;
```

- *Type:* <a href="#projen-pipelines.CommitCountConfig">CommitCountConfig</a>

---

##### `gitTag`<sup>Optional</sup> <a name="gitTag" id="projen-pipelines.VersioningStrategyComponents.property.gitTag"></a>

```typescript
public readonly gitTag: GitTagConfig;
```

- *Type:* <a href="#projen-pipelines.GitTagConfig">GitTagConfig</a>

---

##### `packageJson`<sup>Optional</sup> <a name="packageJson" id="projen-pipelines.VersioningStrategyComponents.property.packageJson"></a>

```typescript
public readonly packageJson: PackageJsonConfig;
```

- *Type:* <a href="#projen-pipelines.PackageJsonConfig">PackageJsonConfig</a>

---

## Classes <a name="Classes" id="Classes"></a>

### AwsAssumeRoleStep <a name="AwsAssumeRoleStep" id="projen-pipelines.AwsAssumeRoleStep"></a>

A step that assumes a role in AWS.

#### Initializers <a name="Initializers" id="projen-pipelines.AwsAssumeRoleStep.Initializer"></a>

```typescript
import { AwsAssumeRoleStep } from 'projen-pipelines'

new AwsAssumeRoleStep(project: Project, config: AwsAssumeRoleStepConfig)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.AwsAssumeRoleStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.AwsAssumeRoleStep.Initializer.parameter.config">config</a></code> | <code><a href="#projen-pipelines.AwsAssumeRoleStepConfig">AwsAssumeRoleStepConfig</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.AwsAssumeRoleStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.AwsAssumeRoleStep.Initializer.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.AwsAssumeRoleStepConfig">AwsAssumeRoleStepConfig</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.AwsAssumeRoleStep.toBash">toBash</a></code> | Generates a configuration for a bash script step. |
| <code><a href="#projen-pipelines.AwsAssumeRoleStep.toCodeCatalyst">toCodeCatalyst</a></code> | Generates a configuration for a CodeCatalyst Actions step. |
| <code><a href="#projen-pipelines.AwsAssumeRoleStep.toGithub">toGithub</a></code> | Generates a configuration for a GitHub Actions step. |
| <code><a href="#projen-pipelines.AwsAssumeRoleStep.toGitlab">toGitlab</a></code> | Generates a configuration for a GitLab CI step. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.AwsAssumeRoleStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Generates a configuration for a bash script step.

Should be implemented by subclasses.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.AwsAssumeRoleStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Generates a configuration for a CodeCatalyst Actions step.

Should be implemented by subclasses.

##### `toGithub` <a name="toGithub" id="projen-pipelines.AwsAssumeRoleStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Generates a configuration for a GitHub Actions step.

Should be implemented by subclasses.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.AwsAssumeRoleStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Generates a configuration for a GitLab CI step.

Should be implemented by subclasses.




### CloudFormationOutput <a name="CloudFormationOutput" id="projen-pipelines.CloudFormationOutput"></a>

CloudFormation output configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CloudFormationOutput.toConfig">toConfig</a></code> | Convert to configuration object. |

---

##### `toConfig` <a name="toConfig" id="projen-pipelines.CloudFormationOutput.toConfig"></a>

```typescript
public toConfig(): any
```

Convert to configuration object.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CloudFormationOutput.disabled">disabled</a></code> | Disable CloudFormation outputs. |
| <code><a href="#projen-pipelines.CloudFormationOutput.enabled">enabled</a></code> | Enable CloudFormation outputs with default configuration. |
| <code><a href="#projen-pipelines.CloudFormationOutput.withConfig">withConfig</a></code> | Configure CloudFormation outputs with custom settings. |

---

##### `disabled` <a name="disabled" id="projen-pipelines.CloudFormationOutput.disabled"></a>

```typescript
import { CloudFormationOutput } from 'projen-pipelines'

CloudFormationOutput.disabled()
```

Disable CloudFormation outputs.

##### `enabled` <a name="enabled" id="projen-pipelines.CloudFormationOutput.enabled"></a>

```typescript
import { CloudFormationOutput } from 'projen-pipelines'

CloudFormationOutput.enabled()
```

Enable CloudFormation outputs with default configuration.

##### `withConfig` <a name="withConfig" id="projen-pipelines.CloudFormationOutput.withConfig"></a>

```typescript
import { CloudFormationOutput } from 'projen-pipelines'

CloudFormationOutput.withConfig(config: CloudFormationOutputConfig)
```

Configure CloudFormation outputs with custom settings.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.CloudFormationOutput.withConfig.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.CloudFormationOutputConfig">CloudFormationOutputConfig</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CloudFormationOutput.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `type`<sup>Required</sup> <a name="type" id="projen-pipelines.CloudFormationOutput.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CloudFormationOutput.property.TYPE">TYPE</a></code> | <code>string</code> | *No description.* |

---

##### `TYPE`<sup>Required</sup> <a name="TYPE" id="projen-pipelines.CloudFormationOutput.property.TYPE"></a>

```typescript
public readonly TYPE: string;
```

- *Type:* string

---

### CodeArtifactLoginStep <a name="CodeArtifactLoginStep" id="projen-pipelines.CodeArtifactLoginStep"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.CodeArtifactLoginStep.Initializer"></a>

```typescript
import { CodeArtifactLoginStep } from 'projen-pipelines'

new CodeArtifactLoginStep(project: Project, options: CodeArtifactLoginStepOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.CodeArtifactLoginStepOptions">CodeArtifactLoginStepOptions</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.CodeArtifactLoginStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.CodeArtifactLoginStep.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.CodeArtifactLoginStepOptions">CodeArtifactLoginStepOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.toBash">toBash</a></code> | Converts the sequence of steps into a Bash script configuration. |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.toCodeCatalyst">toCodeCatalyst</a></code> | Converts the sequence of steps into a CodeCatalyst Actions step configuration. |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.toGithub">toGithub</a></code> | Converts the sequence of steps into a GitHub Actions step configuration. |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.toGitlab">toGitlab</a></code> | Converts the sequence of steps into a GitLab CI configuration. |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.addSteps">addSteps</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CodeArtifactLoginStep.prependSteps">prependSteps</a></code> | *No description.* |

---

##### `toBash` <a name="toBash" id="projen-pipelines.CodeArtifactLoginStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Converts the sequence of steps into a Bash script configuration.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.CodeArtifactLoginStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Converts the sequence of steps into a CodeCatalyst Actions step configuration.

##### `toGithub` <a name="toGithub" id="projen-pipelines.CodeArtifactLoginStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Converts the sequence of steps into a GitHub Actions step configuration.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.CodeArtifactLoginStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Converts the sequence of steps into a GitLab CI configuration.

##### `addSteps` <a name="addSteps" id="projen-pipelines.CodeArtifactLoginStep.addSteps"></a>

```typescript
public addSteps(steps: ...PipelineStep[]): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.CodeArtifactLoginStep.addSteps.parameter.steps"></a>

- *Type:* ...<a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `prependSteps` <a name="prependSteps" id="projen-pipelines.CodeArtifactLoginStep.prependSteps"></a>

```typescript
public prependSteps(steps: ...PipelineStep[]): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.CodeArtifactLoginStep.prependSteps.parameter.steps"></a>

- *Type:* ...<a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---




### CompositeComputation <a name="CompositeComputation" id="projen-pipelines.CompositeComputation"></a>

Composite version computation that combines multiple strategies.

#### Initializers <a name="Initializers" id="projen-pipelines.CompositeComputation.Initializer"></a>

```typescript
import { CompositeComputation } from 'projen-pipelines'

new CompositeComputation(strategy: VersioningStrategy)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CompositeComputation.Initializer.parameter.strategy">strategy</a></code> | <code><a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a></code> | *No description.* |

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.CompositeComputation.Initializer.parameter.strategy"></a>

- *Type:* <a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CompositeComputation.computeVersion">computeVersion</a></code> | Compute version string from context. |
| <code><a href="#projen-pipelines.CompositeComputation.createVersionInfo">createVersionInfo</a></code> | Create VersionInfo from context. |

---

##### `computeVersion` <a name="computeVersion" id="projen-pipelines.CompositeComputation.computeVersion"></a>

```typescript
public computeVersion(context: ComputationContext): string
```

Compute version string from context.

###### `context`<sup>Required</sup> <a name="context" id="projen-pipelines.CompositeComputation.computeVersion.parameter.context"></a>

- *Type:* <a href="#projen-pipelines.ComputationContext">ComputationContext</a>

---

##### `createVersionInfo` <a name="createVersionInfo" id="projen-pipelines.CompositeComputation.createVersionInfo"></a>

```typescript
public createVersionInfo(context: ComputationContext): VersionInfo
```

Create VersionInfo from context.

###### `context`<sup>Required</sup> <a name="context" id="projen-pipelines.CompositeComputation.createVersionInfo.parameter.context"></a>

- *Type:* <a href="#projen-pipelines.ComputationContext">ComputationContext</a>

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CompositeComputation.property.strategy">strategy</a></code> | <code><a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a></code> | *No description.* |

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.CompositeComputation.property.strategy"></a>

```typescript
public readonly strategy: VersioningStrategy;
```

- *Type:* <a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a>

---


### DownloadArtifactStep <a name="DownloadArtifactStep" id="projen-pipelines.DownloadArtifactStep"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.DownloadArtifactStep.Initializer"></a>

```typescript
import { DownloadArtifactStep } from 'projen-pipelines'

new DownloadArtifactStep(project: Project, config: DownloadArtifactStepConfig)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.DownloadArtifactStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.DownloadArtifactStep.Initializer.parameter.config">config</a></code> | <code><a href="#projen-pipelines.DownloadArtifactStepConfig">DownloadArtifactStepConfig</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.DownloadArtifactStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.DownloadArtifactStep.Initializer.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.DownloadArtifactStepConfig">DownloadArtifactStepConfig</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.DownloadArtifactStep.toBash">toBash</a></code> | Generates a configuration for a bash script step. |
| <code><a href="#projen-pipelines.DownloadArtifactStep.toCodeCatalyst">toCodeCatalyst</a></code> | Converts the step into a CodeCatalyst Actions step configuration. |
| <code><a href="#projen-pipelines.DownloadArtifactStep.toGithub">toGithub</a></code> | Generates a configuration for a GitHub Actions step. |
| <code><a href="#projen-pipelines.DownloadArtifactStep.toGitlab">toGitlab</a></code> | Generates a configuration for a GitLab CI step. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.DownloadArtifactStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Generates a configuration for a bash script step.

Should be implemented by subclasses.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.DownloadArtifactStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Converts the step into a CodeCatalyst Actions step configuration.

##### `toGithub` <a name="toGithub" id="projen-pipelines.DownloadArtifactStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Generates a configuration for a GitHub Actions step.

Should be implemented by subclasses.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.DownloadArtifactStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Generates a configuration for a GitLab CI step.

Should be implemented by subclasses.




### GithubPackagesLoginStep <a name="GithubPackagesLoginStep" id="projen-pipelines.GithubPackagesLoginStep"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.GithubPackagesLoginStep.Initializer"></a>

```typescript
import { GithubPackagesLoginStep } from 'projen-pipelines'

new GithubPackagesLoginStep(project: Project, options: GithubPackagesLoginStepOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.GithubPackagesLoginStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.GithubPackagesLoginStep.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.GithubPackagesLoginStepOptions">GithubPackagesLoginStepOptions</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.GithubPackagesLoginStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.GithubPackagesLoginStep.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.GithubPackagesLoginStepOptions">GithubPackagesLoginStepOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.GithubPackagesLoginStep.toBash">toBash</a></code> | Generates a configuration for a bash script step. |
| <code><a href="#projen-pipelines.GithubPackagesLoginStep.toCodeCatalyst">toCodeCatalyst</a></code> | Generates a configuration for a CodeCatalyst Actions step. |
| <code><a href="#projen-pipelines.GithubPackagesLoginStep.toGithub">toGithub</a></code> | Generates a configuration for a GitHub Actions step. |
| <code><a href="#projen-pipelines.GithubPackagesLoginStep.toGitlab">toGitlab</a></code> | Generates a configuration for a GitLab CI step. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.GithubPackagesLoginStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Generates a configuration for a bash script step.

Should be implemented by subclasses.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.GithubPackagesLoginStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Generates a configuration for a CodeCatalyst Actions step.

Should be implemented by subclasses.

##### `toGithub` <a name="toGithub" id="projen-pipelines.GithubPackagesLoginStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Generates a configuration for a GitHub Actions step.

Should be implemented by subclasses.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.GithubPackagesLoginStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Generates a configuration for a GitLab CI step.

Should be implemented by subclasses.




### OutputConfigBase <a name="OutputConfigBase" id="projen-pipelines.OutputConfigBase"></a>

Base class for output configurations.

#### Initializers <a name="Initializers" id="projen-pipelines.OutputConfigBase.Initializer"></a>

```typescript
import { OutputConfigBase } from 'projen-pipelines'

new OutputConfigBase(type: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.OutputConfigBase.Initializer.parameter.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `type`<sup>Required</sup> <a name="type" id="projen-pipelines.OutputConfigBase.Initializer.parameter.type"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.OutputConfigBase.toConfig">toConfig</a></code> | Convert to configuration object. |

---

##### `toConfig` <a name="toConfig" id="projen-pipelines.OutputConfigBase.toConfig"></a>

```typescript
public toConfig(): any
```

Convert to configuration object.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.OutputConfigBase.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `type`<sup>Required</sup> <a name="type" id="projen-pipelines.OutputConfigBase.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### OutputFormat <a name="OutputFormat" id="projen-pipelines.OutputFormat"></a>

Output format types.




#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.OutputFormat.property.PLAIN">PLAIN</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.OutputFormat.property.STRUCTURED">STRUCTURED</a></code> | <code>string</code> | *No description.* |

---

##### `PLAIN`<sup>Required</sup> <a name="PLAIN" id="projen-pipelines.OutputFormat.property.PLAIN"></a>

```typescript
public readonly PLAIN: string;
```

- *Type:* string

---

##### `STRUCTURED`<sup>Required</sup> <a name="STRUCTURED" id="projen-pipelines.OutputFormat.property.STRUCTURED"></a>

```typescript
public readonly STRUCTURED: string;
```

- *Type:* string

---

### ParameterStoreOutput <a name="ParameterStoreOutput" id="projen-pipelines.ParameterStoreOutput"></a>

SSM Parameter Store output configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.ParameterStoreOutput.toConfig">toConfig</a></code> | Convert to configuration object. |

---

##### `toConfig` <a name="toConfig" id="projen-pipelines.ParameterStoreOutput.toConfig"></a>

```typescript
public toConfig(): any
```

Convert to configuration object.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.ParameterStoreOutput.disabled">disabled</a></code> | Disable Parameter Store outputs. |
| <code><a href="#projen-pipelines.ParameterStoreOutput.enabled">enabled</a></code> | Enable Parameter Store outputs with parameter name. |
| <code><a href="#projen-pipelines.ParameterStoreOutput.hierarchical">hierarchical</a></code> | Configure Parameter Store with hierarchical parameters. |
| <code><a href="#projen-pipelines.ParameterStoreOutput.withConfig">withConfig</a></code> | Configure Parameter Store outputs with custom settings. |

---

##### `disabled` <a name="disabled" id="projen-pipelines.ParameterStoreOutput.disabled"></a>

```typescript
import { ParameterStoreOutput } from 'projen-pipelines'

ParameterStoreOutput.disabled()
```

Disable Parameter Store outputs.

##### `enabled` <a name="enabled" id="projen-pipelines.ParameterStoreOutput.enabled"></a>

```typescript
import { ParameterStoreOutput } from 'projen-pipelines'

ParameterStoreOutput.enabled(parameterName: string)
```

Enable Parameter Store outputs with parameter name.

###### `parameterName`<sup>Required</sup> <a name="parameterName" id="projen-pipelines.ParameterStoreOutput.enabled.parameter.parameterName"></a>

- *Type:* string

---

##### `hierarchical` <a name="hierarchical" id="projen-pipelines.ParameterStoreOutput.hierarchical"></a>

```typescript
import { ParameterStoreOutput } from 'projen-pipelines'

ParameterStoreOutput.hierarchical(basePath: string, options?: HierarchicalParametersOptions)
```

Configure Parameter Store with hierarchical parameters.

###### `basePath`<sup>Required</sup> <a name="basePath" id="projen-pipelines.ParameterStoreOutput.hierarchical.parameter.basePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="projen-pipelines.ParameterStoreOutput.hierarchical.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.HierarchicalParametersOptions">HierarchicalParametersOptions</a>

---

##### `withConfig` <a name="withConfig" id="projen-pipelines.ParameterStoreOutput.withConfig"></a>

```typescript
import { ParameterStoreOutput } from 'projen-pipelines'

ParameterStoreOutput.withConfig(config: ParameterStoreConfig)
```

Configure Parameter Store outputs with custom settings.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.ParameterStoreOutput.withConfig.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.ParameterStoreConfig">ParameterStoreConfig</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.ParameterStoreOutput.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `type`<sup>Required</sup> <a name="type" id="projen-pipelines.ParameterStoreOutput.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.ParameterStoreOutput.property.TYPE">TYPE</a></code> | <code>string</code> | *No description.* |

---

##### `TYPE`<sup>Required</sup> <a name="TYPE" id="projen-pipelines.ParameterStoreOutput.property.TYPE"></a>

```typescript
public readonly TYPE: string;
```

- *Type:* string

---

### PipelineStep <a name="PipelineStep" id="projen-pipelines.PipelineStep"></a>

Abstract class defining the structure of a pipeline step.

#### Initializers <a name="Initializers" id="projen-pipelines.PipelineStep.Initializer"></a>

```typescript
import { PipelineStep } from 'projen-pipelines'

new PipelineStep(project: Project)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.PipelineStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.PipelineStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.PipelineStep.toBash">toBash</a></code> | Generates a configuration for a bash script step. |
| <code><a href="#projen-pipelines.PipelineStep.toCodeCatalyst">toCodeCatalyst</a></code> | Generates a configuration for a CodeCatalyst Actions step. |
| <code><a href="#projen-pipelines.PipelineStep.toGithub">toGithub</a></code> | Generates a configuration for a GitHub Actions step. |
| <code><a href="#projen-pipelines.PipelineStep.toGitlab">toGitlab</a></code> | Generates a configuration for a GitLab CI step. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.PipelineStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Generates a configuration for a bash script step.

Should be implemented by subclasses.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.PipelineStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Generates a configuration for a CodeCatalyst Actions step.

Should be implemented by subclasses.

##### `toGithub` <a name="toGithub" id="projen-pipelines.PipelineStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Generates a configuration for a GitHub Actions step.

Should be implemented by subclasses.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.PipelineStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Generates a configuration for a GitLab CI step.

Should be implemented by subclasses.




### ProjenScriptStep <a name="ProjenScriptStep" id="projen-pipelines.ProjenScriptStep"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.ProjenScriptStep.Initializer"></a>

```typescript
import { ProjenScriptStep } from 'projen-pipelines'

new ProjenScriptStep(project: Project, scriptName: string, args?: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.ProjenScriptStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.ProjenScriptStep.Initializer.parameter.scriptName">scriptName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.ProjenScriptStep.Initializer.parameter.args">args</a></code> | <code>string</code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.ProjenScriptStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `scriptName`<sup>Required</sup> <a name="scriptName" id="projen-pipelines.ProjenScriptStep.Initializer.parameter.scriptName"></a>

- *Type:* string

---

##### `args`<sup>Optional</sup> <a name="args" id="projen-pipelines.ProjenScriptStep.Initializer.parameter.args"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.ProjenScriptStep.toBash">toBash</a></code> | Converts the step into a Bash script configuration. |
| <code><a href="#projen-pipelines.ProjenScriptStep.toCodeCatalyst">toCodeCatalyst</a></code> | Converts the step into a CodeCatalyst Actions step configuration. |
| <code><a href="#projen-pipelines.ProjenScriptStep.toGithub">toGithub</a></code> | Converts the step into a GitHub Actions step configuration. |
| <code><a href="#projen-pipelines.ProjenScriptStep.toGitlab">toGitlab</a></code> | Converts the step into a GitLab CI configuration. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.ProjenScriptStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Converts the step into a Bash script configuration.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.ProjenScriptStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Converts the step into a CodeCatalyst Actions step configuration.

##### `toGithub` <a name="toGithub" id="projen-pipelines.ProjenScriptStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Converts the step into a GitHub Actions step configuration.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.ProjenScriptStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Converts the step into a GitLab CI configuration.




### SimpleCommandStep <a name="SimpleCommandStep" id="projen-pipelines.SimpleCommandStep"></a>

Concrete implementation of PipelineStep that executes simple commands.

#### Initializers <a name="Initializers" id="projen-pipelines.SimpleCommandStep.Initializer"></a>

```typescript
import { SimpleCommandStep } from 'projen-pipelines'

new SimpleCommandStep(project: Project, commands: string[])
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.SimpleCommandStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.SimpleCommandStep.Initializer.parameter.commands">commands</a></code> | <code>string[]</code> | - Shell commands to execute. |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.SimpleCommandStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `commands`<sup>Required</sup> <a name="commands" id="projen-pipelines.SimpleCommandStep.Initializer.parameter.commands"></a>

- *Type:* string[]

Shell commands to execute.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.SimpleCommandStep.toBash">toBash</a></code> | Converts the step into a Bash script configuration. |
| <code><a href="#projen-pipelines.SimpleCommandStep.toCodeCatalyst">toCodeCatalyst</a></code> | Converts the step into a CodeCatalyst Actions step configuration. |
| <code><a href="#projen-pipelines.SimpleCommandStep.toGithub">toGithub</a></code> | Converts the step into a GitHub Actions step configuration. |
| <code><a href="#projen-pipelines.SimpleCommandStep.toGitlab">toGitlab</a></code> | Converts the step into a GitLab CI configuration. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.SimpleCommandStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Converts the step into a Bash script configuration.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.SimpleCommandStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Converts the step into a CodeCatalyst Actions step configuration.

##### `toGithub` <a name="toGithub" id="projen-pipelines.SimpleCommandStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Converts the step into a GitHub Actions step configuration.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.SimpleCommandStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Converts the step into a GitLab CI configuration.




### StepSequence <a name="StepSequence" id="projen-pipelines.StepSequence"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.StepSequence.Initializer"></a>

```typescript
import { StepSequence } from 'projen-pipelines'

new StepSequence(project: Project, steps: PipelineStep[])
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.StepSequence.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.StepSequence.Initializer.parameter.steps">steps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | - The sequence of pipeline steps. |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.StepSequence.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.StepSequence.Initializer.parameter.steps"></a>

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

The sequence of pipeline steps.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.StepSequence.toBash">toBash</a></code> | Converts the sequence of steps into a Bash script configuration. |
| <code><a href="#projen-pipelines.StepSequence.toCodeCatalyst">toCodeCatalyst</a></code> | Converts the sequence of steps into a CodeCatalyst Actions step configuration. |
| <code><a href="#projen-pipelines.StepSequence.toGithub">toGithub</a></code> | Converts the sequence of steps into a GitHub Actions step configuration. |
| <code><a href="#projen-pipelines.StepSequence.toGitlab">toGitlab</a></code> | Converts the sequence of steps into a GitLab CI configuration. |
| <code><a href="#projen-pipelines.StepSequence.addSteps">addSteps</a></code> | *No description.* |
| <code><a href="#projen-pipelines.StepSequence.prependSteps">prependSteps</a></code> | *No description.* |

---

##### `toBash` <a name="toBash" id="projen-pipelines.StepSequence.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Converts the sequence of steps into a Bash script configuration.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.StepSequence.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Converts the sequence of steps into a CodeCatalyst Actions step configuration.

##### `toGithub` <a name="toGithub" id="projen-pipelines.StepSequence.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Converts the sequence of steps into a GitHub Actions step configuration.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.StepSequence.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Converts the sequence of steps into a GitLab CI configuration.

##### `addSteps` <a name="addSteps" id="projen-pipelines.StepSequence.addSteps"></a>

```typescript
public addSteps(steps: ...PipelineStep[]): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.StepSequence.addSteps.parameter.steps"></a>

- *Type:* ...<a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `prependSteps` <a name="prependSteps" id="projen-pipelines.StepSequence.prependSteps"></a>

```typescript
public prependSteps(steps: ...PipelineStep[]): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.StepSequence.prependSteps.parameter.steps"></a>

- *Type:* ...<a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---




### UploadArtifactStep <a name="UploadArtifactStep" id="projen-pipelines.UploadArtifactStep"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.UploadArtifactStep.Initializer"></a>

```typescript
import { UploadArtifactStep } from 'projen-pipelines'

new UploadArtifactStep(project: Project, config: UploadArtifactStepConfig)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.UploadArtifactStep.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | - The projen project reference. |
| <code><a href="#projen-pipelines.UploadArtifactStep.Initializer.parameter.config">config</a></code> | <code><a href="#projen-pipelines.UploadArtifactStepConfig">UploadArtifactStepConfig</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.UploadArtifactStep.Initializer.parameter.project"></a>

- *Type:* projen.Project

The projen project reference.

---

##### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.UploadArtifactStep.Initializer.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.UploadArtifactStepConfig">UploadArtifactStepConfig</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.UploadArtifactStep.toBash">toBash</a></code> | Generates a configuration for a bash script step. |
| <code><a href="#projen-pipelines.UploadArtifactStep.toCodeCatalyst">toCodeCatalyst</a></code> | Converts the step into a CodeCatalyst Actions step configuration. |
| <code><a href="#projen-pipelines.UploadArtifactStep.toGithub">toGithub</a></code> | Generates a configuration for a GitHub Actions step. |
| <code><a href="#projen-pipelines.UploadArtifactStep.toGitlab">toGitlab</a></code> | Generates a configuration for a GitLab CI step. |

---

##### `toBash` <a name="toBash" id="projen-pipelines.UploadArtifactStep.toBash"></a>

```typescript
public toBash(): BashStepConfig
```

Generates a configuration for a bash script step.

Should be implemented by subclasses.

##### `toCodeCatalyst` <a name="toCodeCatalyst" id="projen-pipelines.UploadArtifactStep.toCodeCatalyst"></a>

```typescript
public toCodeCatalyst(): CodeCatalystStepConfig
```

Converts the step into a CodeCatalyst Actions step configuration.

##### `toGithub` <a name="toGithub" id="projen-pipelines.UploadArtifactStep.toGithub"></a>

```typescript
public toGithub(): GithubStepConfig
```

Generates a configuration for a GitHub Actions step.

Should be implemented by subclasses.

##### `toGitlab` <a name="toGitlab" id="projen-pipelines.UploadArtifactStep.toGitlab"></a>

```typescript
public toGitlab(): GitlabStepConfig
```

Generates a configuration for a GitLab CI step.

Should be implemented by subclasses.




### VersionComputationStrategy <a name="VersionComputationStrategy" id="projen-pipelines.VersionComputationStrategy"></a>

Base class for version computation strategies.

#### Initializers <a name="Initializers" id="projen-pipelines.VersionComputationStrategy.Initializer"></a>

```typescript
import { VersionComputationStrategy } from 'projen-pipelines'

new VersionComputationStrategy(strategy: VersioningStrategy)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersionComputationStrategy.Initializer.parameter.strategy">strategy</a></code> | <code><a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a></code> | *No description.* |

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.VersionComputationStrategy.Initializer.parameter.strategy"></a>

- *Type:* <a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersionComputationStrategy.computeVersion">computeVersion</a></code> | Compute version string from context. |
| <code><a href="#projen-pipelines.VersionComputationStrategy.createVersionInfo">createVersionInfo</a></code> | Create VersionInfo from context. |

---

##### `computeVersion` <a name="computeVersion" id="projen-pipelines.VersionComputationStrategy.computeVersion"></a>

```typescript
public computeVersion(context: ComputationContext): string
```

Compute version string from context.

###### `context`<sup>Required</sup> <a name="context" id="projen-pipelines.VersionComputationStrategy.computeVersion.parameter.context"></a>

- *Type:* <a href="#projen-pipelines.ComputationContext">ComputationContext</a>

---

##### `createVersionInfo` <a name="createVersionInfo" id="projen-pipelines.VersionComputationStrategy.createVersionInfo"></a>

```typescript
public createVersionInfo(context: ComputationContext): VersionInfo
```

Create VersionInfo from context.

###### `context`<sup>Required</sup> <a name="context" id="projen-pipelines.VersionComputationStrategy.createVersionInfo.parameter.context"></a>

- *Type:* <a href="#projen-pipelines.ComputationContext">ComputationContext</a>

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersionComputationStrategy.property.strategy">strategy</a></code> | <code><a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a></code> | *No description.* |

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.VersionComputationStrategy.property.strategy"></a>

```typescript
public readonly strategy: VersioningStrategy;
```

- *Type:* <a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a>

---


### VersionComputer <a name="VersionComputer" id="projen-pipelines.VersionComputer"></a>

Main version computer that handles strategy selection.

#### Initializers <a name="Initializers" id="projen-pipelines.VersionComputer.Initializer"></a>

```typescript
import { VersionComputer } from 'projen-pipelines'

new VersionComputer(strategy: IVersioningStrategy)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersionComputer.Initializer.parameter.strategy">strategy</a></code> | <code><a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a></code> | *No description.* |

---

##### `strategy`<sup>Required</sup> <a name="strategy" id="projen-pipelines.VersionComputer.Initializer.parameter.strategy"></a>

- *Type:* <a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersionComputer.computeVersionInfo">computeVersionInfo</a></code> | Compute version info from context. |

---

##### `computeVersionInfo` <a name="computeVersionInfo" id="projen-pipelines.VersionComputer.computeVersionInfo"></a>

```typescript
public computeVersionInfo(context: ComputationContext): VersionInfo
```

Compute version info from context.

###### `context`<sup>Required</sup> <a name="context" id="projen-pipelines.VersionComputer.computeVersionInfo.parameter.context"></a>

- *Type:* <a href="#projen-pipelines.ComputationContext">ComputationContext</a>

---




### VersionInfo <a name="VersionInfo" id="projen-pipelines.VersionInfo"></a>

- *Implements:* <a href="#projen-pipelines.IVersionInfo">IVersionInfo</a>

Represents complete version information for a deployment.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersionInfo.compare">compare</a></code> | Compare with another version Returns: -1 if this < other, 0 if equal, 1 if this > other. |
| <code><a href="#projen-pipelines.VersionInfo.displayVersion">displayVersion</a></code> | Get formatted version for display. |
| <code><a href="#projen-pipelines.VersionInfo.exportName">exportName</a></code> | Create CloudFormation export name. |
| <code><a href="#projen-pipelines.VersionInfo.mainBranch">mainBranch</a></code> | Check if this version is from the main branch. |
| <code><a href="#projen-pipelines.VersionInfo.parameterName">parameterName</a></code> | Create a parameter name for SSM Parameter Store. |
| <code><a href="#projen-pipelines.VersionInfo.taggedRelease">taggedRelease</a></code> | Check if this version is from a tagged release. |
| <code><a href="#projen-pipelines.VersionInfo.toJson">toJson</a></code> | Convert to JSON string. |
| <code><a href="#projen-pipelines.VersionInfo.toObject">toObject</a></code> | Convert to object. |
| <code><a href="#projen-pipelines.VersionInfo.toString">toString</a></code> | Convert to plain version string. |

---

##### `compare` <a name="compare" id="projen-pipelines.VersionInfo.compare"></a>

```typescript
public compare(other: VersionInfo): number
```

Compare with another version Returns: -1 if this < other, 0 if equal, 1 if this > other.

###### `other`<sup>Required</sup> <a name="other" id="projen-pipelines.VersionInfo.compare.parameter.other"></a>

- *Type:* <a href="#projen-pipelines.VersionInfo">VersionInfo</a>

---

##### `displayVersion` <a name="displayVersion" id="projen-pipelines.VersionInfo.displayVersion"></a>

```typescript
public displayVersion(): string
```

Get formatted version for display.

##### `exportName` <a name="exportName" id="projen-pipelines.VersionInfo.exportName"></a>

```typescript
public exportName(template: string): string
```

Create CloudFormation export name.

###### `template`<sup>Required</sup> <a name="template" id="projen-pipelines.VersionInfo.exportName.parameter.template"></a>

- *Type:* string

---

##### `mainBranch` <a name="mainBranch" id="projen-pipelines.VersionInfo.mainBranch"></a>

```typescript
public mainBranch(): boolean
```

Check if this version is from the main branch.

##### `parameterName` <a name="parameterName" id="projen-pipelines.VersionInfo.parameterName"></a>

```typescript
public parameterName(template: string): string
```

Create a parameter name for SSM Parameter Store.

###### `template`<sup>Required</sup> <a name="template" id="projen-pipelines.VersionInfo.parameterName.parameter.template"></a>

- *Type:* string

---

##### `taggedRelease` <a name="taggedRelease" id="projen-pipelines.VersionInfo.taggedRelease"></a>

```typescript
public taggedRelease(): boolean
```

Check if this version is from a tagged release.

##### `toJson` <a name="toJson" id="projen-pipelines.VersionInfo.toJson"></a>

```typescript
public toJson(pretty?: boolean): string
```

Convert to JSON string.

###### `pretty`<sup>Optional</sup> <a name="pretty" id="projen-pipelines.VersionInfo.toJson.parameter.pretty"></a>

- *Type:* boolean

---

##### `toObject` <a name="toObject" id="projen-pipelines.VersionInfo.toObject"></a>

```typescript
public toObject(): IVersionInfo
```

Convert to object.

##### `toString` <a name="toString" id="projen-pipelines.VersionInfo.toString"></a>

```typescript
public toString(): string
```

Convert to plain version string.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersionInfo.create">create</a></code> | Create a VersionInfo instance from raw data. |
| <code><a href="#projen-pipelines.VersionInfo.fromEnvironment">fromEnvironment</a></code> | Create a VersionInfo instance from environment variables. |
| <code><a href="#projen-pipelines.VersionInfo.fromJson">fromJson</a></code> | Create a VersionInfo instance from a JSON string. |

---

##### `create` <a name="create" id="projen-pipelines.VersionInfo.create"></a>

```typescript
import { VersionInfo } from 'projen-pipelines'

VersionInfo.create(props: IVersionInfo)
```

Create a VersionInfo instance from raw data.

###### `props`<sup>Required</sup> <a name="props" id="projen-pipelines.VersionInfo.create.parameter.props"></a>

- *Type:* <a href="#projen-pipelines.IVersionInfo">IVersionInfo</a>

---

##### `fromEnvironment` <a name="fromEnvironment" id="projen-pipelines.VersionInfo.fromEnvironment"></a>

```typescript
import { VersionInfo } from 'projen-pipelines'

VersionInfo.fromEnvironment(env: {[ key: string ]: string})
```

Create a VersionInfo instance from environment variables.

###### `env`<sup>Required</sup> <a name="env" id="projen-pipelines.VersionInfo.fromEnvironment.parameter.env"></a>

- *Type:* {[ key: string ]: string}

---

##### `fromJson` <a name="fromJson" id="projen-pipelines.VersionInfo.fromJson"></a>

```typescript
import { VersionInfo } from 'projen-pipelines'

VersionInfo.fromJson(json: string)
```

Create a VersionInfo instance from a JSON string.

###### `json`<sup>Required</sup> <a name="json" id="projen-pipelines.VersionInfo.fromJson.parameter.json"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersionInfo.property.branch">branch</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.commitCount">commitCount</a></code> | <code>number</code> | Commit count information. |
| <code><a href="#projen-pipelines.VersionInfo.property.commitHash">commitHash</a></code> | <code>string</code> | Git information (ALWAYS included). |
| <code><a href="#projen-pipelines.VersionInfo.property.commitHashShort">commitHashShort</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.deployedAt">deployedAt</a></code> | <code>string</code> | Deployment metadata. |
| <code><a href="#projen-pipelines.VersionInfo.property.deployedBy">deployedBy</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.version">version</a></code> | <code>string</code> | Primary version string. |
| <code><a href="#projen-pipelines.VersionInfo.property.buildNumber">buildNumber</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.commitsSinceTag">commitsSinceTag</a></code> | <code>number</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.packageVersion">packageVersion</a></code> | <code>string</code> | Package.json information (if applicable). |
| <code><a href="#projen-pipelines.VersionInfo.property.pipelineVersion">pipelineVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.VersionInfo.property.repository">repository</a></code> | <code>string</code> | Additional metadata. |
| <code><a href="#projen-pipelines.VersionInfo.property.tag">tag</a></code> | <code>string</code> | Optional git tag information. |

---

##### `branch`<sup>Required</sup> <a name="branch" id="projen-pipelines.VersionInfo.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

---

##### `commitCount`<sup>Required</sup> <a name="commitCount" id="projen-pipelines.VersionInfo.property.commitCount"></a>

```typescript
public readonly commitCount: number;
```

- *Type:* number

Commit count information.

---

##### `commitHash`<sup>Required</sup> <a name="commitHash" id="projen-pipelines.VersionInfo.property.commitHash"></a>

```typescript
public readonly commitHash: string;
```

- *Type:* string

Git information (ALWAYS included).

---

##### `commitHashShort`<sup>Required</sup> <a name="commitHashShort" id="projen-pipelines.VersionInfo.property.commitHashShort"></a>

```typescript
public readonly commitHashShort: string;
```

- *Type:* string

---

##### `deployedAt`<sup>Required</sup> <a name="deployedAt" id="projen-pipelines.VersionInfo.property.deployedAt"></a>

```typescript
public readonly deployedAt: string;
```

- *Type:* string

Deployment metadata.

---

##### `deployedBy`<sup>Required</sup> <a name="deployedBy" id="projen-pipelines.VersionInfo.property.deployedBy"></a>

```typescript
public readonly deployedBy: string;
```

- *Type:* string

---

##### `environment`<sup>Required</sup> <a name="environment" id="projen-pipelines.VersionInfo.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `version`<sup>Required</sup> <a name="version" id="projen-pipelines.VersionInfo.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

Primary version string.

---

##### `buildNumber`<sup>Optional</sup> <a name="buildNumber" id="projen-pipelines.VersionInfo.property.buildNumber"></a>

```typescript
public readonly buildNumber: string;
```

- *Type:* string

---

##### `commitsSinceTag`<sup>Optional</sup> <a name="commitsSinceTag" id="projen-pipelines.VersionInfo.property.commitsSinceTag"></a>

```typescript
public readonly commitsSinceTag: number;
```

- *Type:* number

---

##### `packageVersion`<sup>Optional</sup> <a name="packageVersion" id="projen-pipelines.VersionInfo.property.packageVersion"></a>

```typescript
public readonly packageVersion: string;
```

- *Type:* string

Package.json information (if applicable).

---

##### `pipelineVersion`<sup>Optional</sup> <a name="pipelineVersion" id="projen-pipelines.VersionInfo.property.pipelineVersion"></a>

```typescript
public readonly pipelineVersion: string;
```

- *Type:* string

---

##### `repository`<sup>Optional</sup> <a name="repository" id="projen-pipelines.VersionInfo.property.repository"></a>

```typescript
public readonly repository: string;
```

- *Type:* string

Additional metadata.

---

##### `tag`<sup>Optional</sup> <a name="tag" id="projen-pipelines.VersionInfo.property.tag"></a>

```typescript
public readonly tag: string;
```

- *Type:* string

Optional git tag information.

---


### VersionInfoBuilder <a name="VersionInfoBuilder" id="projen-pipelines.VersionInfoBuilder"></a>

Builder class for creating VersionInfo instances.

#### Initializers <a name="Initializers" id="projen-pipelines.VersionInfoBuilder.Initializer"></a>

```typescript
import { VersionInfoBuilder } from 'projen-pipelines'

new VersionInfoBuilder()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersionInfoBuilder.create">create</a></code> | Build the VersionInfo instance. |
| <code><a href="#projen-pipelines.VersionInfoBuilder.deploymentInfo">deploymentInfo</a></code> | Set deployment metadata. |
| <code><a href="#projen-pipelines.VersionInfoBuilder.gitInfo">gitInfo</a></code> | Set git information. |
| <code><a href="#projen-pipelines.VersionInfoBuilder.packageVersion">packageVersion</a></code> | Set package version. |
| <code><a href="#projen-pipelines.VersionInfoBuilder.pipelineVersion">pipelineVersion</a></code> | Set pipeline version. |
| <code><a href="#projen-pipelines.VersionInfoBuilder.repository">repository</a></code> | Set repository information. |
| <code><a href="#projen-pipelines.VersionInfoBuilder.version">version</a></code> | Set the version string. |

---

##### `create` <a name="create" id="projen-pipelines.VersionInfoBuilder.create"></a>

```typescript
public create(): VersionInfo
```

Build the VersionInfo instance.

##### `deploymentInfo` <a name="deploymentInfo" id="projen-pipelines.VersionInfoBuilder.deploymentInfo"></a>

```typescript
public deploymentInfo(info: DeploymentInfoInput): VersionInfoBuilder
```

Set deployment metadata.

###### `info`<sup>Required</sup> <a name="info" id="projen-pipelines.VersionInfoBuilder.deploymentInfo.parameter.info"></a>

- *Type:* <a href="#projen-pipelines.DeploymentInfoInput">DeploymentInfoInput</a>

---

##### `gitInfo` <a name="gitInfo" id="projen-pipelines.VersionInfoBuilder.gitInfo"></a>

```typescript
public gitInfo(info: GitInfoInput): VersionInfoBuilder
```

Set git information.

###### `info`<sup>Required</sup> <a name="info" id="projen-pipelines.VersionInfoBuilder.gitInfo.parameter.info"></a>

- *Type:* <a href="#projen-pipelines.GitInfoInput">GitInfoInput</a>

---

##### `packageVersion` <a name="packageVersion" id="projen-pipelines.VersionInfoBuilder.packageVersion"></a>

```typescript
public packageVersion(version: string): VersionInfoBuilder
```

Set package version.

###### `version`<sup>Required</sup> <a name="version" id="projen-pipelines.VersionInfoBuilder.packageVersion.parameter.version"></a>

- *Type:* string

---

##### `pipelineVersion` <a name="pipelineVersion" id="projen-pipelines.VersionInfoBuilder.pipelineVersion"></a>

```typescript
public pipelineVersion(version: string): VersionInfoBuilder
```

Set pipeline version.

###### `version`<sup>Required</sup> <a name="version" id="projen-pipelines.VersionInfoBuilder.pipelineVersion.parameter.version"></a>

- *Type:* string

---

##### `repository` <a name="repository" id="projen-pipelines.VersionInfoBuilder.repository"></a>

```typescript
public repository(repo: string): VersionInfoBuilder
```

Set repository information.

###### `repo`<sup>Required</sup> <a name="repo" id="projen-pipelines.VersionInfoBuilder.repository.parameter.repo"></a>

- *Type:* string

---

##### `version` <a name="version" id="projen-pipelines.VersionInfoBuilder.version"></a>

```typescript
public version(version: string): VersionInfoBuilder
```

Set the version string.

###### `version`<sup>Required</sup> <a name="version" id="projen-pipelines.VersionInfoBuilder.version.parameter.version"></a>

- *Type:* string

---




### VersioningConfigurations <a name="VersioningConfigurations" id="projen-pipelines.VersioningConfigurations"></a>

Main versioning configuration class with factory methods.

#### Initializers <a name="Initializers" id="projen-pipelines.VersioningConfigurations.Initializer"></a>

```typescript
import { VersioningConfigurations } from 'projen-pipelines'

new VersioningConfigurations()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersioningConfigurations.custom">custom</a></code> | Create a custom configuration. |
| <code><a href="#projen-pipelines.VersioningConfigurations.minimal">minimal</a></code> | Minimal configuration for testing. |
| <code><a href="#projen-pipelines.VersioningConfigurations.standard">standard</a></code> | Standard configuration with commit count strategy. |

---

##### `custom` <a name="custom" id="projen-pipelines.VersioningConfigurations.custom"></a>

```typescript
import { VersioningConfigurations } from 'projen-pipelines'

VersioningConfigurations.custom(config: CustomVersioningConfig)
```

Create a custom configuration.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.VersioningConfigurations.custom.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.CustomVersioningConfig">CustomVersioningConfig</a>

---

##### `minimal` <a name="minimal" id="projen-pipelines.VersioningConfigurations.minimal"></a>

```typescript
import { VersioningConfigurations } from 'projen-pipelines'

VersioningConfigurations.minimal()
```

Minimal configuration for testing.

##### `standard` <a name="standard" id="projen-pipelines.VersioningConfigurations.standard"></a>

```typescript
import { VersioningConfigurations } from 'projen-pipelines'

VersioningConfigurations.standard(options?: StandardConfigOptions)
```

Standard configuration with commit count strategy.

###### `options`<sup>Optional</sup> <a name="options" id="projen-pipelines.VersioningConfigurations.standard.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.StandardConfigOptions">StandardConfigOptions</a>

---



### VersioningConfigUtils <a name="VersioningConfigUtils" id="projen-pipelines.VersioningConfigUtils"></a>

Utility functions for versioning configuration.

#### Initializers <a name="Initializers" id="projen-pipelines.VersioningConfigUtils.Initializer"></a>

```typescript
import { VersioningConfigUtils } from 'projen-pipelines'

new VersioningConfigUtils()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersioningConfigUtils.default">default</a></code> | Get default configuration. |
| <code><a href="#projen-pipelines.VersioningConfigUtils.resolveForStage">resolveForStage</a></code> | Resolve configuration for a specific stage. |
| <code><a href="#projen-pipelines.VersioningConfigUtils.validate">validate</a></code> | Validate configuration. |

---

##### `default` <a name="default" id="projen-pipelines.VersioningConfigUtils.default"></a>

```typescript
import { VersioningConfigUtils } from 'projen-pipelines'

VersioningConfigUtils.default()
```

Get default configuration.

##### `resolveForStage` <a name="resolveForStage" id="projen-pipelines.VersioningConfigUtils.resolveForStage"></a>

```typescript
import { VersioningConfigUtils } from 'projen-pipelines'

VersioningConfigUtils.resolveForStage(config: VersioningConfig, stage: string)
```

Resolve configuration for a specific stage.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.VersioningConfigUtils.resolveForStage.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

###### `stage`<sup>Required</sup> <a name="stage" id="projen-pipelines.VersioningConfigUtils.resolveForStage.parameter.stage"></a>

- *Type:* string

---

##### `validate` <a name="validate" id="projen-pipelines.VersioningConfigUtils.validate"></a>

```typescript
import { VersioningConfigUtils } from 'projen-pipelines'

VersioningConfigUtils.validate(config: VersioningConfig)
```

Validate configuration.

###### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.VersioningConfigUtils.validate.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---



### VersioningOutputs <a name="VersioningOutputs" id="projen-pipelines.VersioningOutputs"></a>

Factory class for output configurations.

#### Initializers <a name="Initializers" id="projen-pipelines.VersioningOutputs.Initializer"></a>

```typescript
import { VersioningOutputs } from 'projen-pipelines'

new VersioningOutputs()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersioningOutputs.cloudFormationOnly">cloudFormationOnly</a></code> | Create output configuration with only CloudFormation. |
| <code><a href="#projen-pipelines.VersioningOutputs.hierarchicalParameters">hierarchicalParameters</a></code> | Create output configuration with hierarchical SSM parameters. |
| <code><a href="#projen-pipelines.VersioningOutputs.minimal">minimal</a></code> | Create minimal output configuration (CloudFormation only, plain format). |
| <code><a href="#projen-pipelines.VersioningOutputs.standard">standard</a></code> | Create output configuration with CloudFormation and SSM Parameter Store. |

---

##### `cloudFormationOnly` <a name="cloudFormationOnly" id="projen-pipelines.VersioningOutputs.cloudFormationOnly"></a>

```typescript
import { VersioningOutputs } from 'projen-pipelines'

VersioningOutputs.cloudFormationOnly(options?: CloudFormationOnlyOptions)
```

Create output configuration with only CloudFormation.

###### `options`<sup>Optional</sup> <a name="options" id="projen-pipelines.VersioningOutputs.cloudFormationOnly.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.CloudFormationOnlyOptions">CloudFormationOnlyOptions</a>

---

##### `hierarchicalParameters` <a name="hierarchicalParameters" id="projen-pipelines.VersioningOutputs.hierarchicalParameters"></a>

```typescript
import { VersioningOutputs } from 'projen-pipelines'

VersioningOutputs.hierarchicalParameters(basePath: string, options?: HierarchicalParametersOptions)
```

Create output configuration with hierarchical SSM parameters.

###### `basePath`<sup>Required</sup> <a name="basePath" id="projen-pipelines.VersioningOutputs.hierarchicalParameters.parameter.basePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="projen-pipelines.VersioningOutputs.hierarchicalParameters.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.HierarchicalParametersOptions">HierarchicalParametersOptions</a>

---

##### `minimal` <a name="minimal" id="projen-pipelines.VersioningOutputs.minimal"></a>

```typescript
import { VersioningOutputs } from 'projen-pipelines'

VersioningOutputs.minimal()
```

Create minimal output configuration (CloudFormation only, plain format).

##### `standard` <a name="standard" id="projen-pipelines.VersioningOutputs.standard"></a>

```typescript
import { VersioningOutputs } from 'projen-pipelines'

VersioningOutputs.standard(options?: StandardOutputOptions)
```

Create output configuration with CloudFormation and SSM Parameter Store.

###### `options`<sup>Optional</sup> <a name="options" id="projen-pipelines.VersioningOutputs.standard.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.StandardOutputOptions">StandardOutputOptions</a>

---



### VersioningSetup <a name="VersioningSetup" id="projen-pipelines.VersioningSetup"></a>

Sets up versioning tasks and integration for a project.

#### Initializers <a name="Initializers" id="projen-pipelines.VersioningSetup.Initializer"></a>

```typescript
import { VersioningSetup } from 'projen-pipelines'

new VersioningSetup(project: Project, config: VersioningConfig)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersioningSetup.Initializer.parameter.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.VersioningSetup.Initializer.parameter.config">config</a></code> | <code><a href="#projen-pipelines.VersioningConfig">VersioningConfig</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.VersioningSetup.Initializer.parameter.project"></a>

- *Type:* projen.Project

---

##### `config`<sup>Required</sup> <a name="config" id="projen-pipelines.VersioningSetup.Initializer.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.VersioningConfig">VersioningConfig</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersioningSetup.setup">setup</a></code> | Set up all versioning-related tasks and configurations. |

---

##### `setup` <a name="setup" id="projen-pipelines.VersioningSetup.setup"></a>

```typescript
public setup(): void
```

Set up all versioning-related tasks and configurations.




### VersioningStrategy <a name="VersioningStrategy" id="projen-pipelines.VersioningStrategy"></a>

- *Implements:* <a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a>

Composite versioning strategy that combines multiple strategies.


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.VersioningStrategy.buildNumber">buildNumber</a></code> | Create a build number based strategy. |
| <code><a href="#projen-pipelines.VersioningStrategy.commitCount">commitCount</a></code> | *No description.* |
| <code><a href="#projen-pipelines.VersioningStrategy.commitHash">commitHash</a></code> | *No description.* |
| <code><a href="#projen-pipelines.VersioningStrategy.create">create</a></code> | Create a composite strategy with custom format and components. |
| <code><a href="#projen-pipelines.VersioningStrategy.gitTag">gitTag</a></code> | *No description.* |
| <code><a href="#projen-pipelines.VersioningStrategy.packageJson">packageJson</a></code> | *No description.* |

---

##### `buildNumber` <a name="buildNumber" id="projen-pipelines.VersioningStrategy.buildNumber"></a>

```typescript
import { VersioningStrategy } from 'projen-pipelines'

VersioningStrategy.buildNumber(config?: BuildNumberConfig)
```

Create a build number based strategy.

###### `config`<sup>Optional</sup> <a name="config" id="projen-pipelines.VersioningStrategy.buildNumber.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.BuildNumberConfig">BuildNumberConfig</a>

---

##### `commitCount` <a name="commitCount" id="projen-pipelines.VersioningStrategy.commitCount"></a>

```typescript
import { VersioningStrategy } from 'projen-pipelines'

VersioningStrategy.commitCount(config?: CommitCountConfig)
```

###### `config`<sup>Optional</sup> <a name="config" id="projen-pipelines.VersioningStrategy.commitCount.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.CommitCountConfig">CommitCountConfig</a>

---

##### `commitHash` <a name="commitHash" id="projen-pipelines.VersioningStrategy.commitHash"></a>

```typescript
import { VersioningStrategy } from 'projen-pipelines'

VersioningStrategy.commitHash()
```

##### `create` <a name="create" id="projen-pipelines.VersioningStrategy.create"></a>

```typescript
import { VersioningStrategy } from 'projen-pipelines'

VersioningStrategy.create(format: string, components: VersioningStrategyComponents)
```

Create a composite strategy with custom format and components.

###### `format`<sup>Required</sup> <a name="format" id="projen-pipelines.VersioningStrategy.create.parameter.format"></a>

- *Type:* string

---

###### `components`<sup>Required</sup> <a name="components" id="projen-pipelines.VersioningStrategy.create.parameter.components"></a>

- *Type:* <a href="#projen-pipelines.VersioningStrategyComponents">VersioningStrategyComponents</a>

---

##### `gitTag` <a name="gitTag" id="projen-pipelines.VersioningStrategy.gitTag"></a>

```typescript
import { VersioningStrategy } from 'projen-pipelines'

VersioningStrategy.gitTag(config?: GitTagConfig)
```

###### `config`<sup>Optional</sup> <a name="config" id="projen-pipelines.VersioningStrategy.gitTag.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.GitTagConfig">GitTagConfig</a>

---

##### `packageJson` <a name="packageJson" id="projen-pipelines.VersioningStrategy.packageJson"></a>

```typescript
import { VersioningStrategy } from 'projen-pipelines'

VersioningStrategy.packageJson(config?: PackageJsonConfig)
```

###### `config`<sup>Optional</sup> <a name="config" id="projen-pipelines.VersioningStrategy.packageJson.parameter.config"></a>

- *Type:* <a href="#projen-pipelines.PackageJsonConfig">PackageJsonConfig</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.VersioningStrategy.property.components">components</a></code> | <code><a href="#projen-pipelines.VersioningStrategyComponents">VersioningStrategyComponents</a></code> | Components to include. |
| <code><a href="#projen-pipelines.VersioningStrategy.property.format">format</a></code> | <code>string</code> | Version format template Variables: {git-tag}, {package-version}, {commit-count}, {commit-hash},            {commit-hash:8}, {branch}, {build-number}. |

---

##### `components`<sup>Required</sup> <a name="components" id="projen-pipelines.VersioningStrategy.property.components"></a>

```typescript
public readonly components: VersioningStrategyComponents;
```

- *Type:* <a href="#projen-pipelines.VersioningStrategyComponents">VersioningStrategyComponents</a>

Components to include.

---

##### `format`<sup>Required</sup> <a name="format" id="projen-pipelines.VersioningStrategy.property.format"></a>

```typescript
public readonly format: string;
```

- *Type:* string

Version format template Variables: {git-tag}, {package-version}, {commit-count}, {commit-hash},            {commit-hash:8}, {branch}, {build-number}.

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IVersionInfo <a name="IVersionInfo" id="projen-pipelines.IVersionInfo"></a>

- *Implemented By:* <a href="#projen-pipelines.VersionInfo">VersionInfo</a>, <a href="#projen-pipelines.IVersionInfo">IVersionInfo</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.IVersionInfo.property.branch">branch</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.commitCount">commitCount</a></code> | <code>number</code> | Commit count information. |
| <code><a href="#projen-pipelines.IVersionInfo.property.commitHash">commitHash</a></code> | <code>string</code> | Git information (ALWAYS included). |
| <code><a href="#projen-pipelines.IVersionInfo.property.commitHashShort">commitHashShort</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.deployedAt">deployedAt</a></code> | <code>string</code> | Deployment metadata. |
| <code><a href="#projen-pipelines.IVersionInfo.property.deployedBy">deployedBy</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.version">version</a></code> | <code>string</code> | Primary version string. |
| <code><a href="#projen-pipelines.IVersionInfo.property.buildNumber">buildNumber</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.commitsSinceTag">commitsSinceTag</a></code> | <code>number</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.packageVersion">packageVersion</a></code> | <code>string</code> | Package.json information (if applicable). |
| <code><a href="#projen-pipelines.IVersionInfo.property.pipelineVersion">pipelineVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.IVersionInfo.property.repository">repository</a></code> | <code>string</code> | Additional metadata. |
| <code><a href="#projen-pipelines.IVersionInfo.property.tag">tag</a></code> | <code>string</code> | Optional git tag information. |

---

##### `branch`<sup>Required</sup> <a name="branch" id="projen-pipelines.IVersionInfo.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

---

##### `commitCount`<sup>Required</sup> <a name="commitCount" id="projen-pipelines.IVersionInfo.property.commitCount"></a>

```typescript
public readonly commitCount: number;
```

- *Type:* number

Commit count information.

---

##### `commitHash`<sup>Required</sup> <a name="commitHash" id="projen-pipelines.IVersionInfo.property.commitHash"></a>

```typescript
public readonly commitHash: string;
```

- *Type:* string

Git information (ALWAYS included).

---

##### `commitHashShort`<sup>Required</sup> <a name="commitHashShort" id="projen-pipelines.IVersionInfo.property.commitHashShort"></a>

```typescript
public readonly commitHashShort: string;
```

- *Type:* string

---

##### `deployedAt`<sup>Required</sup> <a name="deployedAt" id="projen-pipelines.IVersionInfo.property.deployedAt"></a>

```typescript
public readonly deployedAt: string;
```

- *Type:* string

Deployment metadata.

---

##### `deployedBy`<sup>Required</sup> <a name="deployedBy" id="projen-pipelines.IVersionInfo.property.deployedBy"></a>

```typescript
public readonly deployedBy: string;
```

- *Type:* string

---

##### `environment`<sup>Required</sup> <a name="environment" id="projen-pipelines.IVersionInfo.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `version`<sup>Required</sup> <a name="version" id="projen-pipelines.IVersionInfo.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

Primary version string.

---

##### `buildNumber`<sup>Optional</sup> <a name="buildNumber" id="projen-pipelines.IVersionInfo.property.buildNumber"></a>

```typescript
public readonly buildNumber: string;
```

- *Type:* string

---

##### `commitsSinceTag`<sup>Optional</sup> <a name="commitsSinceTag" id="projen-pipelines.IVersionInfo.property.commitsSinceTag"></a>

```typescript
public readonly commitsSinceTag: number;
```

- *Type:* number

---

##### `packageVersion`<sup>Optional</sup> <a name="packageVersion" id="projen-pipelines.IVersionInfo.property.packageVersion"></a>

```typescript
public readonly packageVersion: string;
```

- *Type:* string

Package.json information (if applicable).

---

##### `pipelineVersion`<sup>Optional</sup> <a name="pipelineVersion" id="projen-pipelines.IVersionInfo.property.pipelineVersion"></a>

```typescript
public readonly pipelineVersion: string;
```

- *Type:* string

---

##### `repository`<sup>Optional</sup> <a name="repository" id="projen-pipelines.IVersionInfo.property.repository"></a>

```typescript
public readonly repository: string;
```

- *Type:* string

Additional metadata.

---

##### `tag`<sup>Optional</sup> <a name="tag" id="projen-pipelines.IVersionInfo.property.tag"></a>

```typescript
public readonly tag: string;
```

- *Type:* string

Optional git tag information.

---

### IVersioningStrategy <a name="IVersioningStrategy" id="projen-pipelines.IVersioningStrategy"></a>

- *Implemented By:* <a href="#projen-pipelines.VersioningStrategy">VersioningStrategy</a>, <a href="#projen-pipelines.IVersioningStrategy">IVersioningStrategy</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.IVersioningStrategy.property.components">components</a></code> | <code><a href="#projen-pipelines.VersioningStrategyComponents">VersioningStrategyComponents</a></code> | Components to include. |
| <code><a href="#projen-pipelines.IVersioningStrategy.property.format">format</a></code> | <code>string</code> | Version format template Variables: {git-tag}, {package-version}, {commit-count}, {commit-hash},            {commit-hash:8}, {branch}, {build-number}. |

---

##### `components`<sup>Required</sup> <a name="components" id="projen-pipelines.IVersioningStrategy.property.components"></a>

```typescript
public readonly components: VersioningStrategyComponents;
```

- *Type:* <a href="#projen-pipelines.VersioningStrategyComponents">VersioningStrategyComponents</a>

Components to include.

---

##### `format`<sup>Required</sup> <a name="format" id="projen-pipelines.IVersioningStrategy.property.format"></a>

```typescript
public readonly format: string;
```

- *Type:* string

Version format template Variables: {git-tag}, {package-version}, {commit-count}, {commit-hash},            {commit-hash:8}, {branch}, {build-number}.

---

## Enums <a name="Enums" id="Enums"></a>

### CdkDiffType <a name="CdkDiffType" id="projen-pipelines.CdkDiffType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CdkDiffType.NONE">NONE</a></code> | Do not perform a diff. |
| <code><a href="#projen-pipelines.CdkDiffType.FAST">FAST</a></code> | Perform a fast template diff (--no-changeset). |
| <code><a href="#projen-pipelines.CdkDiffType.FULL">FULL</a></code> | Perform a full CloudFormation diff (--changeset). |

---

##### `NONE` <a name="NONE" id="projen-pipelines.CdkDiffType.NONE"></a>

Do not perform a diff.

---


##### `FAST` <a name="FAST" id="projen-pipelines.CdkDiffType.FAST"></a>

Perform a fast template diff (--no-changeset).

---


##### `FULL` <a name="FULL" id="projen-pipelines.CdkDiffType.FULL"></a>

Perform a full CloudFormation diff (--changeset).

---


### PipelineEngine <a name="PipelineEngine" id="projen-pipelines.PipelineEngine"></a>

The CI/CD tooling used to run your pipeline.

The component will render workflows for the given system

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.PipelineEngine.GITHUB">GITHUB</a></code> | Create GitHub actions. |
| <code><a href="#projen-pipelines.PipelineEngine.GITLAB">GITLAB</a></code> | Create a .gitlab-ci.yaml file. |
| <code><a href="#projen-pipelines.PipelineEngine.CODE_CATALYST">CODE_CATALYST</a></code> | *No description.* |
| <code><a href="#projen-pipelines.PipelineEngine.BASH">BASH</a></code> | Create bash scripts. |

---

##### `GITHUB` <a name="GITHUB" id="projen-pipelines.PipelineEngine.GITHUB"></a>

Create GitHub actions.

---


##### `GITLAB` <a name="GITLAB" id="projen-pipelines.PipelineEngine.GITLAB"></a>

Create a .gitlab-ci.yaml file.

---


##### `CODE_CATALYST` <a name="CODE_CATALYST" id="projen-pipelines.PipelineEngine.CODE_CATALYST"></a>

---


##### `BASH` <a name="BASH" id="projen-pipelines.PipelineEngine.BASH"></a>

Create bash scripts.

---

