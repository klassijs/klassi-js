/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const { remote } = require('webdriverio');

let defaults = {};

/**
 * create the web browser based on globals set in index.js
 * @returns {{}}
 */
module.exports = async function androidDriver(options) {
  defaults = {
    logLevel: 'error',
    port: 4723,
    path: '/wd/hub',
    capabilities: {
      platformName: 'Android',
      noReset: true,
      fullReset: false,
      automationName: 'UiAutomator2',
      console: true,
    },
  };
  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: '',
      proxyType: 'MANUAL',
      autodetect: false,
    };
  }

  const extendedOptions = Object.assign(defaults, options);
  global.browser = await remote(extendedOptions);
  return browser;
};
