/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const path = require('path');
const envName = env.envName.toLowerCase();

const options = {
  default: {
    dryRun: dryRun,
    // eslint-disable-next-line no-undef
    paths: featureFiles,
    require: ['runtime/world.js', 'node_modules/klassi-js/runtime/world.js', 'step_definitions/**/*.js'],
    tags: global.resultingString,
    format: [
      '@cucumber/pretty-formatter',
      `json:${path.resolve(__dirname, paths.reports, browserName, envName, `${reportName}-${dateTime}.json`)}`,
    ],
    formatOptions: {
      colorsEnabled: true,
    },
  },

  /**
   * This is to allow tests tagged as APIs to run headless and NOT take a screenshot on error
   * @returns {Promise<*[]>}
   */
  filterQuietTags: async () => {
    let filePath = path.resolve(global.projectRootPath, './runtime/scripts/tagList.json');
    let filelist = await helpers.readFromJson(filePath);
    return [...filelist.tagNames, ...tagNames];
  },
};

module.exports = options;
