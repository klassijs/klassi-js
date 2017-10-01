'use strict';

const webdriverio = require('webdriverio'),
    chromedriver = require('chromedriver');

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function chromeDriver(){

    let driver = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'chrome',
            javascriptEnabled: true,
            acceptSslCerts: true,
            chromeOptions: {
                args: ['start-maximized']
            },
            path: chromedriver.path
        }
    });

    return driver;
};