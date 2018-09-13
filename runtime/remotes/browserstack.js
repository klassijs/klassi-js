/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';
/*global assert:false */

const rp = require('request-promise');
const loadConfig = require('../configLoader.js');

function getCredentials(){
  let secrets = loadConfig('browserstack/secrets/browserstack.json');

  let user = process.env.BROWSERSTACK_USERNAME || secrets.BROWSERSTACK_USERNAME;
  let key = process.env.BROWSERSTACK_ACCESS_KEY || secrets.BROWSERSTACK_ACCESS_KEY;

  assert.isNotEmpty(user,'BrowserStack requires a username');
  assert.isNotEmpty(key,'BrowserStack requires an access key');

  return {user:user,key:key};
}

async function submitResults(scenario){
      
  let configBuildName = global.settings.remoteConfig.replace(/\-/g,' ');
  let credentials = getCredentials();
  let browserstackUsername = credentials.user;
  let browserstackApiKey = credentials.key;
  let apiCredentials = `${browserstackUsername}:${browserstackApiKey}`;
  let scenarioName = scenario.getName();
  
  let buildsBody = await rp({
    uri:`https://${apiCredentials}@api.browserstack.com/automate/builds.json`
  });

  let matchingBuilds = JSON.parse(buildsBody).filter(build => build.automation_build.name === configBuildName);
  let build = matchingBuilds[0].automation_build;
  let buildId = build.hashed_id;

  let sessionsBody = await rp({
    uri: `https://${apiCredentials}@api.browserstack.com/automate/builds/${buildId}/sessions.json`
  });

  let latestSession = JSON.parse(sessionsBody)[0];
  let sessionId = latestSession.automation_session.hashed_id;

  let explanations = [];
    
  let statusString = scenario.isSuccessful() ? 'passed' : 'failed';
    
  if (scenario.isSuccessful()){
    explanations.push(`${scenarioName} succeeded`);
  }
    
  if (scenario.isPending()){
    explanations.push(`${scenarioName} is pending`);
  }

  if (scenario.isUndefined()){
    explanations.push(`${scenarioName} is undefined`);
  }

  if (scenario.isSkipped()){
    explanations.push(`${scenarioName} was skipped`);
  }

  if (scenario.isFailed()){
    explanations.push(`${scenarioName} failed:` + scenario.getException());
    explanations.push(scenario.getUri() + ' (' + scenario.getLine() + ')');
  }

  await rp({
    uri: `https://${apiCredentials}@api.browserstack.com/automate/sessions/${sessionId}.json`,
    method:'PUT',
    form:{
      'status':statusString,
      'reason':explanations.join('; ')
    }
  });
  
}
module.exports = {

  submitResults:submitResults,
  getCredentials:getCredentials
};