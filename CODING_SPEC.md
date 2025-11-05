# Projen Pipelines - Coding Specification

This document provides comprehensive guidance for AI tools and developers contributing to the `projen-pipelines` project. It covers architectural patterns, coding conventions, testing practices, and design principles used throughout the codebase.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture and Design Patterns](#architecture-and-design-patterns)
- [Code Style and Conventions](#code-style-and-conventions)
- [TypeScript Conventions](#typescript-conventions)
- [File Organization](#file-organization)
- [Testing Practices](#testing-practices)
- [Documentation Standards](#documentation-standards)
- [Common Patterns and Idioms](#common-patterns-and-idioms)
- [Contribution Guidelines](#contribution-guidelines)

## Project Overview

### Technology Stack

- **Language**: TypeScript
- **Build System**: Projen (project configuration engine)
- **Package Type**: JSII library (supports multiple languages)
- **Testing**: Jest with snapshot testing
- **Linting**: ESLint with TypeScript and stylistic plugins
- **Target Platforms**: GitHub Actions, GitLab CI, AWS CodeCatalyst, Bash

### Core Purpose

Projen Pipelines generates CI/CD pipeline configurations from high-level TypeScript definitions. It abstracts pipeline logic from specific CI/CD platforms, allowing users to define pipelines once and generate platform-specific implementations.

## Architecture and Design Patterns

### 1. Multi-Engine Abstraction Pattern

The codebase uses an abstraction layer to decouple pipeline definitions from CI/CD engine implementations.

**Key Files:**
- `src/engine.ts` - Defines `PipelineEngine` enum
- `src/steps/step.ts` - Abstract `PipelineStep` base class
- `src/awscdk/base.ts` - Abstract `CDKPipeline` base class

**Pattern:**
```typescript
export abstract class PipelineStep {
  public toGithub(): GithubStepConfig { /* ... */ }
  public toGitlab(): GitlabStepConfig { /* ... */ }
  public toCodeCatalyst(): CodeCatalystStepConfig { /* ... */ }
  public toBash(): BashStepConfig { /* ... */ }
}
```

**Implementation Guidelines:**
- All pipeline steps MUST implement conversion methods for each engine
- Throw `Error('Method not implemented.')` for unsupported engines
- Keep engine-specific logic isolated in conversion methods
- Return configuration objects, not direct engine API calls

### 2. Template Method Pattern

Abstract base classes define the pipeline structure; subclasses implement engine-specific details.

**Example from `CDKPipeline` (src/awscdk/base.ts):**
```typescript
export abstract class CDKPipeline extends Component {
  // Abstract method implemented by subclasses
  public abstract engineType(): PipelineEngine;

  // Template methods called by subclasses
  protected provideInstallStep(): PipelineStep { /* ... */ }
  protected provideSynthStep(): PipelineStep { /* ... */ }
  protected provideDeployStep(stage: NamedStageOptions): PipelineStep { /* ... */ }
}
```

**When to Use:**
- Creating new engine implementations (e.g., `GithubCDKPipeline`, `GitlabCDKPipeline`)
- Implementing workflows that need platform-specific rendering
- Building reusable components with common structure but varying implementations

### 3. Composite Pattern (Step Composition)

The `StepSequence` class allows combining multiple pipeline steps into a single composable unit.

**Example (src/steps/step.ts:182-283):**
```typescript
export class StepSequence extends PipelineStep {
  constructor(project: Project, steps: PipelineStep[]) {
    super(project);
    this.steps = [...steps];
  }

  public toGithub(): GithubStepConfig {
    // Merges configurations from all steps
    const needs: string[] = [];
    const steps: JobStep[] = [];
    const env: { [key: string]: string } = {};
    const permissions: JobPermissions[] = [];

    for (const step of this.steps) {
      const stepConfig = step.toGithub();
      needs.push(...stepConfig.needs);
      steps.push(...stepConfig.steps);
      if (stepConfig.permissions) {
        permissions.push(stepConfig.permissions);
      }
      Object.assign(env, stepConfig.env);
    }

    return {
      needs: Array.from(new Set(needs)),
      steps,
      env,
      permissions: mergeJobPermissions(...permissions),
    };
  }

  public addSteps(...steps: PipelineStep[]) {
    this.steps.push(...steps);
  }

  public prependSteps(...steps: PipelineStep[]) {
    this.steps.unshift(...steps);
  }
}
```

**Usage Guidelines:**
- Use `StepSequence` to compose multiple steps into a single logical unit
- Call `addSteps()` to append steps, `prependSteps()` to insert at the beginning
- Ensure step merging logic handles duplicates (e.g., `Array.from(new Set(needs))`)
- Merge environment variables with `Object.assign()`
- Use helper functions like `mergeJobPermissions()` for complex merging logic

### 4. Factory Pattern

Static factory methods provide convenient ways to create commonly-used configurations.

**Example from `VersioningStrategy` (src/versioning/strategy.ts):**
```typescript
export class VersioningStrategy implements IVersioningStrategy {
  public static create(
    format: string,
    components: VersioningStrategyComponents,
  ): VersioningStrategy {
    return new VersioningStrategy(format, components);
  }

  public static buildNumber(config?: BuildNumberConfig): VersioningStrategy {
    const prefix = config?.prefix ?? 'build';
    return new VersioningStrategy(`${prefix}-{commit-count}-{commit-hash:8}`, {
      commitCount: config?.commitCount ?? { countFrom: 'all', padding: 5 },
    });
  }

  public static gitTag(config?: GitTagConfig): VersioningStrategy {
    return new VersioningStrategy('{git-tag}', {
      gitTag: config ?? { stripPrefix: 'v' },
      commitCount: { countFrom: 'all' },
    });
  }

  private constructor(
    public readonly format: string,
    public readonly components: VersioningStrategyComponents,
  ) {}
}
```

**Guidelines:**
- Make constructors `private` when using factory pattern
- Provide sensible defaults using nullish coalescing (`??`)
- Name factory methods descriptively (e.g., `gitTag()`, `buildNumber()`)
- Include a generic `create()` method for custom configurations
- Document default values in JSDoc comments

### 5. Component Pattern (Projen Integration)

All major pipeline constructs extend Projen's `Component` class.

**Example:**
```typescript
import { Component } from 'projen';

export abstract class CDKPipeline extends Component {
  constructor(app: awscdk.AwsCdkTypeScriptApp, options: CDKPipelineOptions) {
    super(app);
    // Component automatically registers with project
  }
}
```

**Benefits:**
- Automatic registration with Projen project
- Lifecycle hooks (preSynthesize, postSynthesize)
- Access to project configuration
- Task creation via `project.addTask()`

**Usage:**
- Always call `super(project)` in constructors
- Use `this.project` to access the Projen project
- Create tasks in constructor using `this.project.addTask()`

### 6. Configuration-Over-Code Philosophy

Extensive use of TypeScript interfaces for type-safe configuration.

**Example (src/awscdk/base.ts:51-84):**
```typescript
export interface DeploymentStage extends NamedStageOptions {
  readonly manualApproval?: boolean;
}

export interface IndependentStage extends NamedStageOptions {
  /**
   * This specifies whether the stage should be deployed on push
   * @default false
   */
  readonly deployOnPush?: boolean;
}

export interface NamedStageOptions extends StageOptions {
  readonly name: string;
  readonly watchable?: boolean;
  readonly diffType?: CdkDiffType;
  readonly postDiffSteps?: PipelineStep[];
  readonly postDeploySteps?: PipelineStep[];
}
```

**Guidelines:**
- Use `interface` for configuration objects
- Mark all properties as `readonly`
- Document defaults with `@default` JSDoc tags
- Use interface extension (`extends`) to build configuration hierarchies
- Provide optional properties with `?` for flexibility

## Code Style and Conventions

### ESLint Configuration

The project uses ESLint with `@typescript-eslint` and `@stylistic` plugins. Configuration is in `.eslintrc.json`.

**Key Style Rules:**

#### Indentation and Spacing
```typescript
// ✅ CORRECT: 2-space indentation
export class MyClass {
  constructor() {
    this.value = 42;
  }
}

// ❌ WRONG: 4-space indentation
export class MyClass {
    constructor() {
        this.value = 42;
    }
}
```

#### Quotes
```typescript
// ✅ CORRECT: Single quotes
const message = 'Hello, world!';
const withApostrophe = "It's working"; // Escape allowed

// ❌ WRONG: Double quotes without escaping
const message = "Hello, world!";
```

#### Semicolons
```typescript
// ✅ CORRECT: Always use semicolons
const x = 10;
return { value: x };

// ❌ WRONG: Missing semicolons
const x = 10
return { value: x }
```

#### Comma Dangle
```typescript
// ✅ CORRECT: Trailing comma on multiline
const config = {
  name: 'test',
  value: 42,
};

// ❌ WRONG: No trailing comma on multiline
const config = {
  name: 'test',
  value: 42
};
```

#### Object Curly Spacing
```typescript
// ✅ CORRECT: Spaces inside braces
const obj = { key: 'value' };

// ❌ WRONG: No spaces
const obj = {key: 'value'};
```

#### Brace Style
```typescript
// ✅ CORRECT: 1tbs (one true brace style)
if (condition) {
  doSomething();
} else {
  doSomethingElse();
}

// Also allowed for single-line
if (simple) { return true; }

// ❌ WRONG: Opening brace on new line
if (condition)
{
  doSomething();
}
```

#### Max Line Length
- **Limit**: 150 characters
- **Exceptions**: URLs, strings, template literals, comments, regex

```typescript
// ✅ CORRECT: Line under 150 characters
const result = someFunction(param1, param2, param3);

// ✅ CORRECT: Long string ignored
const url = 'https://github.com/open-constructs/projen-pipelines/blob/main/src/very/long/path/to/file.ts';

// ❌ WRONG: Code line over 150 characters
const result = someVeryLongFunctionName(firstParameter, secondParameter, thirdParameter, fourthParameter, fifthParameter, sixthParameter, seventhParameter);
```

#### Import Organization
```typescript
// ✅ CORRECT: Grouped and alphabetized
import { Component, TextFile, awscdk } from 'projen';
import { PROJEN_MARKER } from 'projen/lib/common';
import { NodePackageManager } from 'projen/lib/javascript';

// ❌ WRONG: Unsorted imports
import { NodePackageManager } from 'projen/lib/javascript';
import { Component, TextFile, awscdk } from 'projen';
```

**Import Order:**
1. Built-in modules
2. External modules (alphabetized)
3. Internal modules (relative imports)

### Member Ordering

Follow this order within classes:

1. Public static fields
2. Public static methods
3. Protected static fields
4. Protected static methods
5. Private static fields
6. Private static methods
7. Instance fields (public, protected, private)
8. Constructor
9. Instance methods (public, protected, private)

**Example:**
```typescript
export class Example {
  // 1. Public static fields
  public static readonly DEFAULT_VALUE = 42;

  // 2. Public static methods
  public static create(): Example {
    return new Example();
  }

  // 3-6. Other static members...

  // 7. Instance fields
  private readonly value: number;

  // 8. Constructor
  constructor(value?: number) {
    this.value = value ?? Example.DEFAULT_VALUE;
  }

  // 9. Instance methods
  public getValue(): number {
    return this.value;
  }

  private validate(): boolean {
    return this.value > 0;
  }
}
```

## TypeScript Conventions

### Type Safety

**Use Strict Types:**
```typescript
// ✅ CORRECT: Explicit types for parameters and return values
export function createStep(name: string, commands: string[]): PipelineStep {
  return new SimpleCommandStep(this.project, commands);
}

// ❌ WRONG: Implicit any
export function createStep(name, commands) {
  return new SimpleCommandStep(this.project, commands);
}
```

**Use Type Guards:**
```typescript
// ✅ CORRECT: Type narrowing
if (typeof value === 'string') {
  return value.toUpperCase();
}

// ❌ WRONG: Type assertion without checking
return (value as string).toUpperCase();
```

### Readonly Properties

**Configuration interfaces should use readonly:**
```typescript
// ✅ CORRECT: Readonly properties
export interface StepConfig {
  readonly name: string;
  readonly commands: readonly string[];
  readonly env?: { readonly [key: string]: string };
}

// ❌ WRONG: Mutable configuration
export interface StepConfig {
  name: string;
  commands: string[];
  env?: { [key: string]: string };
}
```

### Nullish Coalescing

**Use `??` for default values:**
```typescript
// ✅ CORRECT: Nullish coalescing
const timeout = config.timeout ?? 3600;
const name = config.name ?? 'default';

// ❌ WRONG: Logical OR (fails for falsy values like 0, '')
const timeout = config.timeout || 3600;
```

### Spread Operators for Immutability

**Copy arrays and objects:**
```typescript
// ✅ CORRECT: Create defensive copies
constructor(project: Project, commands: string[], env: { [key: string]: string } = {}) {
  super(project);
  this.commands = [...commands];
  this.env = { ...env };
}

// ❌ WRONG: Direct assignment (mutable reference)
constructor(project: Project, commands: string[], env: { [key: string]: string } = {}) {
  super(project);
  this.commands = commands;
  this.env = env;
}
```

### Enums vs. String Unions

**Use enums for closed sets:**
```typescript
// ✅ CORRECT: Enum for CI/CD engines
export enum PipelineEngine {
  GITHUB,
  GITLAB,
  CODE_CATALYST,
  BASH,
}

// ✅ CORRECT: String literal union for open sets
export type DiffType = 'NONE' | 'FAST' | 'FULL';
```

### Generic Interfaces

**Avoid `any`, use generics when needed:**
```typescript
// ✅ CORRECT: Generic interface
export interface StepConfig<T = unknown> {
  readonly data: T;
}

// ❌ WRONG: Using any
export interface StepConfig {
  readonly data: any;
}
```

## File Organization

### Directory Structure

```
src/
├── index.ts                    # Main entry point, exports all public APIs
├── engine.ts                   # Core engine enumeration
├── release.ts                  # Release utilities
├── engines/                    # Engine-specific helpers
│   ├── index.ts
│   └── github.ts               # GitHub utilities (e.g., mergeJobPermissions)
├── steps/                      # Pipeline step abstractions
│   ├── index.ts                # Export all step types
│   ├── step.ts                 # Base PipelineStep class and implementations
│   ├── aws-assume-role.step.ts
│   ├── artifact-steps.ts
│   ├── amplify-deploy.step.ts
│   ├── registries.ts
│   └── set-env.step.ts
├── awscdk/                     # CDK pipeline implementations
│   ├── index.ts
│   ├── base.ts                 # Abstract CDKPipeline base class
│   ├── github.ts               # GitHub implementation
│   ├── gitlab.ts               # GitLab implementation
│   ├── bash.ts                 # Bash script generation
│   └── codecatalyst.ts         # CodeCatalyst (commented out)
├── versioning/                 # Versioning system
│   ├── index.ts
│   ├── types.ts                # Type definitions
│   ├── strategy.ts             # Factory methods
│   ├── config.ts               # Configuration utilities
│   ├── computation.ts          # Version computation
│   ├── version-info.ts         # Data structures
│   ├── outputs.ts              # Output configuration
│   └── setup.ts                # Task setup
├── drift/                      # Drift detection
│   ├── index.ts
│   ├── base.ts                 # Abstract base
│   ├── github.ts               # GitHub implementation
│   ├── gitlab.ts               # GitLab implementation
│   ├── bash.ts                 # Bash implementation
│   ├── step.ts                 # DriftDetectionStep
│   └── detect-drift.ts         # CLI tool
└── assign-approver/            # PR approver assignment
    ├── index.ts
    ├── base.ts
    └── github.ts

test/                           # Test files mirror src/ structure
├── github.test.ts
├── gitlab.test.ts
├── bash.test.ts
├── step.test.ts
├── versioning/
│   ├── strategy.test.ts
│   ├── computation.test.ts
│   └── integration.test.ts
└── __snapshots__/              # Jest snapshot files
```

### File Naming Conventions

- **Source files**: `kebab-case.ts` (e.g., `aws-assume-role.step.ts`)
- **Test files**: `kebab-case.test.ts` (e.g., `strategy.test.ts`)
- **Snapshot files**: `kebab-case.test.ts.snap`
- **Index files**: Always `index.ts` for barrel exports

### Module Organization

**Each module directory should have an `index.ts` that exports public APIs:**

```typescript
// src/steps/index.ts
export * from './step';
export * from './aws-assume-role.step';
export * from './artifact-steps';
export * from './amplify-deploy.step';
export * from './registries';
export * from './set-env.step';
```

**Main `index.ts` should re-export everything:**
```typescript
// src/index.ts
export * from './engine';
export * from './steps';
export * from './awscdk';
export * from './versioning';
export * from './drift';
export * from './assign-approver';
```

## Testing Practices

### Test File Structure

**Follow this pattern (example from `test/versioning/strategy.test.ts`):**

```typescript
import { VersioningStrategy } from '../../src/versioning/strategy';

describe('VersioningStrategy', () => {
  describe('gitTag', () => {
    it('should create a git tag strategy', () => {
      const strategy = VersioningStrategy.gitTag();
      expect(strategy.format).toBe('{git-tag}');
      expect(strategy.components.gitTag).toEqual({ stripPrefix: 'v' });
      expect(strategy.components.commitCount).toEqual({ countFrom: 'all' });
    });

    it('should create a git tag strategy with custom config', () => {
      const config = {
        annotatedOnly: true,
        stripPrefix: 'release-',
        includeSinceTag: true,
      };
      const strategy = VersioningStrategy.gitTag(config);
      expect(strategy.format).toBe('{git-tag}');
      expect(strategy.components.gitTag).toEqual(config);
      expect(strategy.components.commitCount).toEqual({ countFrom: 'all' });
    });
  });

  describe('packageJson', () => {
    it('should create a package.json strategy', () => {
      const strategy = VersioningStrategy.packageJson();
      expect(strategy.format).toBe('{package-version}');
      expect(strategy.components.packageJson).toEqual({});
    });
  });
});
```

### Snapshot Testing

**Use snapshot testing for generated files:**

```typescript
import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { synthSnapshot } from 'projen/lib/util/synth';
import { GithubCDKPipeline } from '../src';

test('Github snapshot', () => {
  const p = new AwsCdkTypeScriptApp({
    cdkVersion: '2.102.0',
    defaultReleaseBranch: 'main',
    name: 'testapp',
  });

  new GithubCDKPipeline(p, {
    iamRoleArns: {
      synth: 'synthRole',
      assetPublishing: 'publishRole',
      deployment: {
        'my-dev': 'devRole',
        'prod': 'prodRole',
      },
    },
    pkgNamespace: '@assembly',
    stages: [{
      name: 'my-dev',
      env: { account: '123456789012', region: 'eu-central-1' },
    }, {
      name: 'prod',
      manualApproval: true,
      env: { account: '123456789012', region: 'eu-central-1' },
    }],
  });

  const snapshot = synthSnapshot(p);
  expect(snapshot['.github/workflows/deploy.yml']).toMatchSnapshot();
  expect(snapshot['src/app.ts']).toMatchSnapshot();
  expect(snapshot['.github/workflows/release-prod.yml']).toMatchSnapshot();
  expect(snapshot['package.json']).toMatchSnapshot();
  expect(snapshot['.projen/tasks.json']).toMatchSnapshot();
});
```

### Test Organization

- **Group related tests**: Use `describe()` blocks
- **Descriptive test names**: Use `it('should...')` format
- **One assertion per test**: Keep tests focused
- **Test both success and failure**: Cover edge cases

### Coverage Requirements

The project uses Jest with coverage reporting:
- Coverage reports generated in `coverage/` directory
- Formats: JSON, LCOV, Clover, Cobertura, Text
- Aim for high coverage of public APIs

## Documentation Standards

### JSDoc Comments

**All public APIs must have JSDoc comments:**

```typescript
/**
 * Configuration interface for a GitLab CI step.
 */
export interface GitlabStepConfig {
  /** List of job extensions related to the step. */
  readonly extensions: string[];

  /** Dependencies which need to be completed before this step. */
  readonly needs: Need[];

  /** Shell commands to execute in this step. */
  readonly commands: string[];

  /** Additional environment variables to set for this step. */
  readonly env: { [key: string]: string };
}
```

### Documenting Classes

```typescript
/**
 * Abstract class defining the structure of a pipeline step.
 */
export abstract class PipelineStep {
  /**
   * Initializes a new instance of a PipelineStep with a reference to a projen project.
   * @param project - The projen project reference.
   */
  constructor(protected project: Project) {
    // Constructor can be extended to include more setup logic.
  }

  /**
   * Generates a configuration for a GitLab CI step. Should be implemented by subclasses.
   */
  public toGitlab(): GitlabStepConfig {
    throw new Error('Method not implemented.');
  }
}
```

### Documenting Defaults

**Use `@default` tags:**

```typescript
export interface IndependentStage extends NamedStageOptions {
  /**
   * This specifies whether the stage should be deployed on push
   *
   * @default false
   */
  readonly deployOnPush?: boolean;
}
```

### Inline Comments

**Use inline comments sparingly, only for non-obvious logic:**

```typescript
// ✅ CORRECT: Comment explains why
// Determine if versioned artifacts are necessary.
this.needsVersionedArtifacts = options.stages.find(s => s.manualApproval === true) !== undefined;

// ❌ WRONG: Comment restates code
// Check if stages has manual approval
this.needsVersionedArtifacts = options.stages.find(s => s.manualApproval === true) !== undefined;
```

## Common Patterns and Idioms

### 1. Engine Conversion Pattern

**When creating a new step, implement all engine conversions:**

```typescript
export class MyCustomStep extends PipelineStep {
  constructor(project: Project, private readonly config: MyConfig) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      needs: [],
      steps: [{ run: this.config.command }],
      env: this.config.env ?? {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    return {
      extensions: [],
      needs: [],
      commands: [this.config.command],
      env: this.config.env ?? {},
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    return {
      needs: [],
      commands: [this.config.command],
      env: this.config.env ?? {},
    };
  }

  public toBash(): BashStepConfig {
    return {
      commands: [
        ...Object.entries(this.config.env ?? {}).map(([k, v]) => `export ${k}="${v}"`),
        this.config.command,
      ],
    };
  }
}
```

### 2. Options Extension Pattern

**Extend base options for engine-specific configurations:**

```typescript
// Base options
export interface CDKPipelineOptions {
  readonly stages: DeploymentStage[];
  readonly independentStages?: IndependentStage[];
  readonly iamRoleArns: IamRoleConfig;
  // ... common options
}

// GitHub-specific extension
export interface GithubCDKPipelineOptions extends CDKPipelineOptions {
  readonly runnerTags?: string[];
  readonly useGithubPackagesForAssembly?: boolean;
  readonly useGithubEnvironments?: boolean;
}

// Usage in constructor
constructor(app: awscdk.AwsCdkTypeScriptApp, private options: GithubCDKPipelineOptions) {
  super(app, {
    ...options,
    // Override or extend base options
  });
}
```

### 3. Conditional Configuration Pattern

**Use spread operator for conditional properties:**

```typescript
// ✅ CORRECT: Conditional properties with spread
const config = {
  name: 'my-workflow',
  ...this.config.region ? { region: this.config.region } : {},
  ...this.config.timeout ? { timeout: this.config.timeout } : {},
};

// ❌ WRONG: Including undefined values
const config = {
  name: 'my-workflow',
  region: this.config.region, // undefined if not set
  timeout: this.config.timeout, // undefined if not set
};
```

### 4. Array Deduplication Pattern

**Remove duplicates when merging:**

```typescript
// ✅ CORRECT: Deduplicate needs
return {
  needs: Array.from(new Set(needs)),
  steps,
  env,
};

// ❌ WRONG: Duplicates allowed
return {
  needs: needs,
  steps,
  env,
};
```

### 5. Environment Variable Merging Pattern

**For bash steps, export environment variables before commands:**

```typescript
public toBash(): BashStepConfig {
  return {
    commands: [
      ...Object.entries(this.env).map(([key, value]) => `export ${key}="${value}"`),
      ...this.commands,
    ],
  };
}
```

### 6. Permission Merging Pattern

**Use `mergeJobPermissions()` for GitHub:**

```typescript
import { mergeJobPermissions } from '../engines';

public toGithub(): GithubStepConfig {
  const permissions: JobPermissions[] = [];

  for (const step of this.steps) {
    const stepConfig = step.toGithub();
    if (stepConfig.permissions) {
      permissions.push(stepConfig.permissions);
    }
  }

  return {
    needs: /* ... */,
    steps: /* ... */,
    env: /* ... */,
    permissions: mergeJobPermissions(...permissions),
  };
}
```

### 7. Factory with Defaults Pattern

**Provide sensible defaults in factory methods:**

```typescript
export class VersioningStrategy implements IVersioningStrategy {
  public static buildNumber(config?: BuildNumberConfig): VersioningStrategy {
    const prefix = config?.prefix ?? 'build';
    return new VersioningStrategy(`${prefix}-{commit-count}-{commit-hash:8}`, {
      commitCount: config?.commitCount ?? { countFrom: 'all', padding: 5 },
    });
  }

  private constructor(
    public readonly format: string,
    public readonly components: VersioningStrategyComponents,
  ) {}
}
```

### 8. Projen Component Integration Pattern

**Extend Component and register with project:**

```typescript
import { Component } from 'projen';

export class MyFeature extends Component {
  constructor(project: Project, options: MyFeatureOptions) {
    super(project);

    // Create tasks
    const task = project.addTask('my-task', {
      description: 'Runs my feature',
      exec: 'echo "Running my feature"',
    });

    // Create files
    new TextFile(this.project, '.my-config', {
      lines: ['config content'],
    });
  }
}
```

## Contribution Guidelines

### Before Submitting Code

1. **Run linter**: `npx projen eslint`
2. **Run tests**: `npx projen test`
3. **Build project**: `npx projen build`
4. **Update snapshots if needed**: `npx projen test -- -u`

### Commit Message Format

Use conventional commit messages:

```
feat: add support for Azure Pipelines
fix: resolve issue with GitLab artifact caching
chore: update dependencies
docs: improve versioning documentation
test: add tests for drift detection
refactor: simplify step composition logic
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `docs`: Documentation updates
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or fixes
- `revert`: Revert a previous commit

### Pull Request Guidelines

1. **Follow existing patterns**: Study similar implementations before writing new code
2. **Add tests**: All new features must include tests
3. **Update snapshots**: If changing generated output, update snapshots
4. **Document public APIs**: Add JSDoc comments to all public interfaces and classes
5. **Keep changes focused**: One feature or fix per PR
6. **Reference issues**: Link to relevant GitHub issues

### Code Review Checklist

- [ ] Follows ESLint rules (no warnings or errors)
- [ ] All tests pass
- [ ] New code has test coverage
- [ ] Public APIs have JSDoc comments
- [ ] Snapshots updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Follows existing architectural patterns
- [ ] Implements all engine conversions (if applicable)

## Advanced Topics

### Adding a New CI/CD Engine

To add support for a new CI/CD platform (e.g., Azure Pipelines):

1. **Update `PipelineEngine` enum**:
   ```typescript
   // src/engine.ts
   export enum PipelineEngine {
     GITHUB,
     GITLAB,
     CODE_CATALYST,
     BASH,
     AZURE_PIPELINES, // New engine
   }
   ```

2. **Add configuration interface**:
   ```typescript
   // src/steps/step.ts
   export interface AzureStepConfig {
     readonly tasks: AzureTask[];
     readonly dependsOn: string[];
     readonly env: { [key: string]: string };
   }
   ```

3. **Update `PipelineStep` base class**:
   ```typescript
   export abstract class PipelineStep {
     public toAzure(): AzureStepConfig {
       throw new Error('Method not implemented.');
     }
   }
   ```

4. **Implement in concrete steps**:
   ```typescript
   export class SimpleCommandStep extends PipelineStep {
     public toAzure(): AzureStepConfig {
       return {
         tasks: this.commands.map(cmd => ({ script: cmd })),
         dependsOn: [],
         env: this.env,
       };
     }
   }
   ```

5. **Create pipeline implementation**:
   ```typescript
   // src/awscdk/azure.ts
   export class AzureCDKPipeline extends CDKPipeline {
     public engineType(): PipelineEngine {
       return PipelineEngine.AZURE_PIPELINES;
     }

     // Implement pipeline creation logic
   }
   ```

6. **Add tests and update snapshots**

### Creating Custom Pipeline Steps

Example of a custom step for Slack notifications:

```typescript
// src/steps/slack-notify.step.ts
import { Project } from 'projen';
import { BashStepConfig, CodeCatalystStepConfig, GithubStepConfig, GitlabStepConfig, PipelineStep } from './step';

export interface SlackNotifyConfig {
  readonly webhookUrl: string;
  readonly message: string;
  readonly channel?: string;
}

export class SlackNotifyStep extends PipelineStep {
  constructor(project: Project, private readonly config: SlackNotifyConfig) {
    super(project);
  }

  public toGithub(): GithubStepConfig {
    return {
      needs: [],
      steps: [{
        name: 'Slack Notification',
        uses: 'slackapi/slack-github-action@v1',
        with: {
          'webhook-url': this.config.webhookUrl,
          'payload': JSON.stringify({
            text: this.config.message,
            channel: this.config.channel,
          }),
        },
      }],
      env: {},
    };
  }

  public toGitlab(): GitlabStepConfig {
    const curlCommand = `curl -X POST -H 'Content-type: application/json' --data '{"text":"${this.config.message}"}' ${this.config.webhookUrl}`;
    return {
      extensions: [],
      needs: [],
      commands: [curlCommand],
      env: {},
    };
  }

  public toBash(): BashStepConfig {
    const curlCommand = `curl -X POST -H 'Content-type: application/json' --data '{"text":"${this.config.message}"}' ${this.config.webhookUrl}`;
    return {
      commands: [curlCommand],
    };
  }

  public toCodeCatalyst(): CodeCatalystStepConfig {
    const curlCommand = `curl -X POST -H 'Content-type: application/json' --data '{"text":"${this.config.message}"}' ${this.config.webhookUrl}`;
    return {
      needs: [],
      commands: [curlCommand],
      env: {},
    };
  }
}
```

## Summary

This coding specification provides a comprehensive guide to contributing to the projen-pipelines project. Key takeaways:

1. **Follow the abstraction pattern**: Keep engine-specific logic isolated in conversion methods
2. **Use TypeScript effectively**: Leverage interfaces, readonly properties, and type safety
3. **Adhere to code style**: Follow ESLint rules (2-space indent, single quotes, semicolons)
4. **Write tests**: All new features need tests, use snapshot testing for generated files
5. **Document thoroughly**: JSDoc comments on all public APIs with `@default` tags
6. **Follow patterns**: Study existing implementations before writing new code
7. **Compose steps**: Use `StepSequence` and factory methods for reusability

By following these guidelines, AI tools and developers can generate code that integrates seamlessly with the existing codebase and maintains consistency across the project.
