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
const path = require('path');
const { Command } = require('commander');
const fs = require('fs-extra');
const merge = require('merge');
const requireDir = require('require-dir');
const loadTextFile = require('text-files-loader');
const { cosmiconfigSync } = require('cosmiconfig');

// eslint-disable-next-line global-require
const klassiCli = new (require('@cucumber/cucumber').Cli)({
  argv: process.argv,
  cwd: process.cwd(),
  stdout: process.stdout,
});
const pjson = require('./package.json');

const program = new Command();

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
  .option('--email', 'email for sending reports to stakeholders')
  .option('--featureFiles <paths>', 'comma-separated list of feature files to run defaults to ./features', 'features')
  .option('--reportName <optional>', 'basename for report files e.g. use report for report.json', global.reportName)
  .option('--env <paths>', 'name of environment to run the framework / test in. default to test', 'test')
  .option(
    '--sharedObjects <paths>',
    'path to shared objects (repeatable). defaults to ./shared-objects',
    'shared-objects'
  )
  .option('--pageObjects <paths>', 'path to page objects. defaults to ./page-objects', 'page-objects')
  .option('--reports <paths>', 'output path to save reports. defaults to ./reports', 'reports')
  .option('--steps <paths>', 'path to step definitions. defaults to ./step_definitions', 'step_definitions')
  .option(
    '--tags <EXPRESSION>',
    'only execute the features or scenarios with tags matching the expression (repeatable)',
    collectPaths,
    []
  )
  .option('--updateBaselineImage', 'automatically update the baseline image after a failed comparison')
  .option('--remoteService <optional>', 'which remote browser service, if any, should be used e.g. lambdatest', '')
  .option(
    '--closeBrowser <optional>',
    'close the browser after each scenario (always, no). defaults to always',
    'always'
  )
  .option('--extraSettings <optional>', 'further piped configs split with pipes', '')
  .option('--wdProtocol', 'the switch to change the browser option from devtools to webdriver')
  .parse(process.argv);

program.on('--help', () => {
  console.log('For more details please visit https://github.com/larryg01/klassi-js#readme\n');
});

const options = program.opts();

const settings = {
  projectRoot: options.context,
  reportName: options.reportName,
  BROWSER_NAME: options.browser,
  disableReport: options.disableReport,
  closeBrowser: options.closeBrowser,
  updateBaselineImage: options.updateBaselineImage,
  remoteService: options.remoteService,
};

/**
 * Setting envConfig to be global, used within the world.js when building browser
 * @type {string}
 */
// add line to call dotenv
const moduleName = process.env.ENV_CONFIG || 'envConfig'; // name of the rc.js file for global variables
const explorerSync = cosmiconfigSync(moduleName);
const searchedFor = explorerSync.search();
const envConfig = searchedFor.config;
const { dataConfig, environment } = envConfig;
// console.log(searchedFor);

global.dataconfig = dataConfig;
global.emailData = dataConfig.emailData;
global.projectName = process.env.PROJECT_NAME || dataConfig.projectName;
global.reportName = process.env.REPORT_NAME || 'Automated Report';
global.env = process.env.ENVIRONMENT || environment[options.env];
global.closeBrowser = settings.closeBrowser;

global.s3Data = require('./runtime/scripts/secrets/awsConfig.json');
global.ltsecrets = require('./runtime/scripts/secrets/lambdatest.json');

global.date = require('./runtime/helpers').currentDate();
global.dateTime = require('./runtime/helpers').reportDate();

if (options.remoteService && options.extraSettings) {
  const additionalSettings = parseRemoteArguments(options.extraSettings);
  settings.remoteConfig = additionalSettings.config;
  /* this approach supports a single string defining both the target config and tags
    e.g. 'chrome/@tag1,@tag2'
   */
  if (additionalSettings.tags) {
    if (options.tags) {
      throw new Error('Cannot sent two types of tags - either use -x or -t');
    }
    options.tags = additionalSettings.tags;
  }
}

function getProjectPath(objectName) {
  // return settings.projectRoot + options[objectName];
  return path.resolve(settings.projectRoot, options[objectName]);
}

const paths = {
  pageObjects: getProjectPath('pageObjects'),
  reports: getProjectPath('reports'),
  featureFiles: getProjectPath('featureFiles'),
  sharedObjects: getProjectPath('sharedObjects'),
};

/** expose settings and paths for global use */
global.BROWSER_NAME = options.browser;
global.settings = settings;
global.paths = paths;

/**
 * Adding Global browser folder
 * Adding Accessibility folder at project level
 */
