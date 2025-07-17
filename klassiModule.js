/**
 * This module is used to export all the required modules from Klassi-js to be consumed by all projects
 */

const safeRequire = (moduleName) => {
  try {
    return require(moduleName);
  } catch (error) {
    console.warn(`Warning: Could not load module '${moduleName}': ${error.message}`);
    return null;
  }
};

module.exports = {
  pactum: safeRequire('pactum'),
  webdriverio: safeRequire('webdriverio'),
  fs: safeRequire('fs-extra'),
  dotenv: safeRequire('dotenv'),
  S3Client: (() => {
    try {
      return require('@aws-sdk/client-s3').S3Client;
    } catch (error) {
      console.warn(`Warning: Could not load S3Client: ${error.message}`);
      return null;
    }
  })(),
  softAssert: safeRequire('klassijs-soft-assert'),
  visualValidation: safeRequire('klassijs-visual-validation'),
  a11yValidator: safeRequire('klassijs-a11y-validator'),
  astellen: safeRequire('klassijs-astellen'),
  smartOcr: safeRequire('klassijs-smart-ocr'),
};
