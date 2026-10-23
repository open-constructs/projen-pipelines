import { scanActionReferences, rewriteReference } from '../../src/security/update-github-actions';

describe('update-github-actions', () => {
  describe('scanActionReferences', () => {
    test('finds single- and double-quoted uses literals', () => {
      const source = [
        "uses: 'actions/checkout@v4'",
        'uses: "actions/setup-node@v6"',
      ].join('\n');

      const refs = scanActionReferences(source);
      expect(refs).toHaveLength(2);
      expect(refs[0]).toMatchObject({ action: 'actions/checkout', ref: 'v4' });
      expect(refs[1]).toMatchObject({ action: 'actions/setup-node', ref: 'v6' });
    });

    test('skips references already pinned to a full commit SHA', () => {
      const source = "uses: 'actions/checkout@3a743d2763e8a5612d57f4f72c252503030c571d'";
      expect(scanActionReferences(source)).toHaveLength(0);
    });

    test('deduplicates identical literals', () => {
      const source = [
        "uses: 'actions/checkout@v4'",
        "uses: 'actions/checkout@v4'",
      ].join('\n');
      expect(scanActionReferences(source)).toHaveLength(1);
    });

    test('handles owner/repo with dots and dashes', () => {
      const source = "uses: 'peter-evans/create-pull-request@v7'";
      const refs = scanActionReferences(source);
      expect(refs[0]).toMatchObject({ action: 'peter-evans/create-pull-request', ref: 'v7' });
    });
  });

  describe('rewriteReference', () => {
    const sha = '3a743d2763e8a5612d57f4f72c252503030c571d';

    test('replaces the ref with the SHA and keeps the tag as a trailing comment', () => {
      const source = "uses: 'actions/checkout@v4'";
      const out = rewriteReference(source, {
        action: 'actions/checkout',
        previousRef: 'v4',
        tag: 'v4.1.7',
        sha,
      });
      expect(out).toBe(`uses: 'actions/checkout@${sha}' # v4.1.7`);
    });

    test('preserves the original quote style', () => {
      const source = 'uses: "actions/checkout@v4"';
      const out = rewriteReference(source, {
        action: 'actions/checkout',
        previousRef: 'v4',
        tag: 'v4.1.7',
        sha,
      });
      expect(out).toBe(`uses: "actions/checkout@${sha}" # v4.1.7`);
    });

    test('replaces an existing trailing comment instead of appending', () => {
      const source = "uses: 'actions/checkout@v4' # v4";
      const out = rewriteReference(source, {
        action: 'actions/checkout',
        previousRef: 'v4',
        tag: 'v4.1.7',
        sha,
      });
      expect(out).toBe(`uses: 'actions/checkout@${sha}' # v4.1.7`);
      // no doubled comment
      expect(out.match(/#/g)).toHaveLength(1);
    });

    test('only rewrites the targeted action, leaving others untouched', () => {
      const source = [
        "uses: 'actions/checkout@v4'",
        "uses: 'actions/setup-node@v6'",
      ].join('\n');
      const out = rewriteReference(source, {
        action: 'actions/checkout',
        previousRef: 'v4',
        tag: 'v4.1.7',
        sha,
      });
      expect(out).toContain(`actions/checkout@${sha}`);
      expect(out).toContain("actions/setup-node@v6'");
    });
  });
});
