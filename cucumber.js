const path = require('path');

const options = {
  default: {
    require: ['runtime/world.js', 'step_definitions/**/*.js'],
    tags: global.resultingString,
    format: [
      '@cucumber/pretty-formatter',
      `message:${path.resolve(
        __dirname,
        global.paths.reports,
        browserName,
        env.envName,
        `${reportName}-${dateTime}.ndjson`
      )}`,
    ],
    formatOptions: {
      colorsEnabled: true,
    },
  },
};
module.exports = options;
