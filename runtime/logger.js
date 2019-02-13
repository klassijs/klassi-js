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

const path = require('path'),
  fs = require('fs-extra'),
  winston = require('winston');

module.exports = {
  
  klassiLog: function (err) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    let MyDate = new Date();
    let date;
  
    MyDate.setDate(MyDate.getDate());
    date = ('-' + '0' + MyDate.getDate()).slice(-2) + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-' + MyDate.getFullYear() + ('-' + MyDate.getHours() + ':' + MyDate.getMinutes());
  
    let infoJsonFile = path.join('./log/infoLog/' + global.reportName + '-' + date + '.json').replace(/ /gi, ''),
      errorJsonFile = path.join('./log/errorLog/' + global.reportName + '-' + date + '.json').replace(/ /gi, '');
  
    fs.ensureFile(infoJsonFile, function (err) {
      if (err) {
        log.error('The infoLog File has NOT been created: ' + err.stack);
      }
    });
  
    fs.ensureFile(errorJsonFile, function (err) {
      if (err) {
        log.error('The errorLog File has NOT been created: ' + err.stack);
      }
    });
  
    /**
     * Log files are raised and sent to the relevant files
     */
    const log = (winston.createLogger({
      level: 'verbose',
      transports: [
        new winston.transports.Console({
          colorize: 'all',
          timestamp: true,
          prettyPrint: true
        }),
        new winston.transports.File({
          name: 'info-file',
          filename: infoJsonFile,
          level: 'info',
          json: false,
          prettyPrint: true
        }),
        new winston.transports.File({
          name: 'error-file',
          filename: errorJsonFile,
          level: 'error',
          json: false,
          prettyPrint: true
        })
      ]
    }));
    return log;
  }
};
