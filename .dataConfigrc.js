/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
module.exports = {
  dataConfig: {
    projectName: 'klassi-js',
    s3FolderName: 'github repo name',

    emailData: {
      nameList: 'userName <user@email.com>',
      AccessibilityReport: 'Yes',
      SES_REGION: 'eu-xxx',
    },

    s3Data: {
      S3_BUCKET: 'BucketName',
      S3_REGION: 'eu-xxx',
      S3_DOMAIN_NAME: 'http://DOMAIN-NAME.amazonaws.com',
    },
  },
};
