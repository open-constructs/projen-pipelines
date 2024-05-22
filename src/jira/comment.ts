#!/usr/bin/env node

import { addJiraComment } from './jira';

void (async () => {
  switch (process.argv[2]) {
    case 'add':
      const [_a, _b, _c, issueRef, commentText] = process.argv;
      if (!issueRef || !commentText) {
        throw new Error('Invalid arguments');
      }
      await addJiraComment(issueRef, commentText);
      break;
    default:
      console.log('Cannot find command: ' + process.argv[2]);
      break;
  }
})().then(console.log);