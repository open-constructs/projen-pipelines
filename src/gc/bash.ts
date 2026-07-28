import { TextFile, Project } from 'projen';
import { GarbageCollectionWorkflow, GarbageCollectionWorkflowOptions } from './base';
import { GarbageCollectionStep } from './step';

/**
 * Options for the Bash garbage collection workflow.
 */
export interface BashGarbageCollectionWorkflowOptions extends GarbageCollectionWorkflowOptions {
  /**
   * Path to the output script.
   * @default "cdk-gc.sh"
   */
  readonly scriptPath?: string;
}

/**
 * Generates a bash script that runs CDK garbage collection for each
 * configured stage. Supports running a specific stage via `--stage`
 * or all stages if no argument is provided.
 */
export class BashGarbageCollectionWorkflow extends GarbageCollectionWorkflow {
  private readonly scriptPath: string;

  constructor(project: Project, options: BashGarbageCollectionWorkflowOptions) {
    super(project, options);
    this.scriptPath = options.scriptPath ?? 'cdk-gc.sh';

    const script = this.generateBashScript();

    new TextFile(this.project, this.scriptPath, {
      lines: script.split('\n'),
      executable: true,
    });
  }

  private generateBashScript(): string {
    const lines: string[] = [
      '#!/bin/bash',
      'set -euo pipefail',
      '',
      '# CDK Garbage Collection Script',
      '',
      '# Parse command line arguments',
      'STAGE=""',
      'while [[ $# -gt 0 ]]; do',
      '  case $1 in',
      '    --stage)',
      '      STAGE="$2"',
      '      shift 2',
      '      ;;',
      '    *)',
      '      echo "Unknown option: $1"',
      '      echo "Usage: $0 [--stage STAGE_NAME]"',
      '      exit 1',
      '      ;;',
      '  esac',
      'done',
      '',
      '# Install dependencies if not already installed',
      'if ! command -v cdk &> /dev/null; then',
      '  echo "Installing dependencies..."',
      ...this.preInstallSteps.flatMap(step => step.toBash().commands.map(cmd => `  ${cmd}`)),
      `  ${this.project.projenCommand} install:ci`,
      'fi',
      '',
      '# Stage functions',
    ];

    // Add stage functions
    for (const stage of this.stages) {
      lines.push(`# Stage: ${stage.name}`);
      lines.push(`run_stage_${stage.name}() {`);
      lines.push('  echo "========================================"');
      lines.push(`  echo "Running garbage collection for stage: ${stage.name}"`);
      lines.push('  echo "========================================"');
      lines.push(...this.generateStageFunction(stage));
      lines.push('}');
      lines.push('');
    }

    // Add main execution logic
    lines.push('# Main execution');
    lines.push('FAILED_STAGES=()');
    lines.push('');
    lines.push('if [[ -n "$STAGE" ]]; then');
    lines.push('  # Run specific stage');
    lines.push('  case "$STAGE" in');

    for (const stage of this.stages) {
      lines.push(`    ${stage.name})`);
      lines.push(`      run_stage_${stage.name} || FAILED_STAGES+=("${stage.name}")`);
      lines.push('      ;;');
    }

    lines.push('    *)');
    lines.push('      echo "Unknown stage: $STAGE"');
    lines.push('      echo "Available stages:"');
    for (const stage of this.stages) {
      lines.push(`      echo "  - ${stage.name}"`);
    }
    lines.push('      exit 1');
    lines.push('      ;;');
    lines.push('  esac');
    lines.push('else');
    lines.push('  # Run all stages');

    for (const stage of this.stages) {
      lines.push(`  run_stage_${stage.name} || FAILED_STAGES+=("${stage.name}")`);
    }

    lines.push('fi');
    lines.push('');
    lines.push('# Summary');
    lines.push('echo ""');
    lines.push('echo "========================================"');
    lines.push('echo "CDK GARBAGE COLLECTION COMPLETE"');
    lines.push('echo "========================================"');
    lines.push('');
    lines.push('if [[ ${#FAILED_STAGES[@]} -gt 0 ]]; then');
    lines.push('  echo "Failed stages:"');
    lines.push('  printf \'  - %s\\n\' "${FAILED_STAGES[@]}"');
    lines.push('  exit 1');
    lines.push('else');
    lines.push('  echo "All stages completed successfully"');
    lines.push('fi');

    return lines.join('\n');
  }

  private generateStageFunction(stage: typeof this.stages[number]): string[] {
    const gcStep = new GarbageCollectionStep(this.project, {
      stage,
      workflowGcOptions: this.gcOptions,
    });

    const stepConfig = gcStep.toBash();

    // Indent all commands
    return stepConfig.commands.map(cmd => `  ${cmd}`);
  }
}
