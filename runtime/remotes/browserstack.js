const program = require('commander');
const gotApi = require('got');
const loadConfig = require('../configLoader.js');

function getCredentials() {
  /**
   * adding the ability to deep dive
   */
  let cpPath;

  if (program.aces) {
    cpPath = '../../../runtime/scripts/secrets/browserstack.json';
  } else {
    cpPath = '../../runtime/scripts/secrets/browserstack.json';
  }
  const secrets = loadConfig(cpPath);

  const user = process.env.BROWSERSTACK_USERNAME || secrets.BROWSERSTACK_USERNAME;
  const key = process.env.BROWSERSTACK_ACCESS_KEY || secrets.BROWSERSTACK_ACCESS_KEY;

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
