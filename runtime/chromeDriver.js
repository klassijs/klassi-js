/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

const webdriverio = require('webdriverio'),
    chromedriver = require('chromedriver');

/** createUrl the web browser based on globals set in index.js
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
    }).init();
    
    return driver;
};
