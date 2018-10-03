/**
* KlassiTech Automated Testing Tool
* Created by Larry Goddard
*/
'use strict';

const fs = require('fs-extra'),
  request = require('request');

module.exports = {
  /**
   * Download functionality and logic for all file types
   * @param url, @param dest, @param cb
   */
  fileDownload: function (url, dest, cb) {
    
    let file = fs.createWriteStream(dest);
    let sendReq = request.get(url);
    /**
    * verify response code
    */
    sendReq.on('response', function (response) {
      if (response.statusCode !== 200) {
        return cb('Response status was ' + response.statusCode);
      }
    });
    /**
     * check for request errors
     */
    sendReq.on('error', function (err) {
      fs.unlink(dest);
      
      if (cb) {
        return cb(err.message);
      }
    });
    
    sendReq.pipe(file);
    
    file.on('finish', function () {
      file.close(cb);  // close() is async, call cb after close completes.
    });
    
    file.on('error', function (err) { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      
      if (cb) {
        return cb(err.message);
      }
    });
  }
};