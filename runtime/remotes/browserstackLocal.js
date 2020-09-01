const wdio = require('webdriverio');
const browserstacklocal = require('browserstack-local');
const loadConfig = require('../configLoader.js');

const secrets = loadConfig('./runtime/scripts/secrets/browserstack.json');

let bsLocal;
const key = secrets.BROWSERSTACK_ACCESS_KEY;
const localIdentifier = secrets.BROWSERSTACK_LOCAL_IDENTIFIER;

// console.log(
//   `\nExpecting a player build served at port: ${process.env.http || '8080'}\n`
// );

// start browserstack-local for testing
console.log('Connecting local to browserstack automate...');
const bsLocalArgs = {
  key,
  localIdentifier,
  force: 'true',
  logfile: './browserstack.log',
};

// eslint-disable-next-line prefer-const
bsLocal = new browserstacklocal.Local();
wdio.bsLocal = bsLocal;

bsLocal.start(bsLocalArgs, async function (err) {
  if (err) {
    console.log('its done and not working', err.message);
  }
  console.log('Connected.\n\nNight gathers, and now my watch begins..\nI am the sword in the darkness.\n');

  // check if BrowserStack local instance is running
  console.log(bsLocal.isRunning());

  // stop the Local instance
  // bsLocal.stop(function() {
  //   console.log('Stopped BrowserStackLocal');
  // });
});
