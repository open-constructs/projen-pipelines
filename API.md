# replace this
# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### CDKPipelineOptions <a name="CDKPipelineOptions" id="@taimos-internal/projen-pipelines.CDKPipelineOptions"></a>

#### Initializer <a name="Initializer" id="@taimos-internal/projen-pipelines.CDKPipelineOptions.Initializer"></a>

```typescript
import { CDKPipelineOptions } from '@taimos-internal/projen-pipelines'

const cDKPipelineOptions: CDKPipelineOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@taimos-internal/projen-pipelines.CDKPipelineOptions.property.environments">environments</a></code> | <code><a href="#@taimos-internal/projen-pipelines.EnvironmentMap">EnvironmentMap</a></code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.CDKPipelineOptions.property.pkgNamespace">pkgNamespace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.CDKPipelineOptions.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | *No description.* |

---

##### `environments`<sup>Required</sup> <a name="environments" id="@taimos-internal/projen-pipelines.CDKPipelineOptions.property.environments"></a>

```typescript
public readonly environments: EnvironmentMap;
```

- *Type:* <a href="#@taimos-internal/projen-pipelines.EnvironmentMap">EnvironmentMap</a>

---

##### `pkgNamespace`<sup>Required</sup> <a name="pkgNamespace" id="@taimos-internal/projen-pipelines.CDKPipelineOptions.property.pkgNamespace"></a>

```typescript
public readonly pkgNamespace: string;
```

- *Type:* string

---

##### `stackPrefix`<sup>Required</sup> <a name="stackPrefix" id="@taimos-internal/projen-pipelines.CDKPipelineOptions.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

---

### Environment <a name="Environment" id="@taimos-internal/projen-pipelines.Environment"></a>

#### Initializer <a name="Initializer" id="@taimos-internal/projen-pipelines.Environment.Initializer"></a>

```typescript
import { Environment } from '@taimos-internal/projen-pipelines'

const environment: Environment = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@taimos-internal/projen-pipelines.Environment.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.Environment.property.region">region</a></code> | <code>string</code> | *No description.* |

---

##### `account`<sup>Required</sup> <a name="account" id="@taimos-internal/projen-pipelines.Environment.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `region`<sup>Required</sup> <a name="region" id="@taimos-internal/projen-pipelines.Environment.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

### EnvironmentMap <a name="EnvironmentMap" id="@taimos-internal/projen-pipelines.EnvironmentMap"></a>

#### Initializer <a name="Initializer" id="@taimos-internal/projen-pipelines.EnvironmentMap.Initializer"></a>

```typescript
import { EnvironmentMap } from '@taimos-internal/projen-pipelines'

const environmentMap: EnvironmentMap = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@taimos-internal/projen-pipelines.EnvironmentMap.property.dev">dev</a></code> | <code><a href="#@taimos-internal/projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.EnvironmentMap.property.feature">feature</a></code> | <code><a href="#@taimos-internal/projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.EnvironmentMap.property.personal">personal</a></code> | <code><a href="#@taimos-internal/projen-pipelines.Environment">Environment</a></code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.EnvironmentMap.property.prod">prod</a></code> | <code><a href="#@taimos-internal/projen-pipelines.Environment">Environment</a></code> | *No description.* |

---

##### `dev`<sup>Required</sup> <a name="dev" id="@taimos-internal/projen-pipelines.EnvironmentMap.property.dev"></a>

```typescript
public readonly dev: Environment;
```

- *Type:* <a href="#@taimos-internal/projen-pipelines.Environment">Environment</a>

---

##### `feature`<sup>Required</sup> <a name="feature" id="@taimos-internal/projen-pipelines.EnvironmentMap.property.feature"></a>

```typescript
public readonly feature: Environment;
```

- *Type:* <a href="#@taimos-internal/projen-pipelines.Environment">Environment</a>

---

##### `personal`<sup>Required</sup> <a name="personal" id="@taimos-internal/projen-pipelines.EnvironmentMap.property.personal"></a>

```typescript
public readonly personal: Environment;
```

- *Type:* <a href="#@taimos-internal/projen-pipelines.Environment">Environment</a>

---

##### `prod`<sup>Required</sup> <a name="prod" id="@taimos-internal/projen-pipelines.EnvironmentMap.property.prod"></a>

```typescript
public readonly prod: Environment;
```

- *Type:* <a href="#@taimos-internal/projen-pipelines.Environment">Environment</a>

---

## Classes <a name="Classes" id="Classes"></a>

### CDKPipeline <a name="CDKPipeline" id="@taimos-internal/projen-pipelines.CDKPipeline"></a>

#### Initializers <a name="Initializers" id="@taimos-internal/projen-pipelines.CDKPipeline.Initializer"></a>

```typescript
import { CDKPipeline } from '@taimos-internal/projen-pipelines'

new CDKPipeline(project: AwsCdkTypeScriptApp, props: CDKPipelineOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@taimos-internal/projen-pipelines.CDKPipeline.Initializer.parameter.project">project</a></code> | <code>projen.awscdk.AwsCdkTypeScriptApp</code> | *No description.* |
| <code><a href="#@taimos-internal/projen-pipelines.CDKPipeline.Initializer.parameter.props">props</a></code> | <code><a href="#@taimos-internal/projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a></code> | *No description.* |

---

##### `project`<sup>Required</sup> <a name="project" id="@taimos-internal/projen-pipelines.CDKPipeline.Initializer.parameter.project"></a>

- *Type:* projen.awscdk.AwsCdkTypeScriptApp

---

##### `props`<sup>Required</sup> <a name="props" id="@taimos-internal/projen-pipelines.CDKPipeline.Initializer.parameter.props"></a>

- *Type:* <a href="#@taimos-internal/projen-pipelines.CDKPipelineOptions">CDKPipelineOptions</a>

---






