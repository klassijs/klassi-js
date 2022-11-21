/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const fs = require("fs-extra");
const chalk = require("chalk");
const chai = require("chai");
const program = require("commander");
const merge = require("merge");
const requireDir = require("require-dir");
// let dir = require('node-dir');

const { After, AfterAll, AfterStep, Status } = require("@cucumber/cucumber");
const { Before, BeforeAll, BeforeStep } = require("@cucumber/cucumber");
const { Given, When, Then } = require("@cucumber/cucumber");
const s3Upload = require("./s3Upload");
const getRemote = require("./getRemote");

/**
 * all assertions for variable testing
 */
const { assert, expect } = chai;
const log = require("./logger").klassiLog();

global.assert = assert;
global.expect = expect;
global.fs = fs;
global.log = log;

/**
 * This is the Global date functionality
 */
global.date = require("./helpers").currentDate();

/**
 * for the Download of all file types
 */
global.downloader = require("./downloader");

/**
 * Environment variables
 * @type {*|(function(): browser)}
 */
const ChromeDriver = require("./chromeDriver");
const FirefoxDriver = require("./firefoxDriver");
const AndroidDriver = require("./androidDriver");
const iOSDriver = require("./iosDriver");

const LambdaTestDriver = require("./lambdatestDriver");

const remoteService = getRemote(global.settings.remoteService);

let browser = {};

/**
 * create the web browser based on global let set in index.js
 * @returns {{}}
 */
async function getDriverInstance() {
  const browsers = global.settings.BROWSER_NAME;
  const options = {};
  if (remoteService && remoteService.type === "lambdatest") {
    const configType = global.settings.remoteConfig;
    assert.isString(
      configType,
      "LambdaTest requires a config type e.g. chrome.json"
    );
    browser = LambdaTestDriver(options, configType);
    return browser;
  }
  assert.isNotEmpty(browsers, "Browser must be defined");

  switch (browsers || "") {
    case "firefox":
      {
        browser = FirefoxDriver(options);
      }
      break;

    case "chrome":
      {
        browser = ChromeDriver(options);
      }
      break;

    case "android":
      {
        browser = AndroidDriver(options);
      }
      break;

    case "ios":
      {
        browser = iOSDriver(options);
      }
      break;

    default: {
      browser = ChromeDriver(options);
    }
  }
  return browser;
}

/**
 * Global timeout
 * @type {number}
 */
global.DELAY_100ms = 100; // 100 millisecond delay
global.DELAY_200ms = 200; // 200 millisecond delay
global.DELAY_300ms = 300; // 300 millisecond delay
global.DELAY_500ms = 500; // 500 millisecond delay
global.DELAY_7500ms = 7500; // 7500 milliseconds delay
global.DELAY_1s = 1000; // 1 second delay
global.DELAY_2s = 2000; // 2 second delay
global.DELAY_3s = 3000; // 3 second delay
global.DELAY_5s = 5000; // 5 second delay
global.DELAY_7s = 7000; // 7 second delay
global.DELAY_8s = 8000; // 8 seconds delay
global.DELAY_10s = 10000; // 10 second delay
global.DELAY_15s = 15000; // 15 second delay
global.DELAY_20s = 20000; // 20 second delay
global.DELAY_30s = 30000; // 30 second delay
global.DELAY_40s = 40000; // 40 second delay
global.DELAY_1m = 60000; // 1 minute delay
global.DELAY_2m = 120000; // 2 minutes delay
global.DELAY_3m = 180000; // 3 minutes delay
global.DELAY_5m = 300000; // 5 minutes delay

function consoleInfo() {
  // eslint-disable-next-line prefer-rest-params
  const args = [].slice.call(arguments);
  const output = chalk.bgBlue.white(`\n>>>>> \n${args}\n<<<<<\n`);
  console.log(output);
}

/**
 * All Cucumber Global variables
 * @constructor
 */
global.Given = Given;
global.When = When;
global.Then = Then;
global.After = After;
global.AfterAll = AfterAll;
global.AfterStep = AfterStep;
global.Before = Before;
global.BeforeAll = BeforeAll;
global.BeforeStep = BeforeStep;
global.Status = Status;

