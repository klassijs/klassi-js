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
const program = require('commander');
const nodeMailer = require('nodemailer');
const getRemote = require('./getRemote.js');
const shared = require('./scripts/secrets/emailConfig');

const remoteService = getRemote(global.settings.remoteService);
const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
// eslint-disable-next-line import/no-dynamic-require
let dataList;
if (program.aces) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  dataList = require(`../projects/${projectName}/test/configs/emailData.json`);
} else {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  dataList = require(`../projects/${projectName}/configs/emailData.json`);
}
const mailList = dataList;

/** Functionality for sending test results via email
 * @type {exports|module.exports}
 */
module.exports = {
  oupSendMail() {
    /** To get all the files that need to be attached */
    let fileList;
    const date = this.formatDate();
    if (remoteService && remoteService.type === 'browserstack') {
      fileList = [
        {
          filename: `testReport-${date}.html`,
          path: path.resolve(`${global.paths.reports}/testReport-${date}.html`),
        },
      ];
    } else {
      fileList = [
        {
          filename: `${projectName} ${global.reportName}-${dateTime}.html`,
          path: path.resolve(global.paths.reports, browserName, `${projectName} ${global.reportName}-${dateTime}.html`),
        },
      ];
      if (mailList.AccessibilityReport === 'Yes') {
        fileList = fileList.concat(global.accessibilityReportList);
      }
    }
    const devTeam = mailList.nameList;
    /** Email relay server connections */
    const transporter = nodeMailer.createTransport({
      host: shared.host,
      port: shared.port,
      secure: true,
      auth: {
        user: shared.auth.user,
        pass: shared.auth.pass,
      },
      tls: {
        // prevent it from failing with invalid/expired cert
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      to: devTeam,
      from: 'OUP-QaAutoTest <QaAutoTest@oup.com>',
      subject: `${projectName} ${global.reportName}-${browserName}-${dateTime}`,
      alternative: true,
      attachments: fileList,
      html: `<b>Please find attached the automated test results for test run on - </b> ${dateTime}`,
    };
    /** verify the connection and sends the message and get a callback with an error or details of the message that was sent
     */
    transporter.verify((err, success) => {
      if (err) {
        log.error('Server failed to Start', err.stack);
      } else {
        log.info('Server is ready to take our messages');
      }
      if (success) {
        try {
          transporter.sendMail(mailOptions, () => {
            if (err) {
              log.error(`Results Email CANNOT be sent: ${err.stack}`);
              throw err;
            } else {
              log.info('Results Email successfully sent');
              // eslint-disable-next-line no-unused-vars
              browser.pause(DELAY_200ms).then((r) => {
                process.exit(0);
              });
            }
          });
          // eslint-disable-next-line no-shadow
        } catch (err) {
          log.error('This is a system error: ', err.stack);
          throw err;
        }
      }
    });
  },
  /** @returns {string} */
  formatDate() {
    const $today = new Date();
    let $yesterday = new Date($today);
    $yesterday.setDate($today.getDate() - 1); // setDate also supports negative values, which cause the month to rollover.
    let $dd = $yesterday.getDate();
    let $mm = $yesterday.getMonth() + 1; // January is 0!
    const $yyyy = $yesterday.getFullYear();
    if ($dd < 10) {
      $dd = `0${$dd}`;
    }
    if ($mm < 10) {
      $mm = `0${$mm}`;
    }
    $yesterday = `${$dd}-${$mm}-${$yyyy}`;
    return $yesterday;
  },
};
