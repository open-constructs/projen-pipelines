import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  collect,
  isScannable,
  renderSummary,
  repoRoot,
  rewriteContent,
  walk,
  type Change,
  type ResolvedAction,
  type Resolver,
} from '../src/security/update-github-actions';

function fixedResolver(table: Record<string, ResolvedAction | null>): Resolver {
  // Mirror the production resolver's contract: normalize sub-path actions
  // (`github/codeql-action/init` → `github/codeql-action`) before lookup.
  return (repo: string) => {
    const key = repoRoot(repo);
    return key in table ? table[key] : null;
  };
}

describe('isScannable', () => {
  test('accepts ts/json/yml/yaml', () => {
    expect(isScannable('a.ts')).toBe(true);
    expect(isScannable('a.json')).toBe(true);
    expect(isScannable('a.yml')).toBe(true);
    expect(isScannable('a.yaml')).toBe(true);
  });

  test('rejects other extensions', () => {
    expect(isScannable('a.md')).toBe(false);
    expect(isScannable('a.js')).toBe(false);
    expect(isScannable('README')).toBe(false);
  });
});

describe('repoRoot', () => {
  test('returns owner/repo for simple refs', () => {
    expect(repoRoot('actions/checkout')).toBe('actions/checkout');
  });

  test('strips sub-paths for nested actions', () => {
    expect(repoRoot('github/codeql-action/init')).toBe('github/codeql-action');
    expect(repoRoot('github/codeql-action/analyze')).toBe('github/codeql-action');
  });
});

describe('walk / collect', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'uga-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  test('walks recursively, filtered by scannable extensions', () => {
    mkdirSync(join(dir, 'nested'));
    writeFileSync(join(dir, 'a.ts'), '');
    writeFileSync(join(dir, 'b.md'), '');
    writeFileSync(join(dir, 'nested', 'c.yml'), '');
    writeFileSync(join(dir, 'nested', 'd.txt'), '');

    const found = walk(dir).sort();
    expect(found).toEqual([join(dir, 'a.ts'), join(dir, 'nested', 'c.yml')]);
  });

  test('collect mixes files and directories', () => {
    mkdirSync(join(dir, 'sub'));
    writeFileSync(join(dir, 'top.ts'), '');
    writeFileSync(join(dir, 'sub', 'inner.json'), '');

    const direct = join(dir, 'standalone.yaml');
    writeFileSync(direct, '');

    const result = collect([join(dir, 'top.ts'), join(dir, 'sub'), direct]).sort();
    expect(result).toEqual([direct, join(dir, 'sub', 'inner.json'), join(dir, 'top.ts')].sort());
  });

  test('collect skips explicit files with non-scannable extensions', () => {
    const readme = join(dir, 'README.md');
    writeFileSync(readme, '');
    expect(collect([readme])).toEqual([]);
  });
});

