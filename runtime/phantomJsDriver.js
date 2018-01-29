/**
 * Klassi Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

const webdriverio = require('webdriverio'),
    phantomjs = require('phantomjs-prebuilt');

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function phantomJsDriver(){

    let options = {desiredCapabilities: {
        browseName: 'phantomjs',
        javascriptEnabled: true,
        acceptSslCerts: true,
        // 'phantomjs.binary.path': phantomjs.path,
        'phantomjs.binary.path': './node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs',
  
  
}};

    let driver = webdriverio.remote(options).then(function(){
        /** sets the browser window size to maximum
         */
        driver.windowHandleMaximize();
    });
    return driver;
};
