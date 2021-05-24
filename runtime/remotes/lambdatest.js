/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const gotApi = require('got');

const { dataconfig } = global;
function getCredentials() {
  /**
   * adding the ability to deep dive
   */
  const user = process.env.LAMBDATEST_USERNAME || dataconfig.ltlocal.userName || ltsecrets.userName;
  const key = process.env.LAMBDATEST_ACCESS_KEY || dataconfig.ltlocal.accessKey || ltsecrets.accessKey;
  assert.isNotEmpty(user, 'lambdatest requires a username');
  assert.isNotEmpty(key, 'lambdatest requires an access key');

  return { user, key };
}

async function submitResults(scenario) {
  const configBuildName = global.settings.remoteConfig.replace(/-/g, ' ');
  const credentials = getCredentials();
  const lambdatestUsername = credentials.user;
  const lambdatestApiKey = credentials.key;
  const apiCredentials = `${lambdatestUsername}:${lambdatestApiKey}`;
  const scenarioName = scenario.getName();

  const buildsBody = await gotApi({
    uri: `https://${apiCredentials}@api.lambdatest.com/automation/builds.json`,
  });
  const matchingBuilds = JSON.parse(buildsBody).filter((build) => build.automation_build.name === configBuildName);
  const build = matchingBuilds[0].automation_build;
  const buildId = build.hashed_id;
  const sessionsBody = await gotApi({
    uri: `https://${apiCredentials}@api.lambdatest.com/automation/builds/${buildId}/sessions.json`,
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
    uri: `https://${apiCredentials}@api.lambdatest.com/automation/sessions/${sessionId}.json`,
    method: 'GET',
    form: {
      status: statusString,
      reason: explanations.join('; '),
    },
  });
  const buildDetails = await gotApi({
    uri: `https://${apiCredentials}@api.lambdatest.com/automation/sessions/${sessionId}.json`,
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
