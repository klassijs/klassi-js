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
let uri;
let matchingBuilds;
// let buildId;
let sessionsBody;

async function submitResults() {
  const credentials = getCredentials();
  const lambdatestUsername = credentials.user;
  const lambdatestApiKey = credentials.key;
  const apiCredentials = `${lambdatestUsername}:${lambdatestApiKey}`;

  uri = `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/builds`;
  const buildsBody = await helpers.apiCall(uri, 'GET');
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
  // buildId = matchingBuilds;
  uri = `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/sessions`;
  sessionsBody = await helpers.apiCall(uri, 'GET');

  let x;
  const sessionData = sessionsBody.body.data;
  // eslint-disable-next-line no-plusplus
  for (x = 0; x < sessionData.length; x++) {
    const sessionName = sessionData[x].build_name;
    // eslint-disable-next-line no-await-in-loop
    await sessionName;
    // eslint-disable-next-line no-undef
    // if (projectname === dataconfig.projectName) {
    //   matchingBuilds = matchingBuilds[i].build_id;
    // }
  }

  // const { sessionId } = browser;
  // console.log('this is the session id ', sessionId);
  // console.log('this is the scenario result 2 ', scenarioResult.pickle.tags);
  // console.log('This is the feature name ', scenarioResult.sourceLocation.uri);
  // console.log('this is the scenario name ', scenarioName);
  // console.log('this is the scenario steps ', scenarioResult.pickle.steps[0].text);
  // console.log('this is the scenario locations ', scenarioResult.pickle.locations);

  // After(async(scenario) => {
  //   const { browser } = global;
  //   scenarioResult = scenario;
  //   if (scenarioResult.result.status === 'passed') {
  //     explanations.push(`${scenarioName} succeeded`);
  //   }
  //   if (scenarioResult.result.status === 'pending') {
  //     explanations.push(`${scenarioName} is pending`);
  //   }
  //   if (scenarioResult.result.status === 'undefined') {
  //     explanations.push(`${scenarioName} is undefined`);
  //   }
  //   if (scenarioResult.result.status === 'skipped') {
  //     explanations.push(`${scenarioName} was skipped`);
  //   }
  //   if (scenarioResult.result.status === 'failed') {
  //     console.log('this is the result of the test');
  //     await browser.executeScript('lambda-status=failed');
  //     explanations.push(`${scenarioName} failed:${scenarioResult.result.exception}`);
  //     explanations.push(`${scenarioResult.sourceLocation.uri} (${scenarioResult.sourceLocation.line})`);
  //   }
  //   return scenarioResult;
  // });

  // eslint-disable-next-line no-shadow
  // const explanations = [];

  // if (scenarioResult.result.status === 'passed') {
  //   explanations.push(`${scenarioName} succeeded`);
  // }
  // if (scenarioResult.result.status === 'pending') {
  //   explanations.push(`${scenarioName} is pending`);
  // }
  // if (scenarioResult.result.status === 'undefined') {
  //   explanations.push(`${scenarioName} is undefined`);
  // }
  // if (scenarioResult.result.status === 'skipped') {
  //   explanations.push(`${scenarioName} was skipped`);
  // }
  // if (scenarioResult.result.status === 'failed') {
  //   await browser.executeScript('lambda-status=failed');
  //   explanations.push(`${scenarioName} failed:${scenarioResult.result.exception}`);
  //   explanations.push(`${scenarioResult.sourceLocation.uri} (${scenarioResult.sourceLocation.line})`);
  // }

  // await gotApi({
  // uri: `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/sessions/${sessionId}`,
  // uri = `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/sessions`;
  // const stuff = await helpers.apiCall(uri, 'GET');
  // console.log('this is the get stuff ', stuff);
  // method: 'GET',
  // form: {
  //   status: '',
  //   reason: explanations.join('; '),
  // },
  // });

  // const buildDetails = await gotApi({
  //   uri: `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/sessions/${sessionId}`,
  //   method: 'GET',
  // });
  // const detailsToArray = buildDetails.split('"');
  // const publicUrlPosition = detailsToArray.indexOf('public_url');
  // console.log('build details ', buildDetails);
  // console.log(`public_url: ${detailsToArray[publicUrlPosition + 2]}`);
}

module.exports = {
  submitResults,
  getCredentials,
};
