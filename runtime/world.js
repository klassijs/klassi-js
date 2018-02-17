/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

/** world.js is loaded by the cucumber framework before loading the step definitions and feature files
 * it is responsible for setting up and exposing the driver/browser/expect/assert etc required within each step definition
 */
const fs = require('fs-plus'),
  fse = require('fs-extra-promise'),
  path = require('path'),
  requireDir = require('require-dir'),
  merge = require('merge'),
  chalk = require('chalk'),
  dir = require('node-dir'),
  assert = require('chai').assert,
  expect = require('chai').expect,
  reporter = require('cucumber-html-reporter'),
  rp = require('request-promise'),
  webdriverio = require('webdriverio'),
  webdrivercss = require('webdrivercss-custom-v4-compatible');

/**
 * Create the download and docs folder for storing all files
 * @type {string}
 */
let fileDnldFldr = ('./shared-objects/fileDnldFolder/'),
    docsFolder = ('./shared-objects/docs'),
    fileName = path.join('./shared-objects/docs/fileName.txt');

    fse.ensureDir(fileDnldFldr, function (err) {
        if(err){
            log.error('The File Download Folder has NOT been created: ' + err.stack);
        }
    });
    fse.ensureDir(docsFolder,  function (err) {
        if(err){
            log.error('The Docs Folder has NOT been created: ' + err.stack);
        }
    });
    fse.ensureFile(fileName, function (err) {
        if(err){
            log.error('The fileName File has NOT been created: ' + err.stack);
        }
    });

/**
 * for the Logging feature
 */
global.logger = require('../runtime/logger');

/**
 * for the environment variables
 */
global.envConfig = require('../runtime/envConfig.json');

/**
 *  for the Download of all file types
 */
global.downloader = require('../runtime/downloader.js');

/**
 * for all assertions for variable testing
 */
global.assert = assert;
global.expect = expect;

/**
 * Environment variables
 * @type {*|(function(): driver)}
 */
let PhantomJsDriver = require('./phantomJsDriver'),
  ChromeDriver = require('./chromeDriver'),
  FirefoxDriver = require('./firefoxDriver');

/**
 * createUrl the web browser based on global let set in index.js
 * @returns {{}}
 */
function getDriverInstance() {

  let driver = {};
  let screenWidth = []; //[752, 1008, 1280];

  switch (browserName || '') {

    case 'firefox': {
      driver = FirefoxDriver();
    } break;

    case 'phantomjs': {
      driver = new PhantomJsDriver();
    } break;

    case 'chrome': {
      driver = new ChromeDriver();
    } break;

  }

  /**
   *  initialise WebdriverCSS for `driver` instance
   */
  webdrivercss.init(driver, {
    screenshotRoot: './cssImages/baseline/',
    failedComparisonsRoot: './cssImages/imageDiff/',
    misMatchTolerance: 1.15,
    screenWidth: screenWidth,
    updateBaseline: false
  });
  return driver;
}

/**
 * Global timeout 60 seconds default
 * @type {number}
 */
global.DEFAULT_TIMEOUT = 60 * 1000;

function consoleInfo(){
    let args = [].slice.call(arguments),
        output = chalk.bgBlue.white('\n>>>>> \n' + args + '\n<<<<<\n');
    console.log(output);
}

/**
 * All Global variables
 * @constructor
 */
