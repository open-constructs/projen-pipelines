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
    const hasAnyRemediation = this.stages.some(s => this.resolveRemediation(s).policy !== 'off');

    const lines: string[] = [
      '#!/bin/bash',
      'set -euo pipefail',
      '',
      hasAnyRemediation ? '# Drift Detection & Remediation Script' : '# Drift Detection Script',
      '',
      '# Parse command line arguments',
      'STAGE=""',
    ];

    if (hasAnyRemediation) {
      lines.push('AUTO_YES=""');
    }

    lines.push(
      'while [[ $# -gt 0 ]]; do',
      '  case $1 in',
      '    --stage)',
      '      STAGE="$2"',
      '      shift 2',
      '      ;;',
    );

    if (hasAnyRemediation) {
      lines.push(
        '    --yes|-y)',
        '      AUTO_YES="true"',
        '      shift',
        '      ;;',
      );
    }

    lines.push(
      '    *)',
      '      echo "Unknown option: $1"',
      `      echo "Usage: $0 [--stage STAGE_NAME]${hasAnyRemediation ? ' [--yes|-y]' : ''}"`,
      '      exit 1',
      '      ;;',
      '  esac',
      'done',
      '',
      '# Install dependencies if not already installed',
      'if ! command -v ts-node &> /dev/null; then',
      '  echo "Installing dependencies..."',
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
    );

    // Only include remediation/verification helper functions when needed
    if (hasAnyRemediation) {
      lines.push(
      '# Function to run drift remediation for a stage',
      'run_remediation() {',
      '  local stage_name=$1',
      '  local region=$2',
      '  local deploy_role_arn=$3',
      '  local policy=$4',
      '  local include_types=$5',
      '  local exclude_types=$6',
      '',
      '  echo "========================================"',
      '  echo "Running drift remediation for stage: $stage_name"',
      '  echo "========================================"',
      '',
      '  # Check if drift was detected',
      '  local results_file="drift-results-$stage_name.json"',
      '  if [[ ! -f "$results_file" ]]; then',
      '    echo "No detection results found for stage $stage_name. Skipping remediation."',
      '    return 0',
      '  fi',
      '',
      '  local drifted=$(jq \'[.[] | select(.driftStatus == "DRIFTED")] | length\' "$results_file")',
      '  if [[ "$drifted" -eq 0 ]]; then',
      '    echo "No drift detected in stage $stage_name. Skipping remediation."',
      '    return 0',
      '  fi',
      '',
      '  # For manual policy, prompt for confirmation (unless --yes)',
      '  if [[ "$policy" == "manual" ]] && [[ "$AUTO_YES" != "true" ]]; then',
      '    echo ""',
      '    echo "\\u26a0\\ufe0f  Drift detected in $drifted stacks in stage $stage_name."',
      '    echo "Remediation policy is \'manual\'. Approval required to proceed."',
      '    echo ""',
      '    read -p "Do you want to proceed with drift remediation? (yes/no): " CONFIRM',
      '    if [[ "$CONFIRM" != "yes" ]]; then',
      '      echo "Remediation skipped by user."',
      '      return 0',
      '    fi',
      '  fi',
      '',
      '  # Set environment variables',
      '  export AWS_DEFAULT_REGION="$region"',
      '  export DRIFT_DETECTION_INPUT="$results_file"',
      '  export DRIFT_REMEDIATION_OUTPUT="drift-remediation-$stage_name.json"',
      '  export STAGE_NAME="$stage_name"',
      '',
      '  # Assume deploy role if provided',
      '  if [[ -n "$deploy_role_arn" ]]; then',
      '    echo "Assuming deploy role: $deploy_role_arn"',
      '    CREDS=$(aws sts assume-role \\',
      '      --role-arn "$deploy_role_arn" \\',
      '      --role-session-name "drift-remediation-$stage_name" \\',
      '      --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" \\',
      '      --output text)',
      '    export AWS_ACCESS_KEY_ID=$(echo $CREDS | cut -d\' \' -f1)',
      '    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | cut -d\' \' -f2)',
      '    export AWS_SESSION_TOKEN=$(echo $CREDS | cut -d\' \' -f3)',
      '  fi',
      '',
      '  # Build revert command',
      '  local cmd="npx ts-node src/drift/revert-drift.ts --region $region --detection-results $results_file"',
      '',
      '  if [[ -n "$include_types" ]]; then',
      '    cmd="$cmd --include-resource-types $include_types"',
      '  fi',
      '',
      '  if [[ -n "$exclude_types" ]]; then',
      '    cmd="$cmd --exclude-resource-types $exclude_types"',
      '  fi',
      '',
      '  if [[ "$policy" == "auto" ]] || [[ "$AUTO_YES" == "true" ]]; then',
      '    cmd="$cmd --yes"',
      '  fi',
      '',
      '  # Run remediation',
      '  echo "Running: $cmd"',
      '  eval "$cmd"',
      '}',
      '',
      '# Function to run drift verification for a stage',
      'run_verification() {',
      '  local stage_name=$1',
      '  local region=$2',
      '  local role_arn=$3',
      '  local stacks=$4',
      '',
      '  echo "========================================"',
      '  echo "Running drift verification for stage: $stage_name"',
      '  echo "========================================"',
      '',
      '  # Check if remediation was performed',
      '  local remediation_file="drift-remediation-$stage_name.json"',
      '  if [[ ! -f "$remediation_file" ]]; then',
      '    echo "No remediation results found for stage $stage_name. Skipping verification."',
      '    return 0',
      '  fi',
      '',
      '  local reverted=$(jq \'.summary.revertedStacks\' "$remediation_file")',
      '  if [[ "$reverted" -eq 0 ]]; then',
      '    echo "No stacks were reverted in stage $stage_name. Skipping verification."',
      '    return 0',
      '  fi',
      '',
      '  # Set environment variables',
      '  export AWS_DEFAULT_REGION="$region"',
      '  export DRIFT_DETECTION_OUTPUT="drift-verify-$stage_name.json"',
      '',
      '  # Assume role if provided',
      '  if [[ -n "$role_arn" ]]; then',
      '    echo "Assuming role: $role_arn"',
      '    CREDS=$(aws sts assume-role \\',
      '      --role-arn "$role_arn" \\',
      '      --role-session-name "drift-verify-$stage_name" \\',
      '      --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" \\',
      '      --output text)',
      '    export AWS_ACCESS_KEY_ID=$(echo $CREDS | cut -d\' \' -f1)',
      '    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | cut -d\' \' -f2)',
      '    export AWS_SESSION_TOKEN=$(echo $CREDS | cut -d\' \' -f3)',
      '  fi',
      '',
      '  # Build verify command (re-run detection, always fail on drift)',
      '  local cmd="npx ts-node src/drift/detect-drift.ts --region $region"',
      '',
      '  if [[ -n "$stacks" ]]; then',
      '    cmd="$cmd --stacks $stacks"',
      '  fi',
      '',
      '  # Run verification',
      '  echo "Running: $cmd"',
      '  eval "$cmd"',
      '}',
      '',
      ); // end if (hasAnyRemediation)
    }

    lines.push(
      '# Stage configurations',
    );

    // Add stage configurations
    for (const stage of this.stages) {
      lines.push(`# Stage: ${stage.name}`);
      lines.push(`run_stage_${stage.name}() {`);
      lines.push(...this.generateStageFunction(stage));
      lines.push('}');
      lines.push('');

      // Add remediation function if policy is not 'off'
      const remediation = this.resolveRemediation(stage);
      if (remediation.policy !== 'off') {
        lines.push(`run_remediation_${stage.name}() {`);
        lines.push(...this.generateRemediationFunction(stage));
        lines.push('}');
        lines.push('');

        lines.push(`run_verify_${stage.name}() {`);
        lines.push(...this.generateVerificationFunction(stage));
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
      const remediation = this.resolveRemediation(stage);
      lines.push(`    ${stage.name})`);
      lines.push(`      run_stage_${stage.name} || FAILED_STAGES+=("${stage.name}")`);
      if (remediation.policy !== 'off') {
        lines.push(`      run_remediation_${stage.name} || FAILED_STAGES+=("${stage.name}-remediation")`);
        lines.push(`      run_verify_${stage.name} || FAILED_STAGES+=("${stage.name}-verification")`);
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
      const remediation = this.resolveRemediation(stage);
      lines.push(`  run_stage_${stage.name} || FAILED_STAGES+=("${stage.name}")`);
      if (remediation.policy !== 'off') {
        lines.push(`  run_remediation_${stage.name} || FAILED_STAGES+=("${stage.name}-remediation")`);
        lines.push(`  run_verify_${stage.name} || FAILED_STAGES+=("${stage.name}-verification")`);
      }
    }

    lines.push('fi');
    lines.push('');
    lines.push('# Summary');
    lines.push('echo ""');
    lines.push('echo "========================================"');
    lines.push(hasAnyRemediation
      ? 'echo "DRIFT DETECTION & REMEDIATION COMPLETE"'
      : 'echo "DRIFT DETECTION COMPLETE"');
    lines.push('echo "========================================"');
    lines.push('');
    if (hasAnyRemediation) {
      lines.push(this.generateBashSummaryScript());
      lines.push('');
    }
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
    const remediation = this.resolveRemediation(stage);

    const remediationStep = new DriftRemediationStep(this.project, {
      stageName: stage.name,
      region: stage.region,
      roleArn: stage.roleArn,
      jumpRoleArn: stage.jumpRoleArn,
      stackNames: stage.stackNames,
      remediation,
      environment: stage.environment,
    });

    const stepConfig = remediationStep.toBash();

    const lines: string[] = [];

    // Add check for drift detection results
    lines.push(`  # Check if drift was detected`);
    lines.push(`  if [[ ! -f "drift-results-${stage.name}.json" ]]; then`);
    lines.push(`    echo "No detection results found. Skipping remediation."`);
    lines.push(`    return 0`);
    lines.push(`  fi`);
    lines.push(`  local drifted=$(jq '[.[] | select(.driftStatus == "DRIFTED")] | length' "drift-results-${stage.name}.json")`);
    lines.push(`  if [[ "$drifted" -eq 0 ]]; then`);
    lines.push(`    echo "No drift detected. Skipping remediation."`);
    lines.push(`    return 0`);
    lines.push(`  fi`);
    lines.push('');

    // Add confirmation prompt for manual policy
    if (remediation.policy === 'manual') {
      lines.push(`  # Manual policy: require confirmation`);
      lines.push(`  if [[ "$AUTO_YES" != "true" ]]; then`);
      lines.push(`    echo ""`);
      lines.push(`    echo "Drift detected in $drifted stacks. Remediation requires approval."`);
      lines.push(`    read -p "Proceed with remediation for stage ${stage.name}? (yes/no): " CONFIRM`);
      lines.push(`    if [[ "$CONFIRM" != "yes" ]]; then`);
      lines.push(`      echo "Remediation skipped by user."`);
      lines.push(`      return 0`);
      lines.push(`    fi`);
      lines.push(`  fi`);
      lines.push('');
    }

    // Add step commands
    lines.push(...stepConfig.commands.map(cmd => `  ${cmd}`));

    return lines;
  }

  private generateVerificationFunction(stage: DriftDetectionStageOptions): string[] {
    const verifyStep = new DriftVerificationStep(this.project, {
      stageName: stage.name,
      region: stage.region,
      roleArn: stage.roleArn,
      jumpRoleArn: stage.jumpRoleArn,
      stackNames: stage.stackNames,
      environment: stage.environment,
    });

    const stepConfig = verifyStep.toBash();

    const lines: string[] = [];

    // Add check for remediation results
    lines.push(`  # Check if remediation was performed`);
    lines.push(`  if [[ ! -f "drift-remediation-${stage.name}.json" ]]; then`);
    lines.push(`    echo "No remediation results found. Skipping verification."`);
    lines.push(`    return 0`);
    lines.push(`  fi`);
    lines.push(`  local reverted=$(jq '.summary.revertedStacks' "drift-remediation-${stage.name}.json")`);
    lines.push(`  if [[ "$reverted" -eq 0 ]]; then`);
    lines.push(`    echo "No stacks were reverted. Skipping verification."`);
    lines.push(`    return 0`);
    lines.push(`  fi`);
    lines.push('');

    // Add step commands
    lines.push(...stepConfig.commands.map(cmd => `  ${cmd}`));

    return lines;
  }

  private generateBashSummaryScript(): string {
    return `# Print remediation summary
total_reverted=0
total_failed=0
total_gated=0

for file in drift-remediation-*.json; do
  if [[ -f "$file" ]]; then
    stage=$(jq -r '.stageName' "$file")
    reverted=$(jq '.summary.revertedStacks' "$file")
    failed=$(jq '.summary.failedStacks' "$file")
    gated=$(jq '.summary.gatedStacks' "$file")
    
    echo "Remediation - $stage: reverted=$reverted, failed=$failed, gated=$gated"
    
    total_reverted=$((total_reverted + reverted))
    total_failed=$((total_failed + failed))
    total_gated=$((total_gated + gated))
  fi
done

if [[ $total_reverted -gt 0 ]] || [[ $total_failed -gt 0 ]] || [[ $total_gated -gt 0 ]]; then
  echo ""
  echo "Remediation totals: reverted=$total_reverted, failed=$total_failed, gated=$total_gated"
fi`;
  }
}
