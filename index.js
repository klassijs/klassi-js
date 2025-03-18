require('dotenv').config();

const fs = require('fs-extra');
const merge = require('merge');
const { Command } = require('commander');
const requireDir = require('require-dir');
const path = require('path');
const loadTextFile = require('text-files-loader');
const { cosmiconfigSync } = require('cosmiconfig');
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
const { runCucumber, loadConfiguration } = require('@cucumber/cucumber/api');
const { astellen } = require('klassijs-astellen');

const program = new Command();

const pjson = require('./package.json');
const takeReportBackup = require('./runtime/utils/takeReportBackup');

async function klassiCli() {
  try {
    const { runConfiguration } = await loadConfiguration();
    const { success } = await runCucumber(runConfiguration);
    return success;
  } catch (error) {
    console.error('Error in klassiCli:', error);
    process.exit(1);
  }
}

(async () => {
  // Dynamically import Chai (ESM)
  const chai = await import('chai');
  global.assert = chai.assert;
})();

global.fs = fs;

/**
 * Global timeout to be used in test code
 * @type {number}
 */
global.DELAY_100ms = 100;
global.DELAY_200ms = 200;
global.DELAY_300ms = 300;
global.DELAY_500ms = 500;
global.DELAY_750ms = 750;
global.DELAY_1s = 1000;
global.DELAY_2s = 2000;
global.DELAY_3s = 3000;
global.DELAY_5s = 5000;
global.DELAY_7s = 7000;
global.DELAY_8s = 8000;
global.DELAY_10s = 10000;
global.DELAY_15s = 15000;
global.DELAY_20s = 20000;
global.DELAY_30s = 30000;
global.DELAY_40s = 40000;
global.DELAY_1m = 60000;
global.DELAY_2m = 120000;
global.DELAY_3m = 180000;

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

global.projectRootPath = path.resolve(__dirname);

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
    'shared-objects',
  )
  .option('--pageObjects <paths>', 'path to page objects. defaults to ./page-objects', 'page-objects')
  .option('--reports <paths>', 'output path to save reports. defaults to ./reports', 'reports')
  .option('--headless', 'whether to run browser in headless mode. defaults to false', false)
  .option('--steps <paths>', 'path to step definitions. defaults to ./step_definitions', 'step_definitions')
  .option(
    '--tags <EXPRESSION>',
    'only execute the features or scenarios with tags matching the expression (repeatable)',
    collectPaths,
    [],
  )
  .option(
    '--exclude <EXPRESSION>',
    'excludes the features or scenarios with tags matching the expression (repeatable)',
    collectPaths,
    [],
  )
  .option('--baselineImageUpdate', 'automatically update the baseline image after a failed comparison', false)
  .option('--remoteService <optional>', 'which remote browser service, if any, should be used e.g. lambdatest', '')
  .option('--browserOpen', 'keep the browser open after each scenario. defaults to false', false)
  .option('--extraSettings <optional>', 'further piped configs split with pipes', '')
  .option('--dlink', 'the switch for projects with their test suite, within a Test folder of the repo', false)
  .option(
    '--dryRun',
    'the effect is that Cucumber will still do all the aggregation work of looking at your feature files, loading your support code etc but without actually executing the tests',
    false,
  )
  .option(
    '--s3Date',
    'this switches the s3 date to allow the downloading and emailing of reports from the latest test run and not last nights run',
    false,
  )
  .option('--useProxy', 'This is in-case you need to use the proxy server while testing', false)
  .option('--skipTag <EXPRESSION>', 'provide a tag and all tests marked with it will be skipped automatically')
  .option('--isCI', 'This is to stop the html from being created while running in the CI', false)
  .option('--reportBackup', 'This to clear the "reports" folder & keep the record in back-up folder', false)
  .option('--reportClear', 'This to clear the "reports" folder', false);

program.parse(process.argv);
const options = program.opts();

program.on('--help', () => {
  console.info('For more details please visit https://github.com/klassijs/klassi-js#readme\n');
});

const settings = {
  projectRoot: options.context,
  reportName: options.reportName,
  disableReport: options.disableReport,
  remoteService: options.remoteService,
  extraSettings: options.extraSettings,
  baselineImageUpdate: options.baselineImageUpdate,
};

global.settings = settings;
global.BROWSER_NAME = options.browser;
global.headless = options.headless;
global.browserOpen = options.browserOpen;
global.dryRun = options.dryRun;
global.email = options.email;
global.s3Date = options.s3Date;
global.useProxy = options.useProxy;
global.skipTag = options.skipTag;
global.isCI = options.isCI;

global.baselineImageUpdate = options.baselineImageUpdate;
global.browserName = global.remoteConfig || BROWSER_NAME;

astellen.set('BROWSER_NAME', options.browser);

const getConfig = (configName) => cosmiconfigSync(configName).search().config;
const { environment } = getConfig('envConfig');
const { dataConfig } = getConfig('dataConfig');

global.env = process.env.ENVIRONMENT || environment[options.env];
global.dataconfig = dataConfig;
global.s3Data = dataConfig.s3Data;
global.emailData = dataConfig.emailData;
global.projectName = process.env.PROJECT_NAME || dataConfig.projectName;
global.reportName = process.env.REPORT_NAME || 'Automated Report';
global.tagNames = dataConfig.tagNames;

const helpers = require('./runtime/helpers');
global.helpers = helpers;

global.date = helpers.currentDate();
global.dateTime = helpers.reportDateTime();

if (!global.isCI) {
  if (options.reportBackup) {
    takeReportBackup.backupReport();
  }
  if (options.reportClear) {
    takeReportBackup.clearReport();
  }
}

