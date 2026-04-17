#!/usr/bin/env node
// Scans configured source paths for `uses: 'owner/repo@ref'` literals, resolves
// each action to the latest stable release's commit SHA, and rewrites the
// literals in place. The resolved tag is recorded as a trailing TypeScript
// comment so reviewers can see the human-readable version alongside the SHA.
//
// Relies on the `gh` CLI for authenticated GitHub API access (GH_TOKEN env).

import { execSync } from 'child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

/** @internal */
export interface ResolvedAction {
  readonly tag: string;
  readonly sha: string;
}

/** @internal */
export interface Change {
  readonly file: string;
  readonly repo: string;
  readonly from: string;
  readonly to: string;
  readonly tag: string;
}

/** @internal */
export interface RewriteResult {
  readonly updated: string;
  readonly changes: Change[];
}

/** @internal */
export type Resolver = (repo: string) => ResolvedAction | null;

interface GitObject {
  readonly type: 'tag' | 'commit';
  readonly sha: string;
}

interface GitRefResponse {
  readonly object: GitObject;
}

interface GitTagResponse {
  readonly object: GitObject;
}

interface Release {
  readonly tag_name: string;
}

interface Tag {
  readonly name: string;
}

// Matches any `uses: 'owner/repo@ref'` literal, including inline forms like
// `{ name: 'Checkout', uses: 'actions/checkout@v6' },`. Group 1 captures the
// `uses:<ws>'` prefix, 2 the owner/repo(/sub), 3 the ref, 4 the closing quote.
/** @internal */
export const LITERAL_RE = /(uses:\s*')([A-Za-z0-9_.\-/]+)@([A-Za-z0-9_.\-]+)(')/g;

// Matches a line whose only non-whitespace content is a `uses:` literal (plus
// optional trailing comma and optional existing `// tag` comment). Group 1
// captures everything up to and including the closing quote + comma; group 2
// captures any existing trailing comment, which we replace.
/** @internal */
export const STANDALONE_LINE_RE = /^(\s*uses:\s*'[A-Za-z0-9_.\-/]+@[A-Za-z0-9_.\-]+'\s*,?)(\s*\/\/[^\n]*)?$/gm;

/** @internal */
export function isScannable(p: string): boolean {
  return p.endsWith('.ts') || p.endsWith('.json') || p.endsWith('.yml') || p.endsWith('.yaml');
}

/** @internal */
export function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (isScannable(p)) out.push(p);
  }
  return out;
}

/** @internal */
export function collect(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (isScannable(p)) out.push(p);
  }
  return out;
}

/** @internal */
export function repoRoot(useRef: string): string {
  // Sub-path actions like `github/codeql-action/init` must be resolved against
  // the root repo. Take only the first two path segments.
  const [owner, repo] = useRef.split('/');
  return `${owner}/${repo}`;
}

/**
 * Rewrites a file's content, swapping each resolved ref with its SHA and
 * adding/refreshing a trailing `// <tag>` comment on lines whose only
 * non-whitespace content is a `uses:` literal. Inline occurrences are
 * SHA-swapped only — their comment state is left untouched so surrounding
 * properties stay intact.
 * @internal
 */
export function rewriteContent(file: string, original: string, resolve: Resolver): RewriteResult {
  const tagByRepo = new Map<string, string>();
  const changes: Change[] = [];

  let updated = original.replace(LITERAL_RE, (match, pre, repo, ref, quote) => {
    const target = resolve(repo);
    if (!target || ref === target.sha) return match;
    changes.push({ file, repo, from: ref, to: target.sha, tag: target.tag });
    tagByRepo.set(repo, target.tag);
    return `${pre}${repo}@${target.sha}${quote}`;
  });

  updated = updated.replace(STANDALONE_LINE_RE, (line, head) => {
    const m = /'([A-Za-z0-9_.\-/]+)@[A-Za-z0-9_.\-]+'/.exec(head);
    if (!m) return line;
    const resolved = resolve(m[1]);
    const tag = tagByRepo.get(m[1]) ?? resolved?.tag;
    if (!tag) return line;
    return `${head.trimEnd()} // ${tag}`;
  });

  return { updated, changes };
}

/** @internal */
export function renderSummary(changes: Change[]): string {
  const lines = ['## Action updates', '', '| Action | From | To (SHA) | Tag |', '| --- | --- | --- | --- |'];
  for (const c of changes) {
    lines.push(`| \`${c.repo}\` | \`${c.from}\` | \`${c.to}\` | \`${c.tag}\` |`);
  }
  return lines.join('\n') + '\n';
}

function gh<T>(path: string): T {
  const raw = execSync(`gh api ${path}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(raw) as T;
}

function latestStableTag(repo: string, allowPrerelease: boolean): string {
  if (allowPrerelease) {
    const releases = gh<Release[]>(`/repos/${repo}/releases?per_page=10`);
    if (Array.isArray(releases) && releases.length > 0) return releases[0].tag_name;
  } else {
    try {
      return gh<Release>(`/repos/${repo}/releases/latest`).tag_name;
    } catch {
      // Repo may not publish GitHub Releases; fall through to tags.
    }
  }
  const tags = gh<Tag[]>(`/repos/${repo}/tags?per_page=1`);
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error(`No releases or tags found for ${repo}`);
  }
  return tags[0].name;
}

function resolveSha(repo: string, tag: string): string {
  const ref = gh<GitRefResponse>(`/repos/${repo}/git/ref/tags/${encodeURIComponent(tag)}`);
  let object: GitObject = ref.object;
  while (object.type === 'tag') {
    const t = gh<GitTagResponse>(`/repos/${repo}/git/tags/${object.sha}`);
    object = t.object;
  }
  if (!object.sha) throw new Error(`Unable to resolve SHA for ${repo}@${tag}`);
  return object.sha;
}

function main(): void {
  const paths = process.argv.slice(2);
  if (paths.length === 0) {
    console.error('usage: update-github-actions <path> [<path> ...]');
    process.exit(2);
  }
  const allowPrerelease = process.env.ALLOW_PRERELEASE === 'true';
  const cache = new Map<string, ResolvedAction | null>();

  const resolve: Resolver = (repoPath: string): ResolvedAction | null => {
    const root = repoRoot(repoPath);
    const cached = cache.get(root);
    if (cached !== undefined) return cached;
    try {
      const tag = latestStableTag(root, allowPrerelease);
      const sha = resolveSha(root, tag);
      const resolved: ResolvedAction = { tag, sha };
      cache.set(root, resolved);
      console.error(`resolved ${root} ${tag} -> ${sha}`);
      return resolved;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`skip ${root}: ${message}`);
      cache.set(root, null);
      return null;
    }
  };

  const allChanges: Change[] = [];
  for (const file of collect(paths)) {
    const original = readFileSync(file, 'utf8');
    const { updated, changes } = rewriteContent(file, original, resolve);
    allChanges.push(...changes);
    if (updated !== original) writeFileSync(file, updated);
  }

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath && allChanges.length > 0) {
    writeFileSync(summaryPath, renderSummary(allChanges), { flag: 'a' });
  }

  console.log(JSON.stringify({ changes: allChanges, resolved: [...cache.entries()] }, null, 2));
}

if (require.main === module) main();
