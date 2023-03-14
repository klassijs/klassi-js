/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const path = require('path');
const nodeMailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const getRemote = require('./getRemote');

const remoteService = getRemote(settings.remoteService);
const browserName = settings.remoteConfig || BROWSER_NAME;
const envName = env.envName.toLowerCase();

process.env.AWS_ACCESS_KEY_ID = process.env.SES_KEY;
process.env.AWS_SECRET_ACCESS_KEY = process.env.SES_SECRET;
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: emailData.SES_REGION,
  defaultProvider,
});
/** Functionality for sending test results via email
 * @type {exports|module.exports}
 */
module.exports = {
  klassiSendMail: async () => {
    /** To get all the files that need to be attached */
    const date = helpers.currentDate();
    let fileList;
    if (remoteService && remoteService.type === 'lambdatest') {
      fileList = [
        {
          filename: `testReport-${date}.html`,
          path: path.resolve(`${paths.reports}/testReport-${date}.html`),
        },
        // {
        //   filename: 'index.html',
        //   path: path.resolve(`${paths.coverage}/index.html`),
        // },
      ];
      if (emailData.AccessibilityReport === 'Yes') {
        fileList = fileList.concat(accessibilityReportList);
      }
    } else {
      fileList = [
        {
          filename: `${reportName}-${dateTime}.html`,
          path: path.resolve(paths.reports, browserName, envName, `${reportName}-${dateTime}.html`),
        },
        // {
        //   filename: 'index.html',
        //   path: path.resolve(`${paths.coverage}/index.html`),
        // },
      ];
    }

    const devTeam = emailData.nameList;

    /** Email AWS server connections */
    const transporter = await nodeMailer.createTransport({
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
      from: 'klassi-QATEST <QAAutoTest@klassi.co.uk>',
      subject: `${projectName} ${reportName}-${dateTime}`,
      alternative: true,
      attachments: fileList,
      html: `<b>Please find attached the automated test results for test run on - </b> ${dateTime}`,
    };
    /** verify the connection and sends the message and get a callback with an error or details of the message that was sent
     */
    await transporter.verify(async (err, success) => {
      if (err) {
        console.error('Server failed to Start', err.stack);
      } else {
        console.log('Server is ready to take our messages');
      }
      if (success) {
        try {
          await transporter.sendMail(mailOptions, (err) => {
            if (err) {
              console.error(`Results Email CANNOT be sent: ${err.stack}`);
              throw err;
            } else {
              console.log('Results Email successfully sent');
              browser.pause(DELAY_200ms).then(() => {
                process.exit(0);
              });
            }
          });
        } catch (err) {
          console.error('There is a system error: ', err.stack);
          throw err;
        }
      }
    });
  },
};
