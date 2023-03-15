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
const loadTextFile = require('text-files-loader');
const { cosmiconfigSync } = require('cosmiconfig');
const { execSync } = require('child_process');
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

const s3Upload = require('./runtime/s3Upload');
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
  .option('--email', 'email for sending reports to stakeholders', false)
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
  .option('--coverage <paths>', 'output path to save nyc reports. defaults to ./coverage', 'coverage')
  .option('--steps <paths>', 'path to step definitions. defaults to ./step_definitions', 'step_definitions')
  .option(
    '--tags <EXPRESSION>',
    'only execute the features or scenarios with tags matching the expression (repeatable)',
    collectPaths,
    []
  )
  .option(
    '--exclude <EXPRESSION>',
    'excludes the features or scenarios with tags matching the expression (repeatable)',
    collectPaths,
    []
  )
  .option('--updateBaselineImage', 'automatically update the baseline image after a failed comparison')
  .option('--remoteService <optional>', 'which remote browser service, if any, should be used e.g. lambdatest', '')
  .option('--browserOpen', 'keep the browser open after each scenario. defaults to false', false)
  .option('--extraSettings <optional>', 'further piped configs split with pipes', '')
  .option('--wdProtocol', 'the switch to change the browser option from devtools to webdriver', false)
  .option('--dlink', 'the switch for projects with their test suite, within a Test folder of the repo', false)
  .option('--utam', 'used to launch the compilation process of UTAM test files into scripts.', false)
  .option(
    '--dryRun',
    'the effect is that Cucumber will still do all the aggregation work of looking at your feature files, loading your support code etc but without actually executing the tests',
    false
  )
  .option(
    '--s3Date',
    'this switches the s3 date to allow the downloading and emailing of reports from the latest test run and not last nights run',
    false
  )
  .option('--useProxy', 'This is in-case you need to use the proxy server while testing', false)
  .option('--skipTag <EXPRESSION>', 'provide a tag and all tests marked with it will be skipped automatically')
  .parse(process.argv);

program.on('--help', () => {
  console.log('For more details please visit https://github.com/larryg01/klassi-js#readme\n');
});

const options = program.opts();

const settings = {
  projectRoot: options.context,
  reportName: options.reportName,
  disableReport: options.disableReport,
  updateBaselineImage: options.updateBaselineImage,
  remoteService: options.remoteService,
  extraSettings: options.extraSettings,
};

global.settings = settings;
global.BROWSER_NAME = options.browser;
global.headless = options.headless;
global.browserOpen = options.browserOpen;
global.dryRun = options.dryRun;
global.email = options.email;
global.s3Date = options.s3Date;
global.utam = options.utam;
global.useProxy = options.useProxy;
global.skipTag = options.skipTag;

/**
 * Setting envConfig and dataConfig to be global, used within the world.js when building browser
 * @type {string}
 */
const getConfig = (configName) => cosmiconfigSync(configName).search().config;
const { environment } = getConfig('envConfig');
const { dataConfig } = getConfig('dataConfig');
// console.log('This is the result of search ====>', environment, dataConfig);

global.dataconfig = dataConfig;
global.s3Data = dataConfig.s3Data;
global.emailData = dataConfig.emailData;
global.projectName = process.env.PROJECT_NAME || dataConfig.projectName;
global.reportName = process.env.REPORT_NAME || 'Automated Report';
global.env = process.env.ENVIRONMENT || environment[options.env];

/** adding global helpers */
const helpers = require('./runtime/helpers');
global.helpers = helpers;

global.date = helpers.currentDate();
global.dateTime = helpers.reportDateTime();

/** Use the --utam config to compile the UTAM test files and generate the .JS files. */
if (utam) {
  const filePath =
    projectName === 'klassi-js' ? './runtime/utam.config.js' : './node_modules/klassi-js/runtime/utam.config.js';
  const utamConfig = require(path.resolve(filePath));
  fs.rmSync(path.resolve(__dirname, utamConfig.pageObjectsOutputDir), { recursive: true, force: true });
  execSync(`yarn run utam -c ${filePath}`, (err, stdout, stderr) => {
    if (err) console.error(err);
    if (stderr) console.error(stderr);
    console.log(stdout);
  });
}

if (options.remoteService && options.extraSettings) {
  const additionalSettings = parseRemoteArguments(options.extraSettings);
  settings.remoteConfig = additionalSettings.config;
  if (additionalSettings.tags) {
    if (options.tags.length !== 0) {
      throw new Error('Cannot sent two types of tags - either use --extraSettings or --tags');
    }
    options.tags = [additionalSettings.tags];
  }
}

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
 * Adding Global browser folder
 * Adding Accessibility folder at project level
 */
global.browserName = settings.remoteConfig || BROWSER_NAME;

const envName = env.envName.toLowerCase();
const reports = `./reports/${browserName}/${envName}`;

/** file creation for userAgent globally */
const file = './shared-objects/docs/userAgent.txt';

fs.ensureFileSync(file, (err) => {
  if (err) {
    console.error(`The fileName has NOT been created: ${err.stack}`);
  }
});
fs.ensureDirSync(reports, (err) => {
  if (err) {
    console.error(`The Reports Folder has NOT been created: ${err.stack}`);
  }
});

/** adding global accessibility library */
const accessibility_lib = path.resolve(__dirname, './runtime/accessibility/accessibilityLib.js');
if (fs.existsSync(accessibility_lib)) {
  const rList = [];
  global.accessibilityLib = require(accessibility_lib);
  global.accessibilityReportList = rList;
} else console.error('No Accessibility Lib');