function World() {
  /**
   * create a list of variables to expose globally and therefore accessible within each step definition
   * @type {{date: (value?: string) => object, expect: *, shared: {}, trace: consoleInfo, log: log.RootLogger | log, assert: *, page: *[], gotApi: *, dir: {readFiles?: (function(String, Object, *=, *=): void)|{}, readFilesStream?: (function(String, Object, *=, *=): void)|{}}, fs: {rename(oldPath: PathLike, newPath: PathLike): Promise<void>, lchmod(path: PathLike, mode: Mode): Promise<void>, readdir: {(path: PathLike, options?: ((ObjectEncodingOptions & {withFileTypes?: false | undefined}) | BufferEncoding | null)): Promise<string[]>, (path: PathLike, options: ({encoding: "buffer", withFileTypes?: false | undefined} | "buffer")): Promise<Buffer[]>, (path: PathLike, options?: ((ObjectEncodingOptions & {withFileTypes?: false | undefined}) | BufferEncoding | null)): Promise<string[] | Buffer[]>, (path: PathLike, options: (ObjectEncodingOptions & {withFileTypes: true})): Promise<Dirent[]>}, realpath: {(path: PathLike, options?: (ObjectEncodingOptions | BufferEncoding | null)): Promise<string>, (path: PathLike, options: BufferEncodingOption): Promise<Buffer>, (path: PathLike, options?: (ObjectEncodingOptions | BufferEncoding | null)): Promise<string | Buffer>}, FileReadOptions: FileReadOptions, opendir(path: string, options?: OpenDirOptions): Promise<Dir>, symlink(target: PathLike, path: PathLike, type?: (string | null)): Promise<void>, link(existingPath: PathLike, newPath: PathLike): Promise<void>, lchown(path: PathLike, uid: number, gid: number): Promise<void>, open(path: PathLike, flags: (string | number), mode?: Mode): Promise<FileHandle>, chown(path: PathLike, uid: number, gid: number): Promise<void>, FileReadResult: FileReadResult, readFile: {(path: (PathLike | FileHandle), options?: (({encoding?: null | undefined, flag?: OpenMode | undefined} & Abortable) | null)): Promise<Buffer>, (path: (PathLike | FileHandle), options: (({encoding: BufferEncoding, flag?: OpenMode | undefined} & Abortable) | BufferEncoding)): Promise<string>, (path: (PathLike | FileHandle), options?: ((ObjectEncodingOptions & Abortable & {flag?: OpenMode | undefined}) | BufferEncoding | null)): Promise<string | Buffer>}, readlink: {(path: PathLike, options?: (ObjectEncodingOptions | BufferEncoding | null)): Promise<string>, (path: PathLike, options: BufferEncodingOption): Promise<Buffer>, (path: PathLike, options?: (ObjectEncodingOptions | string | null)): Promise<string | Buffer>}, utimes(path: PathLike, atime: (string | number | Date), mtime: (string | number | Date)): Promise<void>, mkdir: {(path: PathLike, options: (MakeDirectoryOptions & {recursive: true})): Promise<string | undefined>, (path: PathLike, options?: (Mode | (MakeDirectoryOptions & {recursive?: false | undefined}) | null)): Promise<void>, (path: PathLike, options?: (Mode | MakeDirectoryOptions | null)): Promise<string | undefined>}, watch: {(filename: PathLike, options: ((WatchOptions & {encoding: "buffer"}) | "buffer")): AsyncIterable<Buffer>, (filename: PathLike, options?: (WatchOptions | BufferEncoding)): AsyncIterable<string>, (filename: PathLike, options: (WatchOptions | string)): (AsyncIterable<string> | AsyncIterable<Buffer>)}, appendFile(path: (PathLike | FileHandle), data: (string | Uint8Array), options?: ((ObjectEncodingOptions & FlagAndOpenMode) | BufferEncoding | null)): Promise<void>, access(path: PathLike, mode?: number): Promise<void>, copyFile(src: PathLike, dest: PathLike, mode?: number): Promise<void>, lstat: {(path: PathLike, opts?: (StatOptions & {bigint?: false | undefined})): Promise<Stats>, (path: PathLike, opts: (StatOptions & {bigint: true})): Promise<BigIntStats>, (path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>}, unlink(path: PathLike): Promise<void>, stat: {(path: PathLike, opts?: (StatOptions & {bigint?: false | undefined})): Promise<Stats>, (path: PathLike, opts: (StatOptions & {bigint: true})): Promise<BigIntStats>, (path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>}, truncate(path: PathLike, len?: number): Promise<void>, writeFile(file: (PathLike | FileHandle), data: (string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream), options?: ((ObjectEncodingOptions & {mode?: Mode | undefined, flag?: OpenMode | undefined} & Abortable) | BufferEncoding | null)): Promise<void>, lutimes(path: PathLike, atime: (string | number | Date), mtime: (string | number | Date)): Promise<void>, rm(path: PathLike, options?: RmOptions): Promise<void>, FileHandle: FileHandle, mkdtemp: {(prefix: string, options?: (ObjectEncodingOptions | BufferEncoding | null)): Promise<string>, (prefix: string, options: BufferEncodingOption): Promise<Buffer>, (prefix: string, options?: (ObjectEncodingOptions | BufferEncoding | null)): Promise<string | Buffer>}, chmod(path: PathLike, mode: Mode): Promise<void>, FlagAndOpenMode: FlagAndOpenMode, rmdir(path: PathLike, options?: RmDirOptions): Promise<void>}, downloader: *}}
   */
  const runtime = {
    expect: global.expect, // expose chai expect to allow variable testing
    assert: global.assert, // expose chai assert to allow variable testing
    fs: global.fs, // expose fs (file system) for use globally
    dir, // expose dir for getting an array of files, subdirectories or both
    // eslint-disable-next-line max-len
    trace: consoleInfo, // expose an info method to log output to the console in a readable/visible format
    page: [], // empty page objects placeholder
    shared: {}, // empty shared objects placeholder
    log: global.log, // expose the log method for output to files for emailing
    downloader: global.downloader, // exposes the downloader for global usage
    gotApi: global.gotApi, // exposes GOT for API testing
    date: global.date, // expose the date method for logs and reports
    // After: global.After,
    // AfterAll: global.AfterAll,
    // AfterStep: global.AfterStep,
    // Before: global.Before,
    // BeforeAll: global.BeforeAll,
    // BeforeStep: global.BeforeStep,
  };

  /**
   *  expose properties to step definition methods via global variables
   */
  Object.keys(runtime).forEach((key) => {
    /** make property/method available as a global (no this. prefix required)
     */
    global[key] = runtime[key];
  });
  /**
   * import page objects (after global lets have been created)
   */
  if (global.paths.pageObjects && fs.existsSync(global.paths.pageObjects)) {
    /** require all page objects using camelcase as object names
     */
    runtime.page = requireDir(global.paths.pageObjects, { camelcase: true });
    /**
     * expose globally
     * @type {{}}
     */
    global.page = runtime.page;
  }
  /**
   * import shared objects from multiple paths (after global lets have been created)
   */
  if (
    global.paths.sharedObjects &&
    Array.isArray(global.paths.sharedObjects) &&
    global.paths.sharedObjects.length > 0
  ) {
    const allDirs = {};
    /**
     * first require directories into objects by directory
     */
    global.paths.sharedObjects.forEach((itemPath) => {
      if (fs.existsSync(itemPath)) {
        const dir = requireDir(itemPath, { camelcase: true });
        merge(allDirs, dir);
      }
    });
    /** if we managed to import some directories, expose them
     */
    if (Object.keys(allDirs).length > 0) {
      /** expose globally
       * @type {{}}
       */
      global.shared = allDirs;
    }
  }
}

