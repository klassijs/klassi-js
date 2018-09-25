'use strict';

const path = require('path');
const VisualRegressionCompare = require('wdio-visual-regression-service/compare');

module.exports = {
  getScreenshotName: function(basePath) {
    return function(context) {
      let type = context.type;
      let testName = context.test.title;
      let browserVersion = parseInt(context.browser.version, 10);
      let browserName = context.browser.name;
      let browserViewport = context.meta.viewport;
      let browserWidth = browserViewport.width;
      let browserHeight = browserViewport.height;
      return path.join(basePath, `${testName}_${type}_${browserName}_v${browserVersion}_${browserWidth}x${browserHeight}.png`);
    };
  },
  // exports.config = {
  // services: [
  //   'visual-regression',
  // ],
  visualRegression: {
    compare: new VisualRegressionCompare.LocalCompare({
      referenceName: getScreenshotName(path.join(process.cwd(), 'screenshots/reference')),
      screenshotName: getScreenshotName( path.join(process.cwd(), 'screenshots/screen')),
      diffName: getScreenshotName(path.join(process.cwd(), 'screenshots/diff')),
      misMatchTolerance: 0.01
    }),
    viewportChangePause: 300,
    viewports: [
      { width: 320, height: 480},
      { width: 480, height: 320},
      { width: 1024, height: 768}],
    orientations: ['landscape', 'portrait']
  }
  // };
};
