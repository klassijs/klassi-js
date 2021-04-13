/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const gotApi = require('got');
const { dataconfig } = global;

function getCredentials() {
  /**
   * adding the user and key for browserstack
   */
  const user = process.env.BROWSERSTACK_USERNAME || dataconfig.bslocal.userName || bssecrets.userName;
  const key = process.env.BROWSERSTACK_ACCESS_KEY || dataconfig.bslocal.accessKey || bssecrets.accessKey;

  assert.isNotEmpty(user, 'BrowserStack requires a username');
  assert.isNotEmpty(key, 'BrowserStack requires an access key');

  return { user, key };
}

async function submitResults(scenario) {
  const configBuildName = global.settings.remoteConfig.replace(/-/g, ' ');
  const credentials = getCredentials();
  const browserstackUsername = credentials.user;
  const browserstackApiKey = credentials.key;
  const apiCredentials = `${browserstackUsername}:${browserstackApiKey}`;
  const scenarioName = scenario.getName();

  const buildsBody = await gotApi({
    uri: `https://${apiCredentials}@api.browserstack.com/automate/builds.json`,
  });
  const matchingBuilds = JSON.parse(buildsBody).filter((build) => build.automation_build.name === configBuildName);
  const build = matchingBuilds[0].automation_build;
  const buildId = build.hashed_id;
  const sessionsBody = await gotApi({
    uri: `https://${apiCredentials}@api.browserstack.com/automate/builds/${buildId}/sessions.json`,
  });

  const latestSession = JSON.parse(sessionsBody)[0];
  const sessionId = latestSession.automation_session.hashed_id;
  const explanations = [];
  const statusString = scenario.isSuccessful() ? 'passed' : 'failed';

  if (scenario.isSuccessful()) {
    explanations.push(`${scenarioName} succeeded`);
  }
  if (scenario.isPending()) {
    explanations.push(`${scenarioName} is pending`);
  }
  if (scenario.isUndefined()) {
    explanations.push(`${scenarioName} is undefined`);
  }
  if (scenario.isSkipped()) {
    explanations.push(`${scenarioName} was skipped`);
  }
  if (scenario.isFailed()) {
    explanations.push(`${scenarioName} failed:${scenario.getException()}`);
    explanations.push(`${scenario.getUri()} (${scenario.getLine()})`);
  }

  await gotApi({
    uri: `https://${apiCredentials}@api.browserstack.com/automate/sessions/${sessionId}.json`,
    method: 'PUT',
    form: {
      status: statusString,
      reason: explanations.join('; '),
    },
  });
  const buildDetails = await gotApi({
    uri: `https://${apiCredentials}@api.browserstack.com/automate/sessions/${sessionId}.json`,
    method: 'GET',
  });
  const detailsToArray = buildDetails.split('"');
  const publicUrlPosition = detailsToArray.indexOf('public_url');
  console.log('build details ', buildDetails);
  console.log(`public_url: ${detailsToArray[publicUrlPosition + 2]}`);
}

module.exports = {
  submitResults,
  getCredentials,
};
