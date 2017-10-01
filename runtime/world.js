'use strict';

/** world.js is loaded by the cucumber framework before loading the step definitions and feature files
 * it is responsible for setting up and exposing the driver / browser / expect / assert etc
 * required within each step definition
 */
let fs = require('fs-plus'),
    path = require('path'),
    requireDir = require('require-dir'),
    merge = require('merge'),
    chalk = require('chalk'),
    webdriverio = require('webdriverio'),
    phantomjs = require('phantomjs-prebuilt'),
    chrome = require('chromedriver'),
    firefox = require('geckodriver'),
    expect = require('chai').expect,
    assert = require("chai").assert,
    webdrivercss = require('webdrivercss-custom-v4-compatible'),
    reporter = require('cucumber-html-reporter');

global.DEFAULT_TIMEOUT = 30 * 1000; // 30 seconds default

let driver = {},
    screenWidth = []; //[752, 1008, 1280];

/** create the web browser based on global let set in index.js
 * @returns {{}}
 */
function getDriverInstance(){

    switch (browserName || '') {

        case 'firefox': {
            driver = new webdriverio.remote({
                desiredCapabilities: {
                    browserName: 'firefox',
                    javascriptEnabled: true,
                    acceptSslCerts: true,
                    'geckodriver.firefox.bin': firefox.path
                }
            }).init()
        }
            break;

        case 'phantomjs': {
            driver = new webdriverio.remote({
                desiredCapabilities: {
                    browseName: 'phantomjs',
                    javascriptEnabled: true,
                    acceptSslCerts: true,
                    'phantomjs.binary.path': phantomjs.path
                }
            }).init();
        }
            break;

        /**
         * default to chrome
         */
        default: {
            driver = webdriverio.remote({
                desiredCapabilities: {
                    browserName: 'chrome',
                    javascriptEnabled: true,
                    acceptSslCerts: true,
                    // chromeOptions: {
                    //     "args": ["start-maximized"]
                    // },
                    path: chrome.path
                }
            }).init();
        }
    }

    /** initialise WebdriverCSS for `driver` instance
     */
    webdrivercss.init(driver, {
        screenshotRoot: './cssImages/baseline/',
        failedComparisonsRoot: './cssImages/diffs/',
        misMatchTolerance: 1.15,
        screenWidth: screenWidth,
        updateBaseline: false
    });

    return driver;
}

function consoleInfo(){

    let args = [].slice.call(arguments),
        output = chalk.bgBlue.white('\n>>>>> \n' + args + '\n<<<<<\n');

    console.log(output);
}

/**
 * Wait function - measured in seconds for pauses during tests to give time for processes such as a page loading or the user to see what the test is doing
 * @param seconds
 */
function pause(seconds) {
    driver.pause(seconds * 1000);
    return driver;
}

function World(){
    /** create a list of letiables to expose globally and therefore accessible within each step definition
     * @type {{driver: null, webdriverio, webdrivercss: *, expect: *, assert: (*), trace: consoleInfo, pause: (*), page: {}, shared: {}}}
     */
    let runtime = {
        driver: null,               // the browser object
        webdriverio: webdriverio,   // the raw webdriverio driver module, providing access to static properties/methods
        webdrivercss: webdrivercss, // the raw webdrivercss driver function
        expect: expect,             // expose chai expect to allow variable testing
        assert: assert,             // expose chai assert to allow variable testing
        trace: consoleInfo,         // expose an info method to log output to the console in a readable/visible format
        pause: pause,              // expose pause to use seconds instead of milliseconds
        page: {},                   // empty page objects placeholder
        shared: {}                  // empty shared objects placeholder
    };

    /** expose properties to step definition methods via global letiables
     */
    Object.keys(runtime).forEach(function (key){
        /** make property/method avaiable as a global (no this. prefix required)
         */
        global[key] = runtime[key];
    });

    /** import page objects (after global lets have been created)
     */
    if (global.pageObjectPath && fs.existsSync(global.pageObjectPath)){

        /** require all page objects using camelcase as object names
         */
        runtime.page = requireDir(global.pageObjectPath, { camelcase: true });

        /** expose globally
         * @type {{}}
         */
        global.page = runtime.page;
    }

    /** import shared objects from multiple paths (after global lets have been created)
     */
    if (global.sharedObjectPaths && Array.isArray(global.sharedObjectPaths) && global.sharedObjectPaths.length > 0) {

        let allDirs = {};

        /** first require directories into objects by directory
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

    /** add helpers
     */
    global.helpers = require('../runtime/helpers.js');

}

/** export the "World" required by cucumber to allow it to expose methods within step def's
 */
module.exports = function (){

    this.World = World;

    /** set the default timeout for all tests
     */
    this.setDefaultTimeout(DEFAULT_TIMEOUT);

    /** create the driver before scenario if it's not instantiated
     */
    this.registerHandler('BeforeScenario', function(){

        if (!global.driver){

            global.driver = getDriverInstance();
            /** sets the broswer window size to maximum
             */
            // driver.windowHandleMaximize();
        }
        return driver;
    });

    /**  compile and generate a report at the end of the test run
     */
    this.registerHandler('AfterFeatures', function(features, done){

        if (global.reportsPath && fs.existsSync(global.reportsPath)){

            let reportOptions = {
                theme: 'bootstrap',
                jsonFile: path.resolve(global.reportsPath, 'cucumber-report.json'),
                output: path.resolve(global.reportsPath, 'cucumber-report.html'),
                reportSuiteAsScenarios: true,
                launchReport: true,
                ignoreBadJsonFile: true
            };
            reporter.generate(reportOptions)
        }
        done()
    });

    /** executed after each scenario (always closes the browser to ensure fresh tests)
     */
    this.After(function (scenario){
        if (scenario.isFailed()){
            /** add a screenshot to the error report
             */
            return driver.saveScreenshot().then(function (screenShot){
                scenario.attach(new Buffer(screenShot, 'base64'), 'image/png');
                return driver.end()
            })
        }
        else {
            return driver.end()
        }
    })

};

