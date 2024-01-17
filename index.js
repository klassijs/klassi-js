/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
require('dotenv').config();
const path = require('path');
const program = require('commander');
const fs = require('fs-extra');
const merge = require('merge');
const requireDir = require('require-dir');
const { assert, expect } = require('chai');
const { cosmiconfigSync } = require('cosmiconfig');
const { runCucumber, loadConfiguration } = require('@cucumber/cucumber/api');
const {
  After,
  AfterAll,
  AfterStep,
  Status,
  Before,
  BeforeAll,
  BeforeStep,
  Given,
  When,
  Then,
} = require('@cucumber/cucumber');

const pjson = require('./package.json');

async function klassiCli() {
  const { runConfiguration } = await loadConfiguration();
  const { success } = await runCucumber(runConfiguration);
  return success;
}

/**
 * all assertions for variable testing
 */
global.assert = assert;
global.expect = expect;
global.fs = fs;

/**
 * Global timeout to be used in test code
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

global.projectRootPath = __dirname;

function collectPaths(value, paths) {
  paths.push(value);
  return paths;
}

function parseRemoteArguments(argumentString) {
  if (!argumentString) {
    throw new Error('Expected an argumentString');
  }
  const argSplit = argumentString.split('/');
  const CONFIG = 0;
  const TAGS = 1;
  return {
    config: argSplit[CONFIG],
    tags: argSplit[TAGS],
  };
}

program
  .version(pjson.version)
  .description(pjson.description)
  .option('--browser <name>', 'name of browser to use (chrome, firefox). defaults to chrome', 'chrome')
  .option('--context <paths>', 'contextual root path for project-specific features, steps, objects etc', './')
  .option('--disableReport', 'Disables the auto opening of the test report in the browser. defaults to true')
  .option('--featureFiles <paths>', 'comma-separated list of feature files to run defaults to ./features', 'features')
  .option('--reportName <optional>', 'basename for report files e.g. use report for report.json'.reportName)
  .option('--env <paths>', 'name of environment to run the framework / test in. default to test', 'test')
  .option(
    '--sharedObjects <paths>',
    'path to shared objects (repeatable). defaults to ./shared-objects',
    'shared-objects'
  )
  .option('--pageObjects <paths>', 'path to page objects. defaults to ./page-objects', 'page-objects')
  .option('--reports <paths>', 'output path to save reports. defaults to ./reports', 'reports')
  .option('--headless', 'whether to run browser in headless mode. defaults to false', false)
  .option('--steps <paths>', 'path to step definitions. defaults to ./step_definitions', 'step_definitions')
  .option(
    '--tags <EXPRESSION>',
    'only execute the features or scenarios with tags matching the expression (repeatable)',
    collectPaths,
    []
  )
  .option('--browserOpen', 'keep the browser open after each scenario. defaults to false', false)
  .option('--wdProtocol', 'the switch to change the browser option from devtools to webdriver', false)
  .option('--dlink', 'the switch for projects with their test suite, within a Test folder of the repo', false)
  .parse(process.argv);

program.on('--help', () => {
  console.info('For more details please visit https://github.com/klassijs/klassi-js#readme\n');
});

const options = program.opts();

const settings = {
  projectRoot: options.context,
  reportName: options.reportName,
  disableReport: options.disableReport
};

global.settings = settings;
global.BROWSER_NAME = options.browser;
global.headless = options.headless;
global.browserOpen = options.browserOpen;
/**
 * Setting envConfig and dataConfig to be global, used within the world.js when building browser
 * @type {string}
 */
const getConfig = (configName) => cosmiconfigSync(configName).search().config;
const { environment } = getConfig('envConfig');
const { dataConfig } = getConfig('dataConfig');

global.dataconfig = dataConfig;
global.projectName = process.env.PROJECT_NAME || dataConfig.projectName;
global.reportName = process.env.REPORT_NAME || 'Automated Report';
global.env = process.env.ENVIRONMENT || environment[options.env];
/** adding global helpers */
const helpers = require('./runtime/helpers');
global.helpers = helpers;

global.date = helpers.currentDate();
global.dateTime = helpers.reportDateTime();

function getProjectPath(objectName) {
  return path.resolve(settings.projectRoot + options[objectName]);
}

const paths = {
  pageObjects: getProjectPath('pageObjects'),
  reports: getProjectPath('reports'),
  coverage: getProjectPath('coverage'),
  featureFiles: getProjectPath('featureFiles'),
  sharedObjects: getProjectPath('sharedObjects'),
};

/** expose settings and paths for global use */
global.paths = paths;

/**
 * Adding Global browser
 * Adding Accessibility folder at project level
 */
global.browserName = settings.remoteConfig || BROWSER_NAME;

const envName = env.envName.toLowerCase();
const reports = `./reports/${browserName}/${envName}`;

fs.ensureDirSync(reports, (err) => {
  if (err) {
    console.error(`The Reports Folder has NOT been created: ${err.stack}`);
  }
});

/**
 * add path to import shared objects
 * @type {string}
 */
const sharedObjectsPath = path.resolve(paths.sharedObjects);
if (fs.existsSync(sharedObjectsPath)) {
  const allDirs = {};
  const dir = requireDir(sharedObjectsPath, { camelcase: true, recurse: true });
  sharedObjects = merge(allDirs, dir);
  global.sharedObjects = sharedObjects;
}

/**
 * add path to import page objects
 * @type {string}
 */
const pageObjectPath = path.resolve(paths.pageObjects);
if (fs.existsSync(pageObjectPath)) {
  global.pageObjects = requireDir(pageObjectPath, {
    camelcase: true,
    recurse: true,
  });
}

/** specify the feature files folder (this must be the first argument for Cucumber)
 specify the feature files to be executed */
if (options.featureFiles) {
  const splitFeatureFiles = options.featureFiles.split(',');
  global.featureFiles = splitFeatureFiles;
}

// TODO: look into using multi args at commandline for browser i.e --browser chrome,firefox
/** Add split to run multiple browsers from the command line */
if (options.browser) {
  const splitBrowsers = options.browser.split(',');
  splitBrowsers.forEach((browser) => {
    process.argv.push('--browser', browser);
  });
}

/** execute cucumber Cli */
klassiCli().then(async (succeeded) => {
   await module.exports.cucumberCli();
});

async function cucumberCli() {
    await browser.pause(DELAY_2s).then(async () => {
      await helpers.klassiReporter();
    });
  await browser.pause(DELAY_3s);
}

module.exports = { cucumberCli };
