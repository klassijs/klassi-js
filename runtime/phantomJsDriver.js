'use strict';

const webdriverio = require('webdriverio');
const phantomjs = require('phantomjs-prebuilt');

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function phantomJsDriver(){

    let driver = webdriverio.remote({
        desiredCapabilities: {
            browseName: 'phantomjs',
            javascriptEnabled: true,
            acceptSslCerts: true,
            'phantomjs.binary.path': './phantomjs-prebuilt/lib/phantom/bin/phantomjs',
        }
    });

    return driver;

};
