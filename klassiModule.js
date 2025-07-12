module.exports = {
  /**
   * This module is used to export all the required modules from Klassi-js to be consumed by all projects
   */
  pactum : require('pactum'),
  webdriverio : require('webdriverio'),
  fs : require('fs-extra'),
  dotenv : require('dotenv'),
  husky : require('husky'),
  S3Client : require('@aws-sdk/client-s3').S3Client,
};
