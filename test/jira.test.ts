import * as testee from '../src/jira/jira';

test('Test working issue refs', () => {
  expect(testee.findJiraIssueKey('PP-1')).toEqual('PP-1');
  expect(testee.findJiraIssueKey(' PP-1')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('PP-1 ')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('Foo PP-1')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('PP-1 Foo')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('PP-1: Foo')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('Foo PP-1 Foo')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('feat: [PP-1] Foo')).toEqual('PP-1');
  expect(testee.findJiraIssueKey('feat: (PP-1) Foo')).toEqual('PP-1');
});

test('test mandatory whitespace around issekey', () => {
  expect(testee.findJiraIssueKey('FooPP-1Foo')).toBeUndefined();
  expect(testee.findJiraIssueKey('Foo PP-1Foo')).toBeUndefined();
});