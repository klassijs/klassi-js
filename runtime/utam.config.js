/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const { cosmiconfigSync } = require('cosmiconfig');

const moduleName = process.env.DATA_CONFIG || 'dataConfig';
const explorerSync = cosmiconfigSync(moduleName);
const searchedFor = explorerSync.search();
const dataconfig = searchedFor.config;
const { dataConfig } = dataconfig;

global.projectName = process.env.PROJECT_NAME || dataConfig.projectName;

module.exports = {
  pageObjectsRootDir: projectName === 'klassi-js' ? '../' : '../../../',
  pageObjectsFileMask: ['**/__utam__/**/*.utam.json'],
  extensionsFileMask: ['**/__utam__/**/*.utam.json'],
  pageObjectsOutputDir: 'page-objects/__utam__/compiledUTAM',
  extensionsOutputDir: 'utils',
  moduleTarget: 'commonjs',
  skipCommonJs: false,
  implicitTimeout: 0,
  explicitTimeout: process.env.CUCUMBER_TIMEOUT || 180000,
  pollingInterval: 200,
  alias: {},
};
