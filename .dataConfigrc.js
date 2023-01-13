/**
 klassi-js
 Copyright © 2016 - Larry Goddard
 */
module.exports = {
  dataConfig: {
    projectName: 'klassi-js',
    s3FolderName: 'klassi-js',

    emailData: {
      nameList: 'QaAutoTest <qaautotest@oup.com>',
      AccessibilityReport: 'Yes',
      SES_REGION: 'eu-west-1',
    },

    s3Data: {
      S3_BUCKET: 'test-app-automated-reports',
      S3_REGION: 'eu-west-2',
      S3_DOMAIN_NAME: 'http://test-app-automated-reports.s3.eu-west-2.amazonaws.com',
    },
  },
};
