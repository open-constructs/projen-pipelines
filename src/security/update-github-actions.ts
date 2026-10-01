#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, extname } from 'node:path';

/**
 * A single `uses: 'owner/repo@ref'` occurrence found in a scanned file.
 */
export interface ActionReference {
  /** The `owner/repo` part of the action. */
  readonly action: string;
  /** The ref the action is currently pinned to (a tag, branch or SHA). */
  readonly ref: string;
  /** The full literal that was matched, e.g. `uses: 'actions/checkout@v4'`. */
  readonly match: string;
}

/**
 * The result of resolving an {@link ActionReference} against the GitHub API.
 */
export interface ResolvedAction {
  readonly action: string;
  /** The ref that was present before the update. */
  readonly previousRef: string;
  /** The latest stable release tag (e.g. `v4.1.7`). */
  readonly tag: string;
  /** The full commit SHA the tag resolves to. */
  readonly sha: string;
}

/**
 * Matches `uses: 'owner/repo@ref'` literals (single or double quoted).
 *
 * Group 1: quote char, Group 2: `owner/repo`, Group 3: `ref`.
 */
const USES_LITERAL = /uses:\s*(['"])([\w.-]+\/[\w.-]+)@([\w.\-/]+)\1/g;

/**
 * Scan the given source text for `uses: 'owner/repo@ref'` literals.
 *
 * This intentionally ignores references that are already pinned to a full
 * 40-character commit SHA, so re-running the tool is idempotent.
 */
export function scanActionReferences(source: string): ActionReference[] {
  const found: ActionReference[] = [];
  const seen = new Set<string>();

  for (const m of source.matchAll(USES_LITERAL)) {
    const [match, , action, ref] = m;
    // Skip references already pinned to a full commit SHA.
    if (/^[0-9a-f]{40}$/i.test(ref)) {
      continue;
    }
    const key = `${match}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    found.push({ action, ref, match });
  }

  return found;
}

/**
 * Rewrite a single `uses:` literal so the ref becomes the resolved SHA, keeping
 * the original tag as a trailing comment for human readability.
 *
 * `uses: 'actions/checkout@v4'`
 *   -> `uses: 'actions/checkout@3a743d...' // v4`
 *
 * Existing trailing SHA comments for the same action are replaced rather than
 * appended, so repeated runs do not accumulate comments.
 */
export function rewriteReference(source: string, resolved: ResolvedAction): string {
  const { action, previousRef, tag, sha } = resolved;
  const escapedAction = action.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const escapedRef = previousRef.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  // Match the literal for this specific action@ref, capturing the quote char,
  // and any pre-existing trailing `# tag` comment on the same line.
  const pattern = new RegExp(
    `uses:\\s*(['"])${escapedAction}@${escapedRef}\\1([ \\t]*(?://|#)[^\\n]*)?`,
    'g',
  );
  return source.replace(pattern, (_full, quote: string) => {
    return `uses: ${quote}${action}@${sha}${quote} # ${tag}`;
  });
}

/**
 * Query the GitHub Releases API for the latest stable release tag of an action
 * and resolve it to a full commit SHA.
 *
 * Uses the `gh api` CLI when available (so it inherits `GH_TOKEN`), and honours
 * `includePrerelease` to opt into pre-release tags.
 */
export function resolveLatestSha(
  action: string,
  currentRef: string,
  includePrerelease = false,
): ResolvedAction | undefined {
  const tag = fetchLatestTag(action, includePrerelease);
  if (!tag) {
    return undefined;
  }
  const sha = resolveTagToSha(action, tag);
  if (!sha) {
    return undefined;
  }
  return { action, previousRef: currentRef, tag, sha };
}

function ghApi(path: string): any {
  const out = execSync(`gh api ${path}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(out);
}

function fetchLatestTag(action: string, includePrerelease: boolean): string | undefined {
  if (includePrerelease) {
    const releases = ghApi(`repos/${action}/releases?per_page=1`);
    return Array.isArray(releases) && releases.length > 0 ? releases[0].tag_name : undefined;
  }
  // `releases/latest` already excludes drafts and pre-releases.
  const latest = ghApi(`repos/${action}/releases/latest`);
  return latest?.tag_name;
}

function resolveTagToSha(action: string, tag: string): string | undefined {
  // A tag ref may be lightweight (points straight at a commit) or annotated
  // (points at a tag object we must dereference to its commit).
  const ref = ghApi(`repos/${action}/git/refs/tags/${encodeURIComponent(tag)}`);
  const obj = Array.isArray(ref) ? ref[0]?.object : ref?.object;
  if (!obj) {
    return undefined;
  }
  if (obj.type === 'commit') {
    return obj.sha;
  }
  if (obj.type === 'tag') {
    const tagObj = ghApi(`repos/${action}/git/tags/${obj.sha}`);
    return tagObj?.object?.sha;
  }
  return undefined;
}

interface UpdateSummaryRow {
  readonly file: string;
  readonly action: string;
  readonly previousRef: string;
  readonly tag: string;
  readonly sha: string;
}

/**
 * Append a Markdown summary table of the applied updates to the GitHub Actions
 * job summary (`$GITHUB_STEP_SUMMARY`), falling back to stdout.
 */
export function writeJobSummary(rows: UpdateSummaryRow[]): void {
  const lines: string[] = ['## GitHub Actions pinning', ''];
  if (rows.length === 0) {
    lines.push('No action references needed updating.');
  } else {
    lines.push('| File | Action | From | To (SHA) | Tag |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const r of rows) {
      lines.push(`| \`${r.file}\` | ${r.action} | ${r.previousRef} | \`${r.sha.slice(0, 12)}…\` | ${r.tag} |`);
    }
  }
  const summary = lines.join('\n') + '\n';
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (target) {
    appendFileSync(target, summary);
  } else {
    console.log(summary);
  }
}

const SCANNABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.json', '.yml', '.yaml']);

function listFiles(target: string): string[] {
  if (!existsSync(target)) {
    return [];
  }
  const stat = execSync(`test -d "${target}" && echo dir || echo file`, { encoding: 'utf8' }).trim();
  if (stat === 'file') {
    return SCANNABLE_EXTENSIONS.has(extname(target)) ? [target] : [];
  }
  // Directory: enumerate tracked, scannable files (excluding node_modules/lib).
  const out = execSync(
    `find "${target}" -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' \\) ` +
      "-not -path '*/node_modules/*' -not -path '*/lib/*'",
    { encoding: 'utf8' },
  );
  return out.split('\n').map(l => l.trim()).filter(Boolean);
}

interface CliOptions {
  readonly targets: string[];
  readonly includePrerelease: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const targets: string[] = [];
  let includePrerelease = false;
  for (const arg of argv) {
    if (arg === '--include-prerelease') {
      includePrerelease = true;
    } else if (arg.startsWith('--')) {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    } else {
      targets.push(arg);
    }
  }
  if (targets.length === 0) {
    targets.push('src', '.projen', '.projenrc.ts');
  }
  return { targets, includePrerelease };
}

function main(): void {
  const { targets, includePrerelease } = parseArgs(process.argv.slice(2));

  const files = Array.from(new Set(targets.flatMap(listFiles)));
  console.log(`Scanning ${files.length} file(s) for pinned GitHub Actions...`);

  // Resolve each distinct action@ref only once.
  const resolutionCache = new Map<string, ResolvedAction | undefined>();
  const rows: UpdateSummaryRow[] = [];

  for (const file of files) {
    let source = readFileSync(file, 'utf8');
    const refs = scanActionReferences(source);
    if (refs.length === 0) {
      continue;
    }

    let changed = false;
    for (const ref of refs) {
      const cacheKey = `${ref.action}@${ref.ref}`;
      let resolved: ResolvedAction | undefined;
      if (resolutionCache.has(cacheKey)) {
        resolved = resolutionCache.get(cacheKey);
      } else {
        try {
          resolved = resolveLatestSha(ref.action, ref.ref, includePrerelease);
        } catch (err: any) {
          console.error(`Failed to resolve ${cacheKey}: ${err.message}`);
          resolved = undefined;
        }
        resolutionCache.set(cacheKey, resolved);
      }

      if (!resolved || resolved.sha === ref.ref) {
        continue;
      }

      source = rewriteReference(source, resolved);
      changed = true;
      rows.push({
        file: join(file),
        action: resolved.action,
        previousRef: resolved.previousRef,
        tag: resolved.tag,
        sha: resolved.sha,
      });
      console.log(`  ${file}: ${resolved.action}@${resolved.previousRef} -> ${resolved.sha} # ${resolved.tag}`);
    }

    if (changed) {
      writeFileSync(file, source);
    }
  }

  writeJobSummary(rows);
  console.log(`Updated ${rows.length} action reference(s).`);
}

if (require.main === module) {
  main();
}