function World(){
    /**
     * This is the Global date functionality
     */
    let date = helpers.currentDate();

  /**
   * Adding logging
   */
  let log = logger.oupLog();

  /**
   * createUrl a list of variables to expose globally and therefore accessible within each step definition
   * @type {{driver: null, webdriverio, webdrivercss: *, expect: *, assert: (*), trace: consoleInfo,
   * log: log, page: {}, shared: {}}}
   */
  let runtime = {
    driver: null,                 // the browser object
    webdriverio: webdriverio,     // the raw webdriverio driver module, providing access to static properties/methods
    webdrivercss: webdrivercss,   // the raw webdrivercss driver function
    expect: global.expect,        // expose chai expect to allow variable testing
    assert: global.assert,        // expose chai assert to allow variable testing
    fs: fs,                       // expose fs (file system) for use globally
    dir: dir,                     // expose dir for getting an array of files, subdirectories or both
    trace: consoleInfo,           // expose an info method to log output to the console in a readable/visible format
    page: [],                     // empty page objects placeholder
    shared: {},                   // empty shared objects placeholder
    log: log,                     // expose the log method for output to files for emailing
    envConfig: global.envConfig,  // expose the global environment configuration file for use when changing environment types (i.e. dev, test, preprod)
    downloader: global.downloader,// exposes the downloader for global usage
    request: rp,                  // exposes the request-promise for API testing
    date: date,                   // expose the date method for logs and reports
  };
  
/**
 *  expose properties to step definition methods via global variables
     */
  Object.keys(runtime).forEach(function (key){
    /** make property/method available as a global (no this. prefix required)
     */
    global[key] = runtime[key];
  });

  /**
   * import page objects (after global lets have been created)
   */
  if (global.pageObjectPath && fs.existsSync(global.pageObjectPath)){
    /**
     * require all page objects using camelcase as object names
     */
    runtime.page = requireDir(global.pageObjectPath, { camelcase: true });

    /**
     * expose globally
     * @type {{}}
     */
    global.page = runtime.page;
  }

  /**
   * import shared objects from multiple paths (after global lets have been created)
   */
  if (global.sharedObjectPaths && Array.isArray(global.sharedObjectPaths) && global.sharedObjectPaths.length > 0) {
    let allDirs = {};

    /**
     * first require directories into objects by directory
     */
    global.sharedObjectPaths.forEach(function (itemPath){
      if (fs.existsSync(itemPath)){
        let dir = requireDir(itemPath, { camelcase: true });
        merge(allDirs, dir);
      }
    });
    /** if we managed to import some directories, expose them
     */
    if (Object.keys(allDirs).length > 0){
      /** expose globally
       * @type {{}}
       */
      global.shared = allDirs;
    }
  }

  /**
   * add helpers
   */
  global.helpers = require('../runtime/helpers.js');

}

/**
 * export the "World" required by cucumber to allow it to expose methods within step def's
 */
module.exports = function () {
  this.World = World;

  /** set the default timeout for all tests
   */
  this.setDefaultTimeout(DEFAULT_TIMEOUT);

  /**
   * ALL CUCUMBER HOOKS
   */
  /**
   * create the driver before scenario if it's not instantiated
   */
  this.registerHandler('BeforeScenario', function (){
    if (!global.driver) {
      global.driver = getDriverInstance();
    }
    return driver;
  });
  
  /**
   * compile and generate a report at the END of the test run and send an Email
   */
  this.registerHandler('AfterFeatures', function (features, done) {
    if (global.reportsPath && fs.existsSync(global.reportsPath)) {
      let reportOptions = {
        theme: 'bootstrap',
        jsonFile: path.resolve(global.reportsPath, global.reportName + '-' + date + '.json'),
        output: path.resolve(global.reportsPath, global.reportName + '-' + date + '.html'),
        reportSuiteAsScenarios: true,
        launchReport: (!global.disableReport),
        ignoreBadJsonFile: true,
        metadata: {
          'Test Completion': (helpers.getCurrentDateTime()),
          'Test Environment': 'DEVELOPMENT',
          'Platform': 'AWS Debian 9',
          'Executed': 'Remote'
        },
        brandTitle: global.reportName + '-' + date,
        name: global.projectName
      };
      reporter.generate(reportOptions);
          return helpers.klassiEmail();
        }
      done();
    });
  
    /**
   *  executed after each scenario (always closes the browser to ensure fresh tests)
   */
  this.After(function(scenario){
    if(scenario.isFailed()) {
      /**
       * add a screenshot to the error report
       */
      return driver.saveScreenshot().then(function (screenShot) {
          scenario.attach(new Buffer(screenShot, 'base64'), 'image/png');
          return driver.pause(500).then(function () {
              return driver.end()
          })
      })
    }
       return driver.end();
  });
  
  
  
};
