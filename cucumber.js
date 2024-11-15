/**
 * Klassi-js Automated Testing Tool
 * Created by Larry Goddard
 */
const path = require('path');
const envName = env.envName.toLowerCase();

const options = {
  default: {
    // eslint-disable-next-line no-undef
    paths: featureFiles,
    require: ['runtime/world.js', 'node_modules/klassijs/runtime/world.js', 'step_definitions/**/*.js'],
    format: [
      '@cucumber/pretty-formatter',
      `json:${path.resolve(__dirname, paths.reports, browserName, envName, `${reportName}-${dateTime}.json`)}`,
    ],
    formatOptions: {
      colorsEnabled: true,
    },
  }
};

module.exports = options;
