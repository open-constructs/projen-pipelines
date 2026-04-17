// Scans TypeScript source for `uses: 'owner/repo@ref'` literals, resolves each
// action's latest stable release to a full commit SHA, and rewrites the
// literals in place. The resolved tag is recorded as a trailing TypeScript
// comment so reviewers can see the human-readable version alongside the SHA.
//
// Relies on the `gh` CLI for authenticated GitHub API access (GH_TOKEN env).

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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

const ROOT = process.argv[2] ?? 'src';
const ALLOW_PRERELEASE = process.env.ALLOW_PRERELEASE === 'true';

// Captures lines like:
//   uses: 'actions/checkout@v6',
//   uses: 'aws-actions/configure-aws-credentials@a1b2c3', // v5.0.0
// Group 1: leading `  uses: '`, Group 2: owner/repo(/sub), Group 3: ref,
// Group 4: closing `'` + optional comma, Group 5: trailing characters.
const LINE_RE = /^(\s*uses:\s*')([A-Za-z0-9_.\-/]+)@([A-Za-z0-9_.\-]+)('\s*,?)([^\n]*)$/gm;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.ts')) out.push(p);
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

const files = walk(ROOT);
const seen = new Map<string, ResolvedAction | null>();
const changes: Change[] = [];

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(LINE_RE, (line, pre, repo, ref, post, trailing) => {
    const root = repoRoot(repo);
    let target = seen.get(root);
    if (target === undefined) {
      try {
        const tag = latestStableTag(root);
        const sha = resolveSha(root, tag);
        target = { tag, sha };
        seen.set(root, target);
        console.error(`resolved ${root} ${tag} -> ${sha}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`skip ${root}: ${message}`);
        seen.set(root, null);
        return line;
      }
    }
    if (target === null) return line;
    if (ref === target.sha) return line;

    changes.push({ file, repo, from: ref, to: target.sha, tag: target.tag });
    const stripped = trailing.replace(/\s*\/\/.*$/, '').trimEnd();
    return `${pre}${repo}@${target.sha}${post}${stripped} // ${target.tag}`.trimEnd();
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
