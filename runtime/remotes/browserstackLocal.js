/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
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
