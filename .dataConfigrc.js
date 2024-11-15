module.exports = {
  dataConfig: {
    "projectName": "Klassi-js Example Test",
    "s3FolderName": "example-test-suite", // This is your Github repo name

    emailData: {
      nameList: 'QaAutoTest <qaautotest@oup.com>', // list of addresses report will be emailed too
      AccessibilityReport: 'Yes',
      SES_REGION: 'eu-west-1',
    },

    s3Data: {
      S3_BUCKET: 'test-app-automated-reports',
      S3_REGION: 'eu-west-2',
      S3_DOMAIN_NAME: 'http://test-app-automated-reports.s3.eu-west-2.amazonaws.com',
    },

    tagNames: [
      // "@space" : place all tags use for APIs tests here i.e. "@apitest"
    ]
  },
};
