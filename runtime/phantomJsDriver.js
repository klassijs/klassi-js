/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const webdriverio = require('webdriverio'),
  phantomjs = require('phantomjs-prebuilt');

/** createUrl the web browser based on global let set in index.js
 * @returns {{}}
 */
module.exports = function phantomJsDriver(){
  
  let driver = new webdriverio.remote({
    desiredCapabilities: {
      browseName: 'phantomjs',
      javascriptEnabled: true,
      acceptSslCerts: true,
      'phantomjs.binary.path': './node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs'
    }
  }).init();
  
  return driver;
  
};
