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
const { Before, After } = require('@cucumber/cucumber');

let scenarioName;
let scenarioResult;

Before(async (scenario) => {
  scenarioName = scenario.pickle.name;
  return scenarioName;
});

After(async (scenario) => {
  scenarioResult = scenario;
  return scenarioResult;
});

function getCredentials() {
  /** adding the ability to deep dive */
  const user = process.env.LAMBDATEST_USERNAME;
  const key = process.env.LAMBDATEST_ACCESS_KEY;
  console.log('the result ===> ', user + key);

  assert.isNotEmpty(user, 'lambdatest requires a username');
  assert.isNotEmpty(key, 'lambdatest requires an access key');

  return { user, key };
}
let url;
let matchingBuilds;
let sessionsBody;

async function submitResults() {
  const credentials = getCredentials();
  const lambdatestUsername = credentials.user;
  const lambdatestApiKey = credentials.key;
  const apiCredentials = `${lambdatestUsername}:${lambdatestApiKey}`;

  url = `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/builds`;
  const buildsBody = await helpers.apiCall(url, 'GET', null, null);
  matchingBuilds = buildsBody.body.data;

  let i;
  // eslint-disable-next-line no-plusplus
  for (i = 0; i < matchingBuilds.length; i++) {
    const projectname = matchingBuilds[i].name;
    // eslint-disable-next-line no-await-in-loop
    await projectname;
    // eslint-disable-next-line no-undef
    if (projectname === dataconfig.projectName) {
      matchingBuilds = matchingBuilds[i].build_id;
    }
  }
  await matchingBuilds;
  url = `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/sessions`;
  sessionsBody = await helpers.apiCall(url, 'GET', null, null);

  let x;
  const sessionData = sessionsBody.body.data;
  // eslint-disable-next-line no-plusplus
  for (x = 0; x < sessionData.length; x++) {
    const sessionName = sessionData[x].build_name;
    // eslint-disable-next-line no-await-in-loop
    await sessionName;
  }
}

module.exports = {
  submitResults,
  getCredentials,
};
