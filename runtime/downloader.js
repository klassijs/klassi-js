/**
 KlassiTech Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2019 - Larry Goddard <larryg@klassitech.co.uk>
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
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