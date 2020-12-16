/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>
 
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
const path = require('path');
const fs = require('fs-extra');
const winston = require('winston');

module.exports = {
  oupLog() {
    const MyDate = new Date();
    let date;

    MyDate.setDate(MyDate.getDate());
    // eslint-disable-next-line prefer-const,no-useless-concat
    date = `${`${'-' + '0'}${MyDate.getDate()}`.slice(-2)}-${`0${MyDate.getMonth() + 1}`.slice(
      -2
    )}-${MyDate.getFullYear()}`;
    const infoJsonFile = path.join(`./log/infoLog/${global.reportName}-${date}.json`).replace(/ /gi, '');
    const errorJsonFile = path.join(`./log/errorLog/${global.reportName}-${date}.json`).replace(/ /gi, '');

    fs.ensureFile(infoJsonFile, function (err) {
      if (err) {
        log.error(`The infoLog File has NOT been created: ${err.stack}`);
      }
    });

    fs.ensureFile(errorJsonFile, function (err) {
      if (err) {
        log.error(`The errorLog File has NOT been created: ${err.stack}`);
      }
    });

    /**
     * Log files are raised and sent to the relevant files
     */
    const logger = winston.createLogger({
      level: 'verbose',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.Console({}),
        new winston.transports.File({
          name: 'info-file',
          filename: infoJsonFile,
          level: 'info',
        }),
        new winston.transports.File({
          name: 'error-file',
          filename: errorJsonFile,
          level: 'error',
        }),
      ],
    });
    return logger;
  },
};

