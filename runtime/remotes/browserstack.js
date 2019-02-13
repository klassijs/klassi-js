/**
 KlassiTech Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2019 - Larry Goddard <larryg@klassitech.co.uk>
 
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
      
  let configBuildName = global.settings.remoteConfig.replace(/-/g,' ');
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