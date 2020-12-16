const wdio = require('webdriverio');
const browserstacklocal = require('browserstack-local');

// eslint-disable-next-line global-require
const secrets = require('../scripts/secrets/browserstack.json');

let bsLocal;
const key = secrets.BROWSERSTACK_ACCESS_KEY;
const localIdentifier = secrets.BROWSERSTACK_LOCAL_IDENTIFIER;

// start browserstack-local for testing
console.log('Connecting local to browserstack automate.....');
const bsLocalArgs = {
  key,
  localIdentifier,
  force: 'true', // To kill other running Browserstack Local instances
  forceLocal: 'true', // To route all traffic via local(your) machine
  onlyAutomate: 'true', // To disable local testing for Live and Screenshots, and enable only Automate
  logfile: './browserstack.log',
};

// eslint-disable-next-line prefer-const
bsLocal = new browserstacklocal.Local();
wdio.bsLocal = bsLocal;

bsLocal.start(bsLocalArgs, async function (err) {
  if (err) {
    console.log('its not connected nor working - ', err.message);
  } else {
    console.log('Connected.\nNight gathers, and now my watch begins..\nI am the sword in the darkness.\n');
    // check if BrowserStack local instance is running
    console.log('Connected and running: ', bsLocal.isRunning());
  }
});

// stop the Local instance
// eslint-disable-next-line func-names
// bsLocal.stop(function () {
//   console.log('stopped BrowserStackLocal');
// });