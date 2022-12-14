const path = require('path');

const options = {
  default: {
    require: ['runtime/world.js', 'step_definitions/**/*.js'],
    tags: global.resultingString,
    format: [
      '@cucumber/pretty-formatter',
      `json:${path.resolve(
        __dirname,
        global.paths.reports,
        browserName,
        env.envName,
        `${reportName}-${dateTime}.json`
      )}`,
      'html:',
    ],
    formatOptions: {
      colorsEnabled: true,
    },
  },
};
module.exports = options;
