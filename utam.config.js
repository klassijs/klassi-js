module.exports = {
  pageObjectsRootDir: './',
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
