import { createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios';

interface JiraConfig {
  readonly jiraUrl: string;
  readonly jiraUser: string;
  readonly jiraPassword: string;
}

function loadJiraConfig() {
  const configString = readFileSync(join('.projen', 'pipelines', 'jira.config')).toString();
  const jiraConfig: JiraConfig = JSON.parse(configString);
  return jiraConfig;
}

async function postToJira(path: string, body: any, headers?: RawAxiosRequestHeaders): Promise<AxiosResponse<any, any>> {
  const jiraConfig = loadJiraConfig();
  const url = `${jiraConfig.jiraUrl}/rest/api/2${path}`;
  const response = await axios.post(url, body, {
    method: 'POST',
    auth: {
      username: jiraConfig.jiraUser,
      password: jiraConfig.jiraPassword,
    },
    headers: {
      'X-Atlassian-Token': 'no-check',
      ...(headers ?? {}),
    },
  });
  return response;
}

export async function addJiraComment(issueKey: string, comment: string) {
  const res = await postToJira(`/issue/${issueKey}/comment`, { body: comment });
  console.log(res.status);
}

export async function addAttachmentToIssue(issueKey: string, filePath: string) {
  const data = {
    file: createReadStream(filePath),
  };
  const res = await postToJira(`/issue/${issueKey}/attachments`, data, { 'Content-Type': 'multipart/form-data' });
  console.log(res.status);
}