/**
 * adding video link access
 * @type {string}
 */
const videoLib = path.resolve(__dirname, './runtime/getVideoLinks.js');
if (fs.existsSync(videoLib)) {
  global.videoLib = require(videoLib);
} else {
  console.error('No Video Lib');
}

/**
 * add path to import shared objects
 * @type {string}
 */
const sharedObjectsPath = path.resolve(paths.sharedObjects);
if (fs.existsSync(sharedObjectsPath)) {
  const allDirs = {};
  const dir = requireDir(sharedObjectsPath, { camelcase: true, recurse: true });
  merge(allDirs, dir);
  if (Object.keys(allDirs).length > 0) {
    global.sharedObjects = allDirs;
  }
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

/** Get tags from feature files
 * @returns {Array<string>} list of all tags found
 */
function getTagsFromFeatureFiles() {
  let result = [];
  let featurefiles = {};
  loadTextFile.setup({ matchRegExp: /\.feature/ });
  const featureFilesList = options.featureFiles.split(',');
  featureFilesList.forEach((feature) => {
    featurefiles = Object.assign(featurefiles, loadTextFile.loadSync(path.resolve(feature)));
  });

  Object.keys(featurefiles).forEach((key) => {
    const content = String(featurefiles[key] || '', ' ');
    result = result.concat(content.match(new RegExp('@[a-z0-9]+', 'g')));
  });
  return result;
}

global.getTagsFromFeatureFiles = getTagsFromFeatureFiles();

/**
 * verify the correct tags for scenarios to run
 * ignores non existing tags
 */
if (options.tags.length > 0) {
  const tagsFound = global.getTagsFromFeatureFiles;
  const separateMultipleTags = options.tags[0].split(',');
  let separateExcludedTags;

  if (options.exclude.length >= 1) {
    separateExcludedTags = options.exclude[0].split(',');
  }

  const correctTags = [];
  const correctExcludedTags = [];

  for (const tag of separateMultipleTags) {
    if (tag[0] !== '@') {
      console.error('tags must start with a @');
      continue;
    }
    if (tagsFound.indexOf(tag) === -1) {
      console.error(`this tag ${tag} does not exist`);
      continue;
    }
    correctTags.push(tag);
  }
  if (correctTags.length === 0) {
    process.exit();
  }
  if (separateExcludedTags && separateExcludedTags.length >= 1) {
    for (const tag of separateExcludedTags) {
      if (tag[0] !== '@') {
        console.error('tags must start with a @');
        continue;
      }
      if (tagsFound.indexOf(tag) === -1) {
        console.error(`this tag ${tag} does not exist`);
        continue;
      }
      correctExcludedTags.push(tag);
    }
  }

  let resultingString;

  if (correctTags.length > 1) {
    const multipleTagsCommand = correctTags.reduce((acc, currentTag) => {
      resultingString = `${acc} or ${currentTag}`;
    });

    if (correctExcludedTags.length >= 1) {
      const excludedCommand = correctExcludedTags.reduce((acc, currentTag) => {
        resultingString = `${acc} and not ${currentTag}`;
      });

      resultingString = `${multipleTagsCommand} and not ${excludedCommand}`;
    }

    global.resultingString = resultingString;
  } else {
    switch (correctExcludedTags.length) {
      case 0: {
        resultingString = correctTags[0];
        break;
      }

      case 1: {
        resultingString = `${correctTags[0]} and not ${correctExcludedTags[0]}`;
        break;
      }

      default: {
        const excludedCommand = correctExcludedTags.reduce((acc, currentTag) => {
          resultingString = `${acc} and not ${currentTag}`;
        });
        resultingString = `${correctTags[0]} and not ${excludedCommand}`;
        break;
      }
    }
    global.resultingString = resultingString;
  }
}

/** specify the feature files folder (this must be the first argument for Cucumber)
 specify the feature files to be executed */
if (options.featureFiles) {
  const splitFeatureFiles = options.featureFiles.split(',');
  global.featureFiles = splitFeatureFiles;
}

// TODO: look into using multi args at commandline for browser i.e --browser chrome,firefox
/** Add split to run multiple browsers from the command line */
if (options.browsers) {
  const splitBrowsers = options.browser.split(',');
  splitBrowsers.forEach((browser) => {
    process.argv.push('--browser', browser);
  });
  process.argv.push('--browser', browser);
}

/** execute cucumber Cli */
klassiCli().then(async (succeeded) => {
  if (dryRun === false) {
    if (!succeeded) {
      await module.exports.cucumberCli().then(async () => {
        await process.exit(3);
      });
    } else {
      await module.exports.cucumberCli();
    }
  }
});

async function cucumberCli() {
  await helpers.klassiReporter().then(async () => {
    await browser.pause(DELAY_5s);
    /**
     * compile and generate a report at the END of the test run to be send by Email
     * send email with the report to stakeholders after test run
     */
    if (options.remoteService && options.remoteService === 'lambdatest' && email === true) {
      await browser.pause(DELAY_3s).then(async () => {
        await s3Upload.s3Upload();
        await browser.pause(DELAY_30s);
      });
    } else if (email === true) {
      await browser.pause(DELAY_5s).then(async () => {
        await helpers.klassiEmail();
        await browser.pause(DELAY_3s);
      });
    }
  });
}

module.exports = { cucumberCli };
