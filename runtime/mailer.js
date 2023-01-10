/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const path = require('path');
const nodeMailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const getRemote = require('./getRemote');

const remoteService = getRemote(global.settings.remoteService);
const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
const envName = global.env.envName.toLowerCase();

process.env.AWS_ACCESS_KEY_ID = process.env.SES_KEY;
process.env.AWS_SECRET_ACCESS_KEY = process.env.SES_SECRET;
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  // region: emailData.SES_REGION,
  region: 'eu-west-1',
  defaultProvider,
});

/** Functionality for sending test results via email
 * @type {exports|module.exports}
 */
module.exports = {
  klassiSendMail() {
    /** To get all the files that need to be attached */
    let fileList;
    const date = this.formatDate();
    if (remoteService && remoteService.type === 'lambdatest') {
      fileList = [
        {
          filename: `testReport-${date}.html`,
          path: path.resolve(`${global.paths.reports}/testReport-${date}.html`),
        },
        // {
        //   filename: 'index.html',
        //   path: path.resolve(`${global.paths.coverage}/index.html`),
        // },
      ];
      if (emailData.AccessibilityReport === 'Yes') {
        fileList = fileList.concat(global.accessibilityReportList);
      }
    } else {
      fileList = [
        {
          filename: `${global.reportName}-${dateTime}.html`,
          path: path.resolve(global.paths.reports, browserName, envName, `${global.reportName}-${dateTime}.html`),
        },
        // {
        //   filename: 'index.html',
        //   path: path.resolve(`${global.paths.coverage}/index.html`),
        // },
      ];
    }

    // eslint-disable-next-line no-undef
    const devTeam = emailData.nameList;
    /** Email AWS server connections */
    const transporter = nodeMailer.createTransport({
      SES: { ses, aws },
      Statement: [
        {
          Effect: 'Allow',
          Action: 'ses:SendRawEmail',
          Resource: '*',
        },
      ],
    });

    const mailOptions = {
      to: devTeam,
      from: 'Klassi-QATEST <QAAutoTest@klassi.co.uk>',
      subject: `${projectName} ${global.reportName}-${dateTime}`,
      alternative: true,
      attachments: fileList,
      html: `<b>Please find attached the automated test results for test run on - </b> ${dateTime}`,
    };
    /** verify the connection and sends the message and get a callback with an error or details of the message that was sent
     */
    transporter.verify((err, success) => {
      if (err) {
        console.error('Server failed to Start', err.stack);
      } else {
        console.log('Server is ready to take our messages');
      }
      if (success) {
        try {
          // eslint-disable-next-line no-shadow
          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              console.error(`Results Email CANNOT be sent: ${err.stack}`);
              throw err;
            } else {
              console.log('Results Email successfully sent');
              // eslint-disable-next-line no-unused-vars
              browser.pause(DELAY_200ms).then(() => {
                process.exit(0);
              });
            }
          });
          // eslint-disable-next-line no-shadow
        } catch (err) {
          console.error('There is a system error: ', err.stack);
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
    // $yesterday.setDate($today.getDate()); // uncomment for testing sets the date to today.
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
