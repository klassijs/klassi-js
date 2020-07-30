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
'use strict';

const path = require('path');
let shared = require('./scripts/secrets/emailConfig');

let browserName = global.settings.remoteConfig || global.BROWSER_NAME;
let mailList = global.mailList;

/**
 * Functionality for sending test results via email
 * @type {exports|module.exports}
 */
const nodemailer = require('nodemailer');

module.exports = {
  klassiSendMail: function() {
    /** To get all the files that need to be attached */
    let fileList = [{
      filename:
        projectName + ' ' + global.reportName + '-' + dateTime + '.html',
      path: path.resolve(
        global.paths.reports, browserName,
        projectName + ' ' + global.reportName + '-' + dateTime + '.html'
      )
    }];
    if(mailList.AccessibilityReport === 'Yes'){
      fileList = fileList.concat(accessibilityReportList);
    }
    
    let devTeam = mailList.nameList;
    /**
     * Email relay server connections
     */
    let transporter = nodemailer.createTransport({
      host: shared.host,
      port: shared.port,
      secure: false,
      auth: {
        user: shared.auth.user,
        pass: shared.auth.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    let mailOptions = {
      to: devTeam,
      from: 'Klassi-QaAutoTest <email@email.com>',
      subject: projectName + ' ' + global.reportName + '-' + browserName + '-' + dateTime,
      alternative: true,
      attachments:fileList,
      html:
        '<b>Please find attached the automated test results for test run on - </b> ' +
        dateTime
    };
  
    /**
     *  verify the connection and sends the message and get a callback with an error or details of the message that was sent
     */
    transporter.verify(function (err, success) {
      if (err) {
        console.log('Server failed to Start' + err.stack);
      } else {
        console.log('Server is ready to take our messages');
      }
      if (success) {
        try {
          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              log.error('Result Email CANNOT be sent: ' + err.stack);
              throw err;
            } else {
              log.info('Results Email successfully sent');
            }
          });
        } catch (err) {
          log.info('This is a system error: ', err.stack);
          throw err;
        }
      }
    });
  }
};
