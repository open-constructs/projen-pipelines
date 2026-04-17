#!/usr/bin/env node
// Scans TypeScript source for `uses: 'owner/repo@ref'` literals, resolves each
// action's latest stable release to a full commit SHA, and rewrites the
// literals in place. The resolved tag is recorded as a trailing TypeScript
// comment so reviewers can see the human-readable version alongside the SHA.
//
// Relies on the `gh` CLI for authenticated GitHub API access (GH_TOKEN env).

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] ?? 'src';
const ALLOW_PRERELEASE = process.env.ALLOW_PRERELEASE === 'true';

// Captures lines like:
//   uses: 'actions/checkout@v6',
//   uses: 'aws-actions/configure-aws-credentials@a1b2c3', // v5.0.0
// Group 1: leading `  uses: '`, Group 2: owner/repo(/sub), Group 3: ref,
// Group 4: closing `'` + optional comma, Group 5: trailing characters.
const LINE_RE = /^(\s*uses:\s*')([A-Za-z0-9_.\-/]+)@([A-Za-z0-9_.\-]+)('\s*,?)([^\n]*)$/gm;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

function gh(path) {
  const raw = execSync(`gh api ${path}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(raw);
}

function repoRoot(useRef) {
  // Sub-path actions like `github/codeql-action/init` must be resolved against
  // the root repo. Take only the first two path segments.
  const [owner, repo] = useRef.split('/');
  return `${owner}/${repo}`;
}

function latestStableTag(repo) {
  if (ALLOW_PRERELEASE) {
    const releases = gh(`/repos/${repo}/releases?per_page=10`);
    if (Array.isArray(releases) && releases.length) return releases[0].tag_name;
  } else {
    try {
      return gh(`/repos/${repo}/releases/latest`).tag_name;
    } catch {
      // Repo may not publish GitHub Releases; fall through to tags.
    }
  }
  const tags = gh(`/repos/${repo}/tags?per_page=1`);
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error(`No releases or tags found for ${repo}`);
  }
  return tags[0].name;
}

function resolveSha(repo, tag) {
  const ref = gh(`/repos/${repo}/git/ref/tags/${encodeURIComponent(tag)}`);
  let object = ref.object;
  // Annotated tags point to a tag object; follow through to the commit.
  while (object && object.type === 'tag') {
    const t = gh(`/repos/${repo}/git/tags/${object.sha}`);
    object = t.object;
  }
  if (!object || !object.sha) throw new Error(`Unable to resolve SHA for ${repo}@${tag}`);
  return object.sha;
}

const files = walk(ROOT);
const seen = new Map(); // repoRoot -> { tag, sha }
const changes = []; // { file, repo, from, to, tag }

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(LINE_RE, (line, pre, repo, ref, post, trailing) => {
    const root = repoRoot(repo);
    let target = seen.get(root);
    if (!target) {
      try {
        const tag = latestStableTag(root);
        const sha = resolveSha(root, tag);
        target = { tag, sha };
        seen.set(root, target);
        console.error(`resolved ${root} ${tag} -> ${sha}`);
      } catch (err) {
        console.error(`skip ${root}: ${err.message}`);
        seen.set(root, null);
        return line;
      }
    }
    if (!target) return line;
    if (ref === target.sha) return line;

    changes.push({ file, repo, from: ref, to: target.sha, tag: target.tag });
    const stripped = trailing.replace(/\s*\/\/.*$/, '').trimEnd();
    return `${pre}${repo}@${target.sha}${post}${stripped} // ${target.tag}`.trimEnd();
  });
  if (updated !== original) writeFileSync(file, updated);
}

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath && changes.length) {
  const lines = ['## Action updates', '', '| Action | From | To (SHA) | Tag |', '| --- | --- | --- | --- |'];
  for (const c of changes) {
    lines.push(`| \`${c.repo}\` | \`${c.from}\` | \`${c.to}\` | \`${c.tag}\` |`);
  }
  writeFileSync(summaryPath, lines.join('\n') + '\n', { flag: 'a' });
}

console.log(JSON.stringify({ changes, resolved: [...seen.entries()] }, null, 2));