describe('rewriteContent', () => {
  const SHA = 'deadbeefcafebabe0123456789abcdef01234567';
  const resolver = fixedResolver({
    'actions/checkout': { tag: 'v6.1.0', sha: SHA },
    'actions/download-artifact': { tag: 'v8.0.0', sha: `${SHA}08` },
    'aws-actions/configure-aws-credentials': { tag: 'v5.2.0', sha: `${SHA}aw` },
  });

  test('rewrites a standalone line and appends a tag comment', () => {
    const input = `      { name: 'Checkout' },
      {
        uses: 'actions/checkout@v6',
      },`;
    const { updated, changes } = rewriteContent('file.ts', input, resolver);

    expect(updated).toContain(`uses: 'actions/checkout@${SHA}', // v6.1.0`);
    expect(changes).toEqual([
      { file: 'file.ts', repo: 'actions/checkout', from: 'v6', to: SHA, tag: 'v6.1.0' },
    ]);
  });

  test('refreshes an existing trailing comment to the new tag', () => {
    const input = '        uses: \'actions/checkout@oldsha\', // v5.0.0\n';
    const { updated } = rewriteContent('file.ts', input, resolver);
    expect(updated).toContain(`uses: 'actions/checkout@${SHA}', // v6.1.0`);
    expect(updated).not.toContain('v5.0.0');
  });

  test('rewrites inline uses without corrupting surrounding properties', () => {
    const input = '      { name: \'Checkout\', uses: \'actions/checkout@v6\' },\n';
    const { updated } = rewriteContent('file.ts', input, resolver);
    expect(updated).toBe(
      `      { name: 'Checkout', uses: 'actions/checkout@${SHA}' },\n`,
    );
    // Inline form must not get a trailing `// tag` comment appended.
    expect(updated).not.toContain('//');
  });

  test('leaves unresolved references untouched', () => {
    const input = '        uses: \'some-org/unknown@v1\',\n';
    const { updated, changes } = rewriteContent('file.ts', input, resolver);
    expect(updated).toBe(input);
    expect(changes).toEqual([]);
  });

  test('is a no-op when the ref already matches the SHA', () => {
    const input = `        uses: 'actions/checkout@${SHA}', // v6.1.0\n`;
    const { updated, changes } = rewriteContent('file.ts', input, resolver);
    expect(updated).toBe(input);
    expect(changes).toEqual([]);
  });

  test('handles multiple distinct actions and mixed forms in one file', () => {
    const input = [
      "      { name: 'Checkout', uses: 'actions/checkout@v6' },",
      '      {',
      "        uses: 'actions/download-artifact@v7',",
      '      },',
      "      { uses: 'aws-actions/configure-aws-credentials@v5', with: { role: 'x' } },",
      '',
    ].join('\n');

    const { updated, changes } = rewriteContent('f.ts', input, resolver);

    expect(updated).toContain(`{ name: 'Checkout', uses: 'actions/checkout@${SHA}' }`);
    expect(updated).toContain(`uses: 'actions/download-artifact@${SHA}08', // v8.0.0`);
    expect(updated).toContain(
      `{ uses: 'aws-actions/configure-aws-credentials@${SHA}aw', with: { role: 'x' } }`,
    );
    expect(changes.map((c) => c.repo).sort()).toEqual([
      'actions/checkout',
      'actions/download-artifact',
      'aws-actions/configure-aws-credentials',
    ]);
  });

  test('resolves sub-path actions against the root repo', () => {
    const nested = fixedResolver({
      'github/codeql-action': { tag: 'v3.29.0', sha: 'feedface0123456789abcdef0123456789abcdef' },
    });
    const input = '        uses: \'github/codeql-action/init@v3\',\n';

    const { updated, changes } = rewriteContent('f.ts', input, nested);
    expect(updated).toContain(
      'uses: \'github/codeql-action/init@feedface0123456789abcdef0123456789abcdef\', // v3.29.0',
    );
    expect(changes[0].repo).toBe('github/codeql-action/init');
  });

  test('skips standalone comment refresh when the resolver returns null', () => {
    const input = '        uses: \'some-org/unknown@v1\',\n';
    const unresolvable = fixedResolver({});
    const { updated } = rewriteContent('f.ts', input, unresolvable);
    expect(updated).toBe(input);
  });
});

describe('renderSummary', () => {
  test('emits a markdown table with one row per change', () => {
    const changes: Change[] = [
      { file: 'a.ts', repo: 'actions/checkout', from: 'v6', to: 'abc', tag: 'v6.1.0' },
      { file: 'b.ts', repo: 'aws-actions/configure-aws-credentials', from: 'v5', to: 'def', tag: 'v5.2.0' },
    ];
    const out = renderSummary(changes);
    expect(out).toContain('## Action updates');
    expect(out).toContain('| Action | From | To (SHA) | Tag |');
    expect(out).toContain('| `actions/checkout` | `v6` | `abc` | `v6.1.0` |');
    expect(out).toContain('| `aws-actions/configure-aws-credentials` | `v5` | `def` | `v5.2.0` |');
    expect(out.endsWith('\n')).toBe(true);
  });
});