/**
 * export the 'World' required by cucumber to allow it to expose methods within step def's
 */
this.World = World;

/**
 * set the default timeout for all tests
 */
// eslint-disable-next-line import/order,import/no-extraneous-dependencies
const { setDefaultTimeout } = require("@cucumber/cucumber");

const globalTimeout = process.env.CUCUMBER_TIMEOUT || 180000;
setDefaultTimeout(globalTimeout);
global.timeout = globalTimeout;

/**
 * start recording of the Test run time
 */
global.startDateTime = require("./helpers").getStartDateTime();

/**
 * create the browser before scenario if it's not instantiated and
 * also exposing the world object in global variable 'cucumberThis' so that
 * it can be used in arrow functions
 */
// eslint-disable-next-line func-names
Before(function () {
  global.cucumberThis = this;
  global.browser = getDriverInstance();
  return browser;
});

global.status = 0;

/**
 * executed before each scenario
 */
Before(async (scenario) => {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  if (remoteService && remoteService.type === "lambdatest") {
    await browser.execute(`lambda-name=${scenario.pickle.name}`);
  }
});

/**
 * compile and generate a report at the END of the test run to be send by Email
 * send email with the report to stakeholders after test run
 */
AfterAll(async () => {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  // eslint-disable-next-line no-undef
  await helpers.klassiReporter();
  try {
    browser.pause(DELAY_5s);
    if (
      remoteService &&
      remoteService.type === "lambdatest" &&
      program.opts().email
    ) {
      browser.pause(DELAY_5s).then(async () => {
        await s3Upload.s3Upload();
        browser.pause(DELAY_30s).then(() => {
          process.exit(global.status);
        });
      });
    } else if (remoteService && remoteService.type === "lambdatest") {
      browser.pause(DELAY_5s).then(async () => {
        process.exit(global.status);
      });
    } else if (program.opts().email) {
      browser.pause(DELAY_5s).then(async () => {
        await helpers.klassiEmail();
        browser.pause(DELAY_3s);
      });
    }
  } catch (err) {
    console.log(err.message);
  }
});

