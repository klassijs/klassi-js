/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
const { remote } = require('webdriverio');
const program = require('commander');
// const fs = require('fs');
// const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const chromium = require('chromium');
const { execFile } = require('child_process');

let defaults = {};

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = async function chromiumDriver(options) {
  if (program.opts().wdProtocol) {
    defaults = {
      logLevel: 'error',
      path: '/wd/hub',
      capabilities: {
        browserName: 'chromium',
        'goog:chromeOptions': {
          // setChromeBinaryPath: execFile(chromium.path),
          args: ['--disable-popup-blocking'],
          // extensions: [modHeader],
        },
      },
    };
  } else {
    defaults = {
      logLevel: 'error',
      setChromeBinaryPath: execFile(chromium.path),
      capabilities: {
        browserName: 'chromium',
        'goog:chromeOptions': {
          // setChromeBinaryPath: execFile(chromium.path),
          args: ['--disable-popup-blocking'],
          // extensions: [modHeader],
        },
      },
    };
  }

  // Add proxy based on env var.
  const useProxy = process.env.USE_PROXY || false;

  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: 'http://ouparray.oup.com:8080',
      proxyType: 'MANUAL',
      autodetect: false,
    };
  }

  const extendedOptions = Object.assign(defaults, options);
  global.browser = await remote(extendedOptions);
  await browser.setWindowSize(1280, 1024);
  // console.log('this is the options', options);
  return browser;
};
