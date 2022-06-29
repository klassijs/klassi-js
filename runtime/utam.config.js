const { cosmiconfigSync } = require('cosmiconfig');

const moduleName = process.env.ENV_CONFIG || 'envConfig';
const explorerSync = cosmiconfigSync(moduleName);
const searchedFor = explorerSync.search();
const envConfig = searchedFor.config;
const { dataConfig } = envConfig;

global.projectName = process.env.PROJECT_NAME || dataConfig.projectName;

module.exports = {
  pageObjectsRootDir: projectName === 'Klassi Automated Test' ? '../' : '../../../',
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