/**
 * LambdaTest Only
 * executed ONLY on failure of a scenario to get the video link
 * from lambdatest when it fails for the report
 */
After(async (scenario) => {
  // eslint-disable-next-line no-shadow
  if (
    scenario.result.status === Status.FAILED &&
    remoteService &&
    remoteService.type === "lambdatest"
  ) {
    await helpers.ltVideo();
    // eslint-disable-next-line no-undef
    const vidLink = await videoLib.getVideoId();
    // eslint-disable-next-line no-undef
    cucumberThis.attach(
      `video:\n <video width='320' height='240' controls autoplay> <source src=${vidLink} type=video/mp4> </video>`
    );
  }
});

/**
 * This is to control closing the browser or keeping it open after each scenario
 * @returns {Promise<void|Request<LexRuntime.DeleteSessionResponse, AWSError>|Request<LexRuntimeV2.DeleteSessionResponse, AWSError>>}
 */
// eslint-disable-next-line func-names
this.closebrowser = function () {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  switch (global.closeBrowser) {
    case "no":
      return Promise.resolve();
    default:
      if (browser) {
        return browser.deleteSession();
      }
      return Promise.resolve();
  }
};

/**
 * executed after each scenario - always closes the browser to ensure clean browser not cached)
 */
After(async (scenario) => {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  if (
    scenario.result.status === Status.FAILED ||
    scenario.result.status === Status.PASSED
  ) {
    if (remoteService && remoteService.type === "lambdatest") {
      if (scenario.result.status === "FAILED") {
        await browser.execute("lambda-status=failed");
      } else if (scenario.result.status === Status.PASSED) {
        await browser.execute("lambda-status=passed");
      }
      return this.closebrowser();
    }
  }
  return this.closebrowser();
});

/**
 * get executed only if there is an error within a scenario
 */
// eslint-disable-next-line consistent-return,func-names
After(function (scenario) {
  // eslint-disable-next-line no-shadow
  const { browser } = global;
  const world = this;
  if (scenario.result.status === Status.FAILED) {
    global.status = 1;
    return browser.takeScreenshot().then((screenShot) => {
      // screenShot is a base-64 encoded PNG
      world.attach(screenShot, "image/png");
    });
  }
});