global.browserName = global.settings.remoteConfig || BROWSER_NAME;
const reports = `./reports/${browserName}`;
const axereports = `./reports/${browserName}/accessibility`;

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
fs.ensureDirSync(axereports, (err) => {
  if (err) {
    console.error(`The Accessibility Reports Folder has NOT been created: ${err.stack}`);
  }
});

/** adding global helpers */
global.helpers = require('./runtime/helpers');

/** adding global accessibility library */
// eslint-disable-next-line camelcase
const accessibility_lib = path.resolve(__dirname, './runtime/accessibility/accessibilityLib.js');
if (fs.existsSync(accessibility_lib)) {
  const rList = [];
  // eslint-disable-next-line global-require,import/no-dynamic-require
  global.accessibilityLib = require(accessibility_lib);
  global.accessibilityReportList = rList;
  // console.log('Accessibility library is available')
} else console.error('No Accessibility Lib');

/**
 * adding video link access
 * @type {string}
 */
// eslint-disable-next-line camelcase
const videoLib = path.resolve(__dirname, './runtime/getVideoLinks.js');
if (fs.existsSync(videoLib)) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  global.videoLib = require(videoLib);
  // console.log('Video library is available');
} else {
  console.error('No Video Lib');
}

/** add path to import shared objects */
const sharedObjectsPath = path.resolve(paths.sharedObjects);
if (fs.existsSync(sharedObjectsPath)) {
  const allDirs = {};
  const dir = requireDir(sharedObjectsPath, { camelcase: true, recurse: true });

  merge(allDirs, dir);
  if (Object.keys(allDirs).length > 0) {
    global.sharedObjects = allDirs;
  }
}

/** add path to import page objects */
const pageObjectPath = path.resolve(paths.pageObjects);
if (fs.existsSync(pageObjectPath)) {
  global.pageObjects = requireDir(pageObjectPath, { camelcase: true, recurse: true });
}

/** rewrite command line switches for cucumber */
process.argv.splice(2, 100);

/** specify the feature files folder (this must be the first argument for Cucumber) */
process.argv.push(paths.featureFiles);

/** specify the feature files to be executed */
if (options.featureFile) {
  const splitFeatureFiles = options.featureFile.split(',');

  splitFeatureFiles.forEach((feature) => {
    process.argv.push(feature);
  });
}

/** add switch to tell cucumber to produce json report files */
const cpPath = '@cucumber/pretty-formatter';

process.argv.push(
  '-f',
  cpPath,
  '-f',
  `json:${path.resolve(__dirname, paths.reports, browserName, `${global.reportName}-${dateTime}.json`)}`
);

/** add cucumber world as first required script (this sets up the globals) */
process.argv.push('-r', path.resolve(__dirname, './runtime/world.js'));

/** add path to import step definitions */
process.argv.push('-r', path.resolve(options.steps));

/**
 * Get tags from feature files
 * @returns {Array<string>} list of all tags found
 */
function getTagsFromFeatureFiles() {
  let result = [];
  loadTextFile.setup({ matchRegExp: /\.feature/ });
  const featurefiles = loadTextFile.loadSync(path.resolve(options.featureFiles));
  Object.keys(featurefiles).forEach((key) => {
    const content = String(featurefiles[key] || '');
    result = result.concat(content.match(new RegExp('@[a-z0-9]+', 'g')));
  });
  return result;
}

/**
 * verify the correct tags for scenarios to run
 */
if (options.tags) {
  const tagsFound = getTagsFromFeatureFiles();
  // console.log('these are the found tags ', tagsFound);
  options.tags.forEach((tag) => {
    if (tag[0] !== '@') {
      console.error('tags must start with a @');
      process.exit();
    }
    if (tagsFound.indexOf(tag) === -1) {
      console.error(`this tag ${tag} does not exist`);
      process.exit();
    }
  });
  options.tags.forEach((tag) => {
    process.argv.push('--tags', tag);
  });
}

/** Add split to run multiple browsers from the command line */
if (options.browser) {
  const splitBrowsers = options.browser.split(',');
  splitBrowsers.forEach(() => {
    process.argv.push(options.browser);
  });
  process.argv.push(options.browser);
}

/** add strict option (fail if there are any undefined or pending steps) */
// process.argv.push('-S');

/** execute cucumber Cli */
try {
  klassiCli.run((succeeded) => {
    if (!succeeded) {
      process.exit(1);
    }

    if (process.stdout.write('')) {
      process.exit();
    } else {
      // kernel buffer is not empty yet
      process.stdout.on('drain', () => {
        process.exit();
      });
    }
  });
} catch (err) {
  console.log(`cucumber integration has failed ${err.message}`);
  throw err;
}
