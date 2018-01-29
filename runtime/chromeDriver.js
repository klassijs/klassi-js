/**
 * Klassi Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

const webdriverio = require('webdriverio'),
    chromedriver = require('chromedriver');

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function chromeDriver(){

    let driver = new webdriverio.remote({
        desiredCapabilities: {
            browserName: 'chrome',
            javascriptEnabled: true,
            acceptSslCerts: true,
            chromeOptions: {
                args: ['start-maximized',
                // 'headless',
                // 'disable-gpu'
                ],
            },
            path: chromedriver.path
        }
    });
    return driver;
};