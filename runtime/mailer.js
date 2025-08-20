/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */

// const path = require('path');
// const nodemailer = require('nodemailer');
// const { SESClient } = require('@aws-sdk/client-ses');
// const { defaultProvider } = require('@aws-sdk/credential-provider-node');
// const getRemote = require('./getRemote');
// const { astellen } = require('klassijs-astellen');
//
// const remoteService = getRemote(settings.remoteService);
// const emailDateTime = helpers.emailReportDateTime();
//
// process.env.AWS_ACCESS_KEY_ID = process.env.SES_KEY;
// process.env.AWS_SECRET_ACCESS_KEY = process.env.SES_SECRET;
//
// const sesClient = new SESClient({
//   apiVersion: '2010-12-01',
//   region: emailData.SES_REGION,
//   credentials: defaultProvider,
// });
//
// module.exports = {
//   klassiSendMail: async () => {
//     let fileList = [];
//
//     if (remoteService && remoteService.type === 'lambdatest') {
//       if (emailData.AccessibilityReport === 'Yes') {
//         fileList = fileList.concat(accessibilityReportList);
//       }
//     }
//
//     const devTeam = emailData.nameList;
//
//     const transporter = nodemailer.createTransport({
//       SES: { sesClient },
//       statement: [
//         {
//           Effect: 'Allow',
//           Action: 'ses:SendRawEmail',
//           Resource: '*',
//         },
//       ],
//     });
//
//     const mailOptions = {
//       to: devTeam,
//       from: 'KLASSI-QATEST <QAAutoTest@klassi.co.uk>',
//       subject: `${projectName} ${reportName}-${emailDateTime}`,
//       alternative: true,
//       attachments: fileList,
//       html: `<b>Please find attached the automated test results for test run on - </b> ${emailDateTime}`,
//     };
//
//     await transporter.verify(async (err, success) => {
//       if (err) {
//         console.error('Server failed to Start', err.stack);
//       } else {
//         console.info('Server is ready to take our messages');
//       }
//
//       if (success) {
//         try {
//           await transporter.sendMail(mailOptions, (err) => {
//             if (err) {
//               console.error(`Results Email CANNOT be sent: ${err.stack}`);
//               throw err;
//             } else {
//               console.info('Results Email successfully sent');
//               browser.pause(DELAY_200ms).then(() => {
//                 process.exit(0);
//               });
//             }
//           });
//         } catch (err) {
//           console.error('There is a system error: ', err.stack);
//           throw err;
//         }
//       }
//     });
//   },
// };

const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const fs = require('fs');
const path = require('path');
const getRemote = require('./getRemote');

const remoteService = getRemote(settings.remoteService);
const emailDateTime = helpers.emailReportDateTime();

// Create SES client with AWS SDK v3
const sesClient = new SESClient({
  region: emailData.SES_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.SES_KEY,
    secretAccessKey: process.env.SES_SECRET,
  },
});

// Simple function to clean email addresses
const cleanEmail = (email) => {
  if (!email) return email;

  // Remove all whitespace and control characters first
  let cleaned = email.trim().replace(/[\s\u0000-\u001F\u007F-\u009F]/g, '');

  // Remove angle brackets and extract just the email part
  // Handle "Name<email@domain.com>" format
  const match = cleaned.match(/^(.+)<(.+@.+)>$/);
  if (match) {
    cleaned = match[2]; // Return just the email part
  }

  // Handle "<email@domain.com>" format
  const simpleMatch = cleaned.match(/^<(.+@.+)>$/);
  if (simpleMatch) {
    cleaned = simpleMatch[1]; // Return just the email part
  }

  // Final cleanup - remove any remaining whitespace
  cleaned = cleaned.trim();

  return cleaned;
};

// Function to create raw email message with proper attachment handling
const createRawEmail = (from, to, subject, html, attachments = []) => {
  const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);

  let rawMessage = '';
  rawMessage += `From: ${from}\r\n`;
  rawMessage += `To: ${to}\r\n`;
  rawMessage += `Subject: ${subject}\r\n`;
  rawMessage += `MIME-Version: 1.0\r\n`;
  rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

  // HTML part
  rawMessage += `--${boundary}\r\n`;
  rawMessage += `Content-Type: text/html; charset=UTF-8\r\n`;
  rawMessage += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
  rawMessage += `${html}\r\n\r\n`;

  // Attachments
  attachments.forEach((attachment, index) => {
    try {
      // Handle different attachment formats
      let content, filename, contentType;

      if (typeof attachment === 'string') {
        // If attachment is a file path
        if (fs.existsSync(attachment)) {
          content = fs.readFileSync(attachment);
          filename = path.basename(attachment);
          contentType = getContentType(filename);
        } else {
          return;
        }
      } else if (attachment && attachment.content) {
        // If attachment has content property
        content = attachment.content;
        filename = attachment.filename || 'attachment';
        contentType = attachment.contentType || 'application/octet-stream';
      } else if (attachment && attachment.path) {
        // If attachment has path property
        if (fs.existsSync(attachment.path)) {
          content = fs.readFileSync(attachment.path);
          filename = attachment.filename || path.basename(attachment.path);
          contentType = attachment.contentType || getContentType(filename);
        } else {
          return;
        }
      } else {
        return;
      }

      // Convert content to base64 if it's a buffer
      const base64Content = Buffer.isBuffer(content) ? content.toString('base64') : content;

      rawMessage += `--${boundary}\r\n`;
      rawMessage += `Content-Type: ${contentType}\r\n`;
      rawMessage += `Content-Transfer-Encoding: base64\r\n`;
      rawMessage += `Content-Disposition: attachment; filename="${filename}"\r\n\r\n`;
      rawMessage += `${base64Content}\r\n\r\n`;

    } catch (error) {
      console.error('Error processing attachment:', error);
    }
  });

  rawMessage += `--${boundary}--\r\n`;

  return rawMessage;
};

