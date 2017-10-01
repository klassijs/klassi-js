'use strict';

const webdriverio = require('webdriverio'),
    firefox = require('geckodriver');

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function firefoxDriver(){

    let driver = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'firefox',
            javascriptEnabled: true,
            acceptSslCerts: true,
            'geckodriver.firefox.bin': firefox.path
        }
    });

    return driver;
};
