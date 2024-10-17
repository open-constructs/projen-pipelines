# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

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


### CodeCatalystCDKPipeline <a name="CodeCatalystCDKPipeline" id="projen-pipelines.CodeCatalystCDKPipeline"></a>

#### Initializers <a name="Initializers" id="projen-pipelines.CodeCatalystCDKPipeline.Initializer"></a>

```typescript
import { CodeCatalystCDKPipeline } from 'projen-pipelines'

new CodeCatalystCDKPipeline(app: AwsCdkTypeScriptApp, options: CodeCatalystCDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.Initializer.parameter.options">options</a></code> | <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions">CodeCatalystCDKPipelineOptions</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.CodeCatalystCDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `options`<sup>Required</sup> <a name="options" id="projen-pipelines.CodeCatalystCDKPipeline.Initializer.parameter.options"></a>

- *Type:* <a href="#projen-pipelines.CodeCatalystCDKPipelineOptions">CodeCatalystCDKPipelineOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.engineType">engineType</a></code> | the type of engine this implementation of CDKPipeline is for. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.createAssetUpload">createAssetUpload</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.createDeployment">createDeployment</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.createEnvironments">createEnvironments</a></code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.createIndependentDeployment">createIndependentDeployment</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="projen-pipelines.CodeCatalystCDKPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `postSynthesize` <a name="postSynthesize" id="projen-pipelines.CodeCatalystCDKPipeline.postSynthesize"></a>

```typescript
public postSynthesize(): void
```

Called after synthesis.

Order is *not* guaranteed.

##### `preSynthesize` <a name="preSynthesize" id="projen-pipelines.CodeCatalystCDKPipeline.preSynthesize"></a>

```typescript
public preSynthesize(): void
```

Called before synthesis.

##### `synthesize` <a name="synthesize" id="projen-pipelines.CodeCatalystCDKPipeline.synthesize"></a>

```typescript
public synthesize(): void
```

Synthesizes files to the project output directory.

##### `engineType` <a name="engineType" id="projen-pipelines.CodeCatalystCDKPipeline.engineType"></a>

```typescript
public engineType(): PipelineEngine
```

the type of engine this implementation of CDKPipeline is for.

##### `createAssetUpload` <a name="createAssetUpload" id="projen-pipelines.CodeCatalystCDKPipeline.createAssetUpload"></a>

```typescript
public createAssetUpload(): void
```

##### `createDeployment` <a name="createDeployment" id="projen-pipelines.CodeCatalystCDKPipeline.createDeployment"></a>

```typescript
public createDeployment(stage: DeploymentStage): void
```

###### `stage`<sup>Required</sup> <a name="stage" id="projen-pipelines.CodeCatalystCDKPipeline.createDeployment.parameter.stage"></a>

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>

---

##### `createEnvironments` <a name="createEnvironments" id="projen-pipelines.CodeCatalystCDKPipeline.createEnvironments"></a>

```typescript
public createEnvironments(): void
```

##### `createIndependentDeployment` <a name="createIndependentDeployment" id="projen-pipelines.CodeCatalystCDKPipeline.createIndependentDeployment"></a>

```typescript
public createIndependentDeployment(stage: DeploymentStage): void
```

###### `stage`<sup>Required</sup> <a name="stage" id="projen-pipelines.CodeCatalystCDKPipeline.createIndependentDeployment.parameter.stage"></a>

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.isComponent">isComponent</a></code> | Test whether the given construct is a component. |

---

##### `isConstruct` <a name="isConstruct" id="projen-pipelines.CodeCatalystCDKPipeline.isConstruct"></a>

```typescript
import { CodeCatalystCDKPipeline } from 'projen-pipelines'

CodeCatalystCDKPipeline.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.CodeCatalystCDKPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isComponent` <a name="isComponent" id="projen-pipelines.CodeCatalystCDKPipeline.isComponent"></a>

```typescript
import { CodeCatalystCDKPipeline } from 'projen-pipelines'

CodeCatalystCDKPipeline.isComponent(x: any)
```

Test whether the given construct is a component.

###### `x`<sup>Required</sup> <a name="x" id="projen-pipelines.CodeCatalystCDKPipeline.isComponent.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.property.branchName">branchName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipeline.property.needsVersionedArtifacts">needsVersionedArtifacts</a></code> | <code>boolean</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="projen-pipelines.CodeCatalystCDKPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.CodeCatalystCDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---

##### `branchName`<sup>Required</sup> <a name="branchName" id="projen-pipelines.CodeCatalystCDKPipeline.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.CodeCatalystCDKPipeline.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---

##### `needsVersionedArtifacts`<sup>Required</sup> <a name="needsVersionedArtifacts" id="projen-pipelines.CodeCatalystCDKPipeline.property.needsVersionedArtifacts"></a>

```typescript
public readonly needsVersionedArtifacts: boolean;
```

- *Type:* boolean

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
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.BashCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.BashCDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="projen-pipelines.BashCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

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
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.CDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="projen-pipelines.CDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

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

### CodeCatalystCDKPipelineOptions <a name="CodeCatalystCDKPipelineOptions" id="projen-pipelines.CodeCatalystCDKPipelineOptions"></a>

#### Initializer <a name="Initializer" id="projen-pipelines.CodeCatalystCDKPipelineOptions.Initializer"></a>

```typescript
import { CodeCatalystCDKPipelineOptions } from 'projen-pipelines'

