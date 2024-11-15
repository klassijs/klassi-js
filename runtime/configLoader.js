/**
 * OUP Automated Testing Tool
 * Created by Larry Goddard
 */
const fs = require('fs-extra');

module.exports = (configFilePath) => {
  return JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
  // TODO: add validation if schema
};
