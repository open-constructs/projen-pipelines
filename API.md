# replace this
# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

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
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.environments">environments</a></code> | <code><a href="#projen-pipelines.EnvironmentMap">EnvironmentMap</a></code> | This is a map of environments to be used in the pipeline. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | This field determines the NPM namespace to be used when packaging CDK cloud assemblies. |
| <code><a href="#projen-pipelines.CDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation. |

---

##### `environments`<sup>Required</sup> <a name="environments" id="projen-pipelines.CDKPipelineOptions.property.environments"></a>

```typescript
public readonly environments: EnvironmentMap;
```

- *Type:* <a href="#projen-pipelines.EnvironmentMap">EnvironmentMap</a>

This is a map of environments to be used in the pipeline.

It allows the
pipeline to deploy to different environments based on the stage of the
deployment process, whether that's a personal, feature, dev, or prod stage.

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

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="projen-pipelines.CDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

This field is used to define a prefix for the AWS Stack resources created during the pipeline's operation.

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

### EnvironmentMap <a name="EnvironmentMap" id="projen-pipelines.EnvironmentMap"></a>

The EnvironmentMap interface is used to maintain a mapping of different types of environments used in the application.

Each type of environment - personal,
feature, dev, and prod, represents a different stage of development or usage.

#### Initializer <a name="Initializer" id="projen-pipelines.EnvironmentMap.Initializer"></a>

```typescript
import { EnvironmentMap } from 'projen-pipelines'

const environmentMap: EnvironmentMap = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.EnvironmentMap.property.dev">dev</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The dev environment is a shared environment where developers integrate their feature changes. |
| <code><a href="#projen-pipelines.EnvironmentMap.property.feature">feature</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The feature environment is typically used for developing specific features in isolation from the main codebase. |
| <code><a href="#projen-pipelines.EnvironmentMap.property.personal">personal</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The personal environment is usually used for individual development and testing, allowing developers to freely test and experiment without affecting the shared development environment. |
| <code><a href="#projen-pipelines.EnvironmentMap.property.prod">prod</a></code> | <code><a href="#projen-pipelines.Environment">Environment</a></code> | The prod environment is where the live, user-facing application runs. |

---

##### `dev`<sup>Required</sup> <a name="dev" id="projen-pipelines.EnvironmentMap.property.dev"></a>

```typescript
public readonly dev: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The dev environment is a shared environment where developers integrate their feature changes.

It represents the latest version of the application
but may not be as stable as the production environment.

---

##### `feature`<sup>Required</sup> <a name="feature" id="projen-pipelines.EnvironmentMap.property.feature"></a>

```typescript
public readonly feature: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The feature environment is typically used for developing specific features in isolation from the main codebase.

This allows developers to work on
individual features without impacting the stability of the dev or prod
environments.

---

##### `personal`<sup>Required</sup> <a name="personal" id="projen-pipelines.EnvironmentMap.property.personal"></a>

```typescript
public readonly personal: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The personal environment is usually used for individual development and testing, allowing developers to freely test and experiment without affecting the shared development environment.

---

##### `prod`<sup>Required</sup> <a name="prod" id="projen-pipelines.EnvironmentMap.property.prod"></a>

```typescript
public readonly prod: Environment;
```

- *Type:* <a href="#projen-pipelines.Environment">Environment</a>

The prod environment is where the live, user-facing application runs.

It should be stable and only receive thoroughly tested changes.

---

## Classes <a name="Classes" id="Classes"></a>

### CDKPipeline <a name="CDKPipeline" id="projen-pipelines.CDKPipeline"></a>

The CDKPipeline class extends the Component class and sets up the necessary configuration for deploying AWS CDK (Cloud Development Kit) applications across multiple stages.

It also manages tasks such as publishing CDK assets, bumping version based on git tags, and cleaning up conflicting tasks.

#### Initializers <a name="Initializers" id="projen-pipelines.CDKPipeline.Initializer"></a>

```typescript
import { CDKPipeline } from 'projen-pipelines'

new CDKPipeline(app: AwsCdkTypeScriptApp, props: CDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.Initializer.parameter.app">app</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#projen-pipelines.CDKPipeline.Initializer.parameter.props">props</a></code> | <code><a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a></code> | *No description.* |

---

##### `app`<sup>Required</sup> <a name="app" id="projen-pipelines.CDKPipeline.Initializer.parameter.app"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `props`<sup>Required</sup> <a name="props" id="projen-pipelines.CDKPipeline.Initializer.parameter.props"></a>

- *Type:* <a href="#projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.postSynthesize">postSynthesize</a></code> | Called after synthesis. |
| <code><a href="#projen-pipelines.CDKPipeline.preSynthesize">preSynthesize</a></code> | Called before synthesis. |
| <code><a href="#projen-pipelines.CDKPipeline.synthesize">synthesize</a></code> | Synthesizes files to the project output directory. |

---

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


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#projen-pipelines.CDKPipeline.property.project">project</a></code> | <code>projen.Project</code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="projen-pipelines.CDKPipeline.property.project"></a>

```typescript
public readonly project: Project;
```

- *Type:* projen.Project

---



