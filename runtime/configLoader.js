const fs = require('fs-extra');

module.exports = function (configFilePath) {
  const json = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

  // TODO: add validation if schema
  return json;
};
