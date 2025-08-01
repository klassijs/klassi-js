/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const path = require('path');
const nodemailer = require('nodemailer');
const { SESClient } = require('@aws-sdk/client-ses');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const getRemote = require('./getRemote');
const { astellen } = require('klassijs-astellen');

const remoteService = getRemote(settings.remoteService);
const emailDateTime = helpers.emailReportDateTime();

process.env.AWS_ACCESS_KEY_ID = process.env.SES_KEY;
process.env.AWS_SECRET_ACCESS_KEY = process.env.SES_SECRET;

const sesClient = new SESClient({
  apiVersion: '2010-12-01',
  region: emailData.SES_REGION,
  credentials: defaultProvider,
});

module.exports = {
  klassiSendMail: async () => {
    let fileList = [];

    if (remoteService && remoteService.type === 'lambdatest') {
      if (emailData.AccessibilityReport === 'Yes') {
        fileList = fileList.concat(accessibilityReportList);
      }
    }

    const devTeam = emailData.nameList;

    const transporter = nodemailer.createTransport({
      SES: { sesClient },
      statement: [
        {
          Effect: 'Allow',
          Action: 'ses:SendRawEmail',
          Resource: '*',
        },
      ],
    });

    const mailOptions = {
      to: devTeam,
      from: 'KLASSI-QATEST <QAAutoTest@klassi.co.uk>',
      subject: `${projectName} ${reportName}-${emailDateTime}`,
      alternative: true,
      attachments: fileList,
      html: `<b>Please find attached the automated test results for test run on - </b> ${emailDateTime}`,
    };

    await transporter.verify(async (err, success) => {
      if (err) {
        console.error('Server failed to Start', err.stack);
      } else {
        console.info('Server is ready to take our messages');
      }

      if (success) {
        try {
          await transporter.sendMail(mailOptions, (err) => {
            if (err) {
              console.error(`Results Email CANNOT be sent: ${err.stack}`);
              throw err;
            } else {
              console.info('Results Email successfully sent');
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
