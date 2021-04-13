const wdio = require('webdriverio');
const browserstacklocal = require('browserstack-local');
const { dataconfig } = global;

let bsLocal;
const key = process.env.BROWSERSTACK_ACCESS_KEY || dataconfig.bslocal.accessKey;
const localIdentifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER || dataconfig.bslocal.identifier;

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
