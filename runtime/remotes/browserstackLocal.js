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

const webdriverio = require('webdriverio');
const browserstacklocal = require('browserstack-local');
const loadConfig = require('../configLoader.js');
let secrets = loadConfig('./browserstack/secrets/browserstack.json');

let bs_local;
let key = secrets.BROWSERSTACK_ACCESS_KEY;
let localIdentifier = secrets.BROWSERSTACK_LOCAL_IDENTIFIER;

console.log(
  `\nExpecting a player build served at port: ${process.env.http || '8080'}\n`
);

// start browserstack-local for testing
console.log('Connecting local to browserstack automate...');
let bs_local_args = {
  'key': key,
  'localIdentifier': localIdentifier,
  'force': 'true',
  'logfile': './browserstackLocal.log'
};

bs_local = new browserstacklocal.Local();
webdriverio.bs_local = bs_local;

// if (bs_local === 'start') {
bs_local.start(bs_local_args, async function (err) {
  if (err){
    console.log('its done and not working', err.message);
  }
  console.log('Connected.\n\nNight gathers, and now my watch begins..\nI am the sword in the darkness.\n');
  
  // check if BrowserStack local instance is running
  console.log(bs_local.isRunning() + ' - Browserstack local instance is running' );
});
// }
// else{
// stop the Local instance
// bs_local.stop(function() {
//   console.log('Stopped BrowserStackLocal');
// });
// };