if (options.remoteService && options.extraSettings) {
  const additionalSettings = parseRemoteArguments(options.extraSettings);
  global.remoteConfig = additionalSettings.config;
  if (additionalSettings.tags) {
    if (options.tags.length !== 0) {
      throw new Error('Cannot set two types of tags - either use --extraSettings or --tags');
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
  featureFiles: getProjectPath('featureFiles'),
  sharedObjects: getProjectPath('sharedObjects'),
};

global.paths = paths;

const envName = env.envName.toLowerCase();
const reports = `./reports/${browserName}/${envName}`;

fs.ensureDirSync(reports, (err) => {
  if (err) {
    console.error(`The Reports Folder has NOT been created: ${err.stack}`);
  }
});
fs.ensureDirSync(reports + 'Combine', (err) => {
  if (err) {
    console.error(`The Reports Combine Folder has NOT been created: ${err.stack}`);
  }
});

const videoLib = path.resolve(__dirname, './runtime/getVideoLinks.js');
if (fs.existsSync(videoLib)) {
  global.videoLib = require(videoLib);
} else {
  console.error('No Video Lib');
}

let sharedObjects = {};
const sharedObjectsPath = path.resolve(paths.sharedObjects);
if (fs.existsSync(sharedObjectsPath)) {
  const allDirs = {};
  const dir = requireDir(sharedObjectsPath, { camelcase: true, recurse: true });
  sharedObjects = merge(allDirs, dir);
  global.sharedObjects = sharedObjects;
}

const pageObjectPath = path.resolve(paths.pageObjects);
if (fs.existsSync(pageObjectPath)) {
  global.pageObjects = requireDir(pageObjectPath, {
    camelcase: true,
    recurse: true,
  });
}

function getTagsFromFeatureFiles() {
  let result = [];
  let featurefiles = {};
  loadTextFile.setup({ matchRegExp: /\.feature/ });
  const featureFilesList = options.featureFiles.split(',');

  featureFilesList.forEach((feature) => {
    const filePath = path.resolve(feature);
    try {
      const fileContent = loadTextFile.loadSync(filePath);
      featurefiles = Object.assign(featurefiles, fileContent);
    } catch (error) {
      console.error(`Error loading feature file ${filePath}:`, error);
    }
  });

  Object.keys(featurefiles).forEach((key) => {
    const content = String(featurefiles[key] || '', ' ');
    const tags = content.match(new RegExp('@[a-z0-9]+', 'g')) || [];
    result = result.concat(tags);
  });
  return result;
}

if (!options.tags || options.tags.length === 0) {
  process.exit(1);
}
let resultingString = '';
if (options.tags.length > 0) {
  const tagsFound = getTagsFromFeatureFiles();
  const separateMultipleTags = options.tags[0].split(',');
  let separateExcludedTags;

  if (options.exclude && options.exclude.length >= 1) {
    separateExcludedTags = options.exclude[0].split(',');
  }

  const correctTags = [];
  const correctExcludedTags = [];

  for (const tag of separateMultipleTags) {
    if (tag[0] !== '@') {
      console.error('tags must start with a @');
      process.exit(1);
    }
    if (tagsFound.indexOf(tag) === -1) {
      console.error(`this tag ${tag} does not exist`);
      process.exit(0);
    }
    correctTags.push(tag);
  }

  if (correctTags.length === 0) {
    console.error('No valid tags found.');
    process.exit(1);
  }

  if (separateExcludedTags && separateExcludedTags.length >= 1) {
    for (const tag of separateExcludedTags) {
      if (tag[0] !== '@') {
        console.error('tags must start with a @');
        process.exit(1);
      }
      if (tagsFound.indexOf(tag) === -1) {
        console.error(`this tag ${tag} does not exist`);
        process.exit(0);
      }
      correctExcludedTags.push(tag);
    }
  }

  if (correctTags.length > 1) {
    resultingString = correctTags.join(' or ');
    if (correctExcludedTags.length > 0) {
      const excludedCommand = correctExcludedTags.join(' and not ');
      resultingString = `${resultingString} and not ${excludedCommand}`;
    }
  } else {
    resultingString = correctTags[0];
    if (correctExcludedTags.length > 0) {
      const excludedCommand = correctExcludedTags.join(' and not ');
      resultingString = `${resultingString} and not ${excludedCommand}`;
    }
  }

  global.resultingString = resultingString;
} else {
  console.error('No tags provided in options.');
  process.exit(1);
}

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

klassiCli().then(async (succeeded) => {
  let dryRun = false;
  if (dryRun === false) {
    if (!succeeded) {
      await cucumberCli().then(async () => {
        await process.exit(1);
      });
    } else {
      await cucumberCli().then(async () => {
        await browser.pause(DELAY_2s).then(async () => {
          console.info('Test run completed successfully');
          await process.exit(0);
        });
      });
    }
  }
});

async function cucumberCli() {
  let email = false;
  if (options.remoteService && options.remoteService === 'lambdatest' && resultingString !== '@s3load') {
    await browser.pause(DELAY_2s).then(async () => {
      await helpers.klassiReporter();
    });
  } else if (resultingString !== '@s3load') {
    await browser.pause(DELAY_2s).then(async () => {
      await helpers.klassiReporter();
    });
  }
  await browser.pause(DELAY_5s);
  if (email === true) {
    await browser.pause(DELAY_2s).then(async () => {
      await helpers.klassiEmail();
      await browser.pause(DELAY_3s);
    });
  }
}

module.exports = { getTagsFromFeatureFiles };
