import { TextFile, Project } from 'projen';
import { DriftDetectionWorkflow, DriftDetectionWorkflowOptions, DriftDetectionStageOptions } from './base';
import { DriftDetectionStep, DriftRemediationStep, DriftVerificationStep } from './step';

export interface BashDriftDetectionWorkflowOptions extends DriftDetectionWorkflowOptions {
  /**
   * Path to the output script
   * @default "drift-detection.sh"
   */
  readonly scriptPath?: string;
}

export class BashDriftDetectionWorkflow extends DriftDetectionWorkflow {
  private readonly scriptPath: string;

  constructor(project: Project, options: BashDriftDetectionWorkflowOptions) {
    super(project, options);
    this.scriptPath = options.scriptPath ?? 'drift-detection.sh';

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
      '# Drift Detection Script',
      '',
      '# Parse command line arguments',
      'STAGE=""',
      ...(this.hasRemediation ? ['AUTO_YES="false"'] : []),
      'while [[ $# -gt 0 ]]; do',
      '  case $1 in',
      '    --stage)',
      '      STAGE="$2"',
      '      shift 2',
      '      ;;',
      ...(this.hasRemediation ? [
        '    --yes)',
        '      AUTO_YES="true"',
        '      shift',
        '      ;;',
      ] : []),
      '    *)',
      '      echo "Unknown option: $1"',
      ...(this.hasRemediation
        ? ['      echo "Usage: $0 [--stage STAGE_NAME] [--yes]"']
        : ['      echo "Usage: $0 [--stage STAGE_NAME]"']),
      '      exit 1',
      '      ;;',
      '  esac',
      'done',
      '',
      '# Install dependencies if not already installed',
      'if ! command -v ts-node &> /dev/null; then',
      '  echo "Installing dependencies..."',
      ...this.preInstallSteps.flatMap(step => step.toBash().commands.map(cmd => `  ${cmd}`)),
      `  ${this.project.projenCommand} install:ci`,
      'fi',
      '',
      '# Function to run drift detection for a stage',
      'run_drift_detection() {',
      '  local stage_name=$1',
      '  local region=$2',
      '  local role_arn=$3',
      '  local stacks=$4',
      '  local fail_on_drift=$5',
      '  local error_handlers=$6',
      '  local env_vars=$7',
      '',
      '  echo "========================================"',
      '  echo "Running drift detection for stage: $stage_name"',
      '  echo "========================================"',
      '',
      '  # Set environment variables',
      '  export AWS_DEFAULT_REGION="$region"',
      '  export DRIFT_DETECTION_OUTPUT="drift-results-$stage_name.json"',
      '  eval "$env_vars"',
      '',
      '  # Assume role if provided',
      '  if [[ -n "$role_arn" ]]; then',
      '    echo "Assuming role: $role_arn"',
      '    CREDS=$(aws sts assume-role \\',
      '      --role-arn "$role_arn" \\',
      '      --role-session-name "drift-detection-$stage_name" \\',
      '      --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" \\',
      '      --output text)',
      '    export AWS_ACCESS_KEY_ID=$(echo $CREDS | cut -d\' \' -f1)',
      '    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | cut -d\' \' -f2)',
      '    export AWS_SESSION_TOKEN=$(echo $CREDS | cut -d\' \' -f3)',
      '  fi',
      '',
      '  # Build command',
      '  local cmd="npx ts-node src/drift/detect-drift.ts --region $region"',
      '  ',
      '  if [[ -n "$stacks" ]]; then',
      '    cmd="$cmd --stacks $stacks"',
      '  fi',
      '  ',
      '  if [[ "$fail_on_drift" == "false" ]]; then',
      '    cmd="$cmd --no-fail-on-drift"',
      '  fi',
      '  ',
      '  if [[ -n "$error_handlers" ]]; then',
      '    cmd="$cmd --error-handlers \'$error_handlers\'"',
      '  fi',
      '',
      '  # Run drift detection',
      '  echo "Running: $cmd"',
      '  eval "$cmd" || {',
      '    local exit_code=$?',
      '    echo "Drift detection failed with exit code: $exit_code"',
      '    if [[ "$fail_on_drift" == "true" ]]; then',
      '      return $exit_code',
      '    fi',
      '  }',
      '}',
      '',
      '# Stage configurations',
    ];

    // Add stage configurations
    for (const stage of this.stages) {
      lines.push(`# Stage: ${stage.name}`);
      lines.push(`run_stage_${stage.name}() {`);
      lines.push(...this.generateStageFunction(stage));
      lines.push('}');
      lines.push('');

      const policy = this.remediationFor(stage);
      if (policy !== 'off') {
        lines.push(`# Remediation for stage: ${stage.name} (policy: ${policy})`);
        lines.push(`run_remediation_${stage.name}() {`);
        if (policy === 'manual') {
          lines.push('  if [[ "$AUTO_YES" != "true" ]]; then');
          lines.push(`    read -r -p "Revert drifted stacks in ${stage.name}? [y/N] " reply`);
          lines.push('    if [[ ! "$reply" =~ ^[Yy]$ ]]; then');
          lines.push('      echo "Skipping remediation."');
          lines.push('      return 0');
          lines.push('    fi');
          lines.push('  fi');
        }
        lines.push(...this.generateRemediationFunction(stage));
        lines.push('}');
        lines.push('');
        lines.push(`# Verification for stage: ${stage.name}`);
        lines.push(`run_verify_${stage.name}() {`);
        lines.push(...this.generateVerifyFunction(stage));
        lines.push('}');
        lines.push('');
      }
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
      if (this.remediationFor(stage) !== 'off') {
        lines.push(`      run_remediation_${stage.name} || FAILED_STAGES+=("${stage.name}-remediation")`);
        lines.push(`      run_verify_${stage.name} || FAILED_STAGES+=("${stage.name}-verify")`);
      }
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
      if (this.remediationFor(stage) !== 'off') {
        lines.push(`  run_remediation_${stage.name} || FAILED_STAGES+=("${stage.name}-remediation")`);
        lines.push(`  run_verify_${stage.name} || FAILED_STAGES+=("${stage.name}-verify")`);
      }
    }

    lines.push('fi');
    lines.push('');
    lines.push('# Summary');
    lines.push('echo ""');
    lines.push('echo "========================================"');
    lines.push('echo "DRIFT DETECTION COMPLETE"');
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

  private generateStageFunction(stage: DriftDetectionStageOptions): string[] {
    // Create drift detection step for this stage
    const driftStep = new DriftDetectionStep(this.project, stage);

    const stepConfig = driftStep.toBash();

    // Indent all commands
    return stepConfig.commands.map(cmd => `  ${cmd}`);
  }

  private generateRemediationFunction(stage: DriftDetectionStageOptions): string[] {
    const step = new DriftRemediationStep(this.project, {
      ...stage,
      includeResourceTypes: this.remediationOptions.includeResourceTypes,
      excludeResourceTypes: this.remediationOptions.excludeResourceTypes,
    });
    return step.toBash().commands.map(cmd => `  ${cmd}`);
  }

  private generateVerifyFunction(stage: DriftDetectionStageOptions): string[] {
    const step = new DriftVerificationStep(this.project, stage);
    return step.toBash().commands.map(cmd => `  ${cmd}`);
  }
}