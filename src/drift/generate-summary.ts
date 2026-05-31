#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Generates a markdown summary of drift detection and remediation results.
 * Writes the summary to a file (default: drift-summary.md).
 *
 * Reads drift-results-*.json and drift-remediation-*.json from the working directory
 * (or a specified results directory).
 */

interface DriftSummary {
  totalStacks: number;
  totalDrifted: number;
  totalErrors: number;
  totalReverted: number;
  totalSkipped: number;
  totalFailed: number;
  totalGated: number;
  stages: StageSummary[];
}

interface StageSummary {
  name: string;
  stacks: number;
  drifted: number;
  errors: number;
  driftedStacks: Array<{ stackName: string; resourceCount: number }>;
  remediation?: {
    reverted: number;
    skipped: number;
    failed: number;
    gated: number;
  };
}

function generateSummary(resultsDir: string): DriftSummary {
  const summary: DriftSummary = {
    totalStacks: 0,
    totalDrifted: 0,
    totalErrors: 0,
    totalReverted: 0,
    totalSkipped: 0,
    totalFailed: 0,
    totalGated: 0,
    stages: [],
  };

  // Find all detection result files
  const files = findFiles(resultsDir, /^drift-results-.*\.json$/);

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const results = JSON.parse(content);
      const stageName = file.match(/drift-results-(.+)\.json/)?.[1] ?? 'unknown';

      const stacks = results.length;
      const driftedResults = results.filter((r: any) => r.driftStatus === 'DRIFTED');
      const drifted = driftedResults.length;
      const errors = results.filter((r: any) => r.error).length;

      const driftedStacks = driftedResults.map((r: any) => ({
        stackName: r.stackName,
        resourceCount: (r.driftedResources ?? []).length,
      }));

      const stageSummary: StageSummary = {
        name: stageName,
        stacks,
        drifted,
        errors,
        driftedStacks,
      };

      // Check for remediation results
      const remediationFile = file.replace('drift-results-', 'drift-remediation-');
      if (existsSync(remediationFile)) {
        try {
          const remContent = readFileSync(remediationFile, 'utf8');
          const remReport = JSON.parse(remContent);
          stageSummary.remediation = {
            reverted: remReport.summary?.revertedStacks ?? 0,
            skipped: remReport.summary?.skippedStacks ?? 0,
            failed: remReport.summary?.failedStacks ?? 0,
            gated: remReport.summary?.gatedStacks ?? 0,
          };
          summary.totalReverted += stageSummary.remediation.reverted;
          summary.totalSkipped += stageSummary.remediation.skipped;
          summary.totalFailed += stageSummary.remediation.failed;
          summary.totalGated += stageSummary.remediation.gated;
        } catch { /* ignore parse errors */ }
      }

      summary.totalStacks += stacks;
      summary.totalDrifted += drifted;
      summary.totalErrors += errors;
      summary.stages.push(stageSummary);
    } catch { /* ignore parse errors */ }
  }

  return summary;
}

function renderMarkdown(summary: DriftSummary): string {
  const lines: string[] = [];
  const hasRemediation = summary.totalReverted > 0 || summary.totalFailed > 0 || summary.totalGated > 0;

  lines.push(hasRemediation
    ? '## Drift Detection & Remediation Summary'
    : '## Drift Detection Summary');
  lines.push('');

  for (const stage of summary.stages) {
    lines.push(`### Stage: ${stage.name}`);
    lines.push(`- Total stacks: ${stage.stacks}`);
    lines.push(`- Drifted: ${stage.drifted}`);
    lines.push(`- Errors: ${stage.errors}`);

    if (stage.driftedStacks.length > 0) {
      lines.push('');
      lines.push('**Drifted stacks:**');
      for (const s of stage.driftedStacks) {
        lines.push(`  - ${s.stackName} (${s.resourceCount} resources)`);
      }
    }

    if (stage.remediation) {
      lines.push('');
      lines.push('**Remediation:**');
      lines.push(`- Reverted: ${stage.remediation.reverted}`);
      lines.push(`- Skipped: ${stage.remediation.skipped}`);
      lines.push(`- Failed: ${stage.remediation.failed}`);
      lines.push(`- Gated (requires approval): ${stage.remediation.gated}`);
    }

    lines.push('');
  }

  lines.push('### Overall Summary');
  lines.push(`- Total stacks checked: ${summary.totalStacks}`);
  lines.push(`- Total drifted stacks: ${summary.totalDrifted}`);
  lines.push(`- Total errors: ${summary.totalErrors}`);

  if (hasRemediation) {
    lines.push('');
    lines.push('**Remediation:**');
    lines.push(`- Stacks reverted: ${summary.totalReverted}`);
    lines.push(`- Stacks skipped: ${summary.totalSkipped}`);
    lines.push(`- Stacks failed: ${summary.totalFailed}`);
    lines.push(`- Stacks gated: ${summary.totalGated}`);
  }

  if (summary.totalDrifted > 0) {
    lines.push('');
    lines.push(`⚠️ **Action required:** Drift detected in ${summary.totalDrifted} stacks`);
  }

  return lines.join('\n');
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];

  if (!existsSync(dir)) {
    return results;
  }

  // Search in the directory itself
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      } else if (entry.isDirectory()) {
        // Search one level deep (for artifact directories)
        try {
          const subEntries = readdirSync(fullPath, { withFileTypes: true });
          for (const subEntry of subEntries) {
            if (subEntry.isFile() && pattern.test(subEntry.name)) {
              results.push(join(fullPath, subEntry.name));
            }
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }

  return results;
}

// Main entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  let resultsDir = '.';
  let outputFile = process.env.DRIFT_SUMMARY_OUTPUT || 'drift-summary.md';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--results-dir':
        resultsDir = args[++i];
        break;
      case '--output':
        outputFile = args[++i];
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        console.log('Usage: generate-summary [--results-dir DIR] [--output FILE]');
        process.exit(1);
    }
  }

  const summary = generateSummary(resultsDir);
  const markdown = renderMarkdown(summary);

  writeFileSync(outputFile, markdown);
  console.log(`Summary written to: ${outputFile}`);

  // Also print to stdout for convenience
  console.log('');
  console.log(markdown);
}

export { generateSummary, renderMarkdown, DriftSummary, StageSummary };
