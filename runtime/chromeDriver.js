/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
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
            chromeOptions: {
                args: [
                    'start-maximized',
                    // 'headless',
                    // 'disable-popup-blocking',
                    // 'always-authorize-plugins'
                ],
                // binary: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
            },
            path: chromedriver.path
        }
    }).init();
    
    return driver;
};

