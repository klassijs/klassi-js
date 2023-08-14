/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
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
