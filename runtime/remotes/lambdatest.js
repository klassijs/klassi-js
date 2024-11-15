/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const { Before, After } = require('@cucumber/cucumber');

let scenarioName;
let scenarioResult;

Before(async (scenario) => {
  scenarioName = scenario.pickle.name;
  return scenarioName;
});

After(async (scenario) => {
  scenarioResult = scenario.result;
  return scenarioResult;
});

function getCredentials() {
  /** adding the ability to deep dive */
  const user = process.env.LAMBDATEST_USERNAME;
  const key = process.env.LAMBDATEST_ACCESS_KEY;

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
  for (i = 0; i < matchingBuilds.length; i++) {
    const projectname = matchingBuilds[i].name;
    await projectname;
    if (projectname === dataconfig.projectName) {
      matchingBuilds = matchingBuilds[i].build_id;
    }
  }
  await matchingBuilds;
  url = `https://${apiCredentials}@api.lambdatest.com/automation/api/v1/sessions`;
  sessionsBody = await helpers.apiCall(url, 'GET', null, null);

  let x;
  const sessionData = sessionsBody.body.data;
  for (x = 0; x < sessionData.length; x++) {
    const sessionName = sessionData[x].build_name;
    await sessionName;
  }
}

module.exports = {
  submitResults,
  getCredentials,
};