const codeCatalystCDKPipelineOptions: CodeCatalystCDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.iamRoleArns">iamRoleArns</a></code> | <code><a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a></code> | IAM config. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.CodeCatalystCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |

---

##### `iamRoleArns`<sup>Required</sup> <a name="iamRoleArns" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.iamRoleArns"></a>

```typescript
public readonly iamRoleArns: IamRoleConfig;
```

- *Type:* <a href="#projen-pipelines.IamRoleConfig">IamRoleConfig</a>

IAM config.

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

---

##### `stages`<sup>Required</sup> <a name="stages" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.stages"></a>

```typescript
public readonly stages: DeploymentStage[];
```

- *Type:* <a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]

This field specifies a list of stages that should be deployed using a CI/CD pipeline.

---

##### `branchName`<sup>Optional</sup> <a name="branchName" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.branchName"></a>

```typescript
public readonly branchName: string;
```

- *Type:* string
- *Default:* main

the name of the branch to deploy from.

---

##### `deploySubStacks`<sup>Optional</sup> <a name="deploySubStacks" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.deploySubStacks"></a>

```typescript
public readonly deploySubStacks: boolean;
```

- *Type:* boolean
- *Default:* false

If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack.

You can use this to deploy CDk applications containing multiple stacks.

---

##### `featureStages`<sup>Optional</sup> <a name="featureStages" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.featureStages"></a>

```typescript
public readonly featureStages: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for feature stages.

---

##### `independentStages`<sup>Optional</sup> <a name="independentStages" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.independentStages"></a>

```typescript
public readonly independentStages: IndependentStage[];
```

- *Type:* <a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]

This specifies details for independent stages.

---

##### `personalStage`<sup>Optional</sup> <a name="personalStage" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.personalStage"></a>

```typescript
public readonly personalStage: StageOptions;
```

- *Type:* <a href="#projen-pipelines.StageOptions">StageOptions</a>

This specifies details for a personal stage.

---

##### `postSynthCommands`<sup>Optional</sup> <a name="postSynthCommands" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.postSynthCommands"></a>

```typescript
public readonly postSynthCommands: string[];
```

- *Type:* string[]

---

##### `postSynthSteps`<sup>Optional</sup> <a name="postSynthSteps" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.postSynthSteps"></a>

```typescript
public readonly postSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preInstallCommands`<sup>Optional</sup> <a name="preInstallCommands" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.preInstallCommands"></a>

```typescript
public readonly preInstallCommands: string[];
```

- *Type:* string[]

---

##### `preInstallSteps`<sup>Optional</sup> <a name="preInstallSteps" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.preInstallSteps"></a>

```typescript
public readonly preInstallSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `preSynthCommands`<sup>Optional</sup> <a name="preSynthCommands" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.preSynthCommands"></a>

```typescript
public readonly preSynthCommands: string[];
```

- *Type:* string[]

---

##### `preSynthSteps`<sup>Optional</sup> <a name="preSynthSteps" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.preSynthSteps"></a>

```typescript
public readonly preSynthSteps: PipelineStep[];
```

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="projen-pipelines.CodeCatalystCDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string
- *Default:* project name

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

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
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GithubCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |
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

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="projen-pipelines.GithubCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

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
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.stages">stages</a></code> | <code><a href="#projen-pipelines.DeploymentStage">DeploymentStage</a>[]</code> | This field specifies a list of stages that should be deployed using a CI/CD pipeline. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.branchName">branchName</a></code> | <code>string</code> | the name of the branch to deploy from. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.deploySubStacks">deploySubStacks</a></code> | <code>boolean</code> | If set to true all CDK actions will also include <stackName>/* to deploy/diff/destroy sub stacks of the main stack. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.featureStages">featureStages</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for feature stages. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.independentStages">independentStages</a></code> | <code><a href="#projen-pipelines.IndependentStage">IndependentStage</a>[]</code> | This specifies details for independent stages. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.personalStage">personalStage</a></code> | <code><a href="#projen-pipelines.StageOptions">StageOptions</a></code> | This specifies details for a personal stage. |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.postSynthCommands">postSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.postSynthSteps">postSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preInstallCommands">preInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preInstallSteps">preInstallSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preSynthCommands">preSynthCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.preSynthSteps">preSynthSteps</a></code> | <code><a href="#projen-pipelines.PipelineStep">PipelineStep</a>[]</code> | *No description.* |
| <code><a href="#projen-pipelines.GitlabCDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |
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

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="projen-pipelines.GitlabCDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

This field determines the NPM namespace to be used when packaging CDK cloud assemblies.

A namespace helps group related resources together, providing
better organization and ease of management.

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
public addSteps(steps: PipelineStep): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.CodeArtifactLoginStep.addSteps.parameter.steps"></a>

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>

---

##### `prependSteps` <a name="prependSteps" id="projen-pipelines.CodeArtifactLoginStep.prependSteps"></a>

```typescript
public prependSteps(steps: PipelineStep): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.CodeArtifactLoginStep.prependSteps.parameter.steps"></a>

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>

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
public addSteps(steps: PipelineStep): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.StepSequence.addSteps.parameter.steps"></a>

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>

---

##### `prependSteps` <a name="prependSteps" id="projen-pipelines.StepSequence.prependSteps"></a>

```typescript
public prependSteps(steps: PipelineStep): void
```

###### `steps`<sup>Required</sup> <a name="steps" id="projen-pipelines.StepSequence.prependSteps.parameter.steps"></a>

- *Type:* <a href="#projen-pipelines.PipelineStep">PipelineStep</a>

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

