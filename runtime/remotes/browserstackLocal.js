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

