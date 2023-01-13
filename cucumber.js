/**
 klassi-js
 Copyright © 2016 - Larry Goddard
 */
const path = require('path');
const envName = env.envName.toLowerCase();

const options = {
  default: {
    dryRun: global.dryRun,
    require: ['runtime/world.js', 'node_modules/klassi-js/runtime/world.js', 'step_definitions/**/*.js'],
    tags: global.resultingString,
    format: [
      '@cucumber/pretty-formatter',
      `json:${path.resolve(__dirname, global.paths.reports, browserName, envName, `${reportName}-${dateTime}.json`)}`,
    ],
    formatOptions: {
      colorsEnabled: true,
    },
  },
};
module.exports = options;
