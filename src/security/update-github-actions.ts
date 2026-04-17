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

interface ResolvedAction {
  readonly tag: string;
  readonly sha: string;
}

interface Change {
  readonly file: string;
  readonly repo: string;
  readonly from: string;
  readonly to: string;
  readonly tag: string;
}

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

const PATHS = process.argv.slice(2);
if (PATHS.length === 0) {
  console.error('usage: update-github-actions <path> [<path> ...]');
  process.exit(2);
}
const ALLOW_PRERELEASE = process.env.ALLOW_PRERELEASE === 'true';

// Matches any `uses: 'owner/repo@ref'` literal, including inline forms like
// `{ name: 'Checkout', uses: 'actions/checkout@v6' },`. Group 1 captures the
// `uses:<ws>'` prefix, 2 the owner/repo(/sub), 3 the ref, 4 the closing quote.
const LITERAL_RE = /(uses:\s*')([A-Za-z0-9_.\-/]+)@([A-Za-z0-9_.\-]+)(')/g;

// Matches a line whose only non-whitespace content is a `uses:` literal (plus
// optional trailing comma and optional existing `// tag` comment). Group 1
// captures everything up to and including the closing quote + comma; group 2
// captures any existing trailing comment, which we replace.
const STANDALONE_LINE_RE = /^(\s*uses:\s*'[A-Za-z0-9_.\-/]+@[A-Za-z0-9_.\-]+'\s*,?)(\s*\/\/[^\n]*)?$/gm;

function isScannable(p: string): boolean {
  return p.endsWith('.ts') || p.endsWith('.json') || p.endsWith('.yml') || p.endsWith('.yaml');
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (isScannable(p)) out.push(p);
  }
  return out;
}

function collect(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (isScannable(p)) out.push(p);
  }
  return out;
}

function gh<T>(path: string): T {
  const raw = execSync(`gh api ${path}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(raw) as T;
}

function repoRoot(useRef: string): string {
  // Sub-path actions like `github/codeql-action/init` must be resolved against
  // the root repo. Take only the first two path segments.
  const [owner, repo] = useRef.split('/');
  return `${owner}/${repo}`;
}

function latestStableTag(repo: string): string {
  if (ALLOW_PRERELEASE) {
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
  // Annotated tags point to a tag object; follow through to the commit.
  while (object.type === 'tag') {
    const t = gh<GitTagResponse>(`/repos/${repo}/git/tags/${object.sha}`);
    object = t.object;
  }
  if (!object.sha) throw new Error(`Unable to resolve SHA for ${repo}@${tag}`);
  return object.sha;
}

const files = collect(PATHS);
const seen = new Map<string, ResolvedAction | null>();
const changes: Change[] = [];

function resolve(repoPath: string): ResolvedAction | null {
  const root = repoRoot(repoPath);
  const cached = seen.get(root);
  if (cached !== undefined) return cached;
  try {
    const tag = latestStableTag(root);
    const sha = resolveSha(root, tag);
    const resolved: ResolvedAction = { tag, sha };
    seen.set(root, resolved);
    console.error(`resolved ${root} ${tag} -> ${sha}`);
    return resolved;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`skip ${root}: ${message}`);
    seen.set(root, null);
    return null;
  }
}

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const tagByRepo = new Map<string, string>();

  // Pass 1: replace the ref with the resolved SHA in every `uses:` literal,
  // including inline occurrences that share their line with other properties.
  let updated = original.replace(LITERAL_RE, (match, pre, repo, ref, quote) => {
    const target = resolve(repo);
    if (!target || ref === target.sha) return match;
    changes.push({ file, repo, from: ref, to: target.sha, tag: target.tag });
    tagByRepo.set(repo, target.tag);
    return `${pre}${repo}@${target.sha}${quote}`;
  });

  // Pass 2: on lines whose only content is a single `uses:` literal, insert or
  // refresh a trailing `// <tag>` comment so reviewers see the human-readable
  // version alongside the SHA. Inline forms are skipped to avoid corrupting
  // surrounding properties.
  updated = updated.replace(STANDALONE_LINE_RE, (line, head) => {
    const m = /'([A-Za-z0-9_.\-/]+)@[A-Za-z0-9_.\-]+'/.exec(head);
    if (!m) return line;
    const tag = tagByRepo.get(m[1]) ?? seen.get(repoRoot(m[1]))?.tag;
    if (!tag) return line;
    return `${head.trimEnd()} // ${tag}`;
  });

  if (updated !== original) writeFileSync(file, updated);
}

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath && changes.length > 0) {
  const lines = ['## Action updates', '', '| Action | From | To (SHA) | Tag |', '| --- | --- | --- | --- |'];
  for (const c of changes) {
    lines.push(`| \`${c.repo}\` | \`${c.from}\` | \`${c.to}\` | \`${c.tag}\` |`);
  }
  writeFileSync(summaryPath, lines.join('\n') + '\n', { flag: 'a' });
}

console.log(JSON.stringify({ changes, resolved: [...seen.entries()] }, null, 2));
