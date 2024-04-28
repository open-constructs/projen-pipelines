#!/usr/bin/env node

import { addAttachmentToIssue } from './jira';

void (async () => {
  switch (process.argv[2]) {
    case 'add':
      const [_a, _b, _c, issueRef, filePath] = process.argv;
      if (!issueRef || !filePath) {
        throw new Error('Invalid arguments');
      }
      await addAttachmentToIssue(issueRef, filePath);
      break;
    default:
      console.log('Cannot find command: ' + process.argv[2]);
      break;
  }
})().then(console.log);