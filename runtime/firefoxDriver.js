/**
 * Klassi Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

const webdriverio = require('webdriverio'),
    firefox = require('geckodriver');

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function firefoxDriver(){

    let options = {desiredCapabilities: {
            browserName: 'firefox',
            javascriptEnabled: true,
            acceptSslCerts: true,
            setFirefoxOptions: {
                args: ['--headless'],
            'geckodriver.firefox.bin': firefox.path,
        }
    }};
    let driver = webdriverio.remote(options).then(function(){
        /** sets the browser window size to maximum
         */
        driver.windowHandleMaximize();
    });

    return driver;
};
