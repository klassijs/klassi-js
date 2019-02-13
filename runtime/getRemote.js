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

/**
 * @type {{submitResults, getCredentials}|*}
 */
const browserstack = require('./remotes/browserstack.js');

module.exports = function getRemote(remoteService){

  let remote = {};

  function noop(){
    log.info('If you are seeing this, you are running a non-existent remoteService');
  }

  if (!remoteService){
    remote.type = 'disabled';
    remote.after = noop;
  }
  else if (remoteService === 'browserstack'){
    remote.type = 'browserstack';
    remote.after = browserstack.submitResults;
  }
  else {
    log.info(`Unknown remote service ${remoteService}`);
    remote.type = 'unknown';
    remote.after = noop;
  }

  return remote;

};