// Helper function to determine content type based on file extension
const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.xml': 'application/xml',
    '.json': 'application/json',
    '.csv': 'text/csv'
  };
  return contentTypes[ext] || 'application/octet-stream';
};

// Function to find accessibility reports
const findAccessibilityReports = () => {
  const reports = [];

  // Calculate today's date range (since the correct reports are generated today)
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Check common report directories
  const reportDirs = [
    './reports',
    './test-results',
    './results',
    './output',
    './dist',
    './build',
    './coverage',
    './reports/accessibility',
    './test-results/accessibility'
  ];

  reportDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          // Only include files modified today
          if (
            stats.isFile() &&
            stats.mtime >= today &&
            stats.mtime <= todayEnd &&
            (
              file.toLowerCase().includes('accessibility') ||
              file.toLowerCase().includes('a11y') ||
              file.toLowerCase().includes('report') ||
              file.endsWith('.html') ||
              file.endsWith('.json') ||
              file.endsWith('.xml')
            )
          ) {
            reports.push(filePath);
          }
        });
      } catch (error) {
        // Silently continue if directory can't be read
      }
    }
  });

  // Also check for any HTML files in current directory
  try {
    const currentDirFiles = fs.readdirSync('.');
    currentDirFiles.forEach(file => {
      const stats = fs.statSync(file);
      if (
        stats.isFile() &&
        stats.mtime >= today &&
        stats.mtime <= todayEnd &&
        file.endsWith('.html') &&
        (
          file.toLowerCase().includes('accessibility') ||
          file.toLowerCase().includes('a11y') ||
          file.toLowerCase().includes('report')
        )
      ) {
        reports.push(file);
      }
    });
  } catch (error) {
    // Silently continue if current directory can't be read
  }

  return reports;
};

module.exports = {
  klassiSendMail: async () => {
    try {
      let fileList = [];

      if (remoteService && remoteService.type === 'lambdatest') {
        if (!emailData.AccessibilityReport || emailData.AccessibilityReport === 'Yes') {
          // Search for accessibility reports in the file system
          const foundReports = findAccessibilityReports();
          if (foundReports.length > 0) {
            fileList = fileList.concat(foundReports);
          }

          // Also add the original accessibilityReportList if it has content
          if (accessibilityReportList && accessibilityReportList.length > 0) {
            fileList = fileList.concat(accessibilityReportList);
          }
        }
      }

      // Clean the email addresses
      const nameListRaw = emailData.nameList;
      const nameListArray = Array.isArray(nameListRaw)
        ? nameListRaw
        : nameListRaw.split(',').map(e => e.trim()).filter(Boolean);

      const devTeam = nameListArray
        .map(cleanEmail)
        .filter(e => !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));

      const recipientEmail = devTeam.join(',');

      if (!devTeam || devTeam.length === 0 || !recipientEmail) {
        console.error('No valid email addresses found, early return');
        return;
      }

      const senderEmail = 'KLASSI-QAAUTOTEST <QaAutoTest@klassi.co.uk>';
      const subject = `${projectName} ${reportName}-${emailDateTime}`;
      const html = `<b>Please find attached the automated test results for test run on - </b> ${emailDateTime}`;

      try {
        // Create raw email message
        const rawMessage = createRawEmail(senderEmail, recipientEmail, subject, html, fileList);

        const params = {
          RawMessage: {
            Data: Buffer.from(rawMessage, 'utf8')
          }
        };

        const command = new SendRawEmailCommand(params);
        const result = await sesClient.send(command);

        console.log('Results Email successfully sent');
        browser.pause(DELAY_200ms).then(() => {
          process.exit(0);
        });

      } catch (error) {
        console.error('Results Email CANNOT be sent:', error.message, error);
        throw error;
      }
    } catch (err) {
      console.error('Uncaught error in oupSendMail:', err);
    }
  },
};
