/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>
 
 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const path = require('path');
const program = require('commander');
const fs = require('fs-extra');
// eslint-disable-next-line import/order
const pjson = require('./package.json');
// eslint-disable-next-line import/no-extraneous-dependencies
const cucumber = require('cucumber');

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
  const parsed = {
    config: argSplit[CONFIG],
    tags: argSplit[TAGS],
  };
  return parsed;
}

let cpPath;
let envConfig;

/**
 * Create all the required files and folders needed for the framework to function correctly
 * @type {string}
 */
const fileDnldFldr = './shared-objects/fileDnldFolder';
const docsFolder = './shared-objects/docs';

fs.ensureDirSync(fileDnldFldr, (err) => {
  if (err) {
    console.log(`The File Download Folder has NOT been created: ${err.stack}`);
  }
});
fs.ensureDir(docsFolder, (err) => {
  if (err) {
    console.log(`The Docs Folder has NOT been created: ${err.stack}`);
  }
});

program
  .version(pjson.version)
  .description(pjson.description)
  .option(
    '-b, --browsers [optional]',
    'name of browser to use. defaults to chrome',
    /(chrome|edge|firefox|iexplorer|safari|tabletGalaxy|tabletiPad)$/i,
    'chrome'
  )
  .option('-c, --context <path>', 'contextual root path for project-specific features, steps, objects etc', './')
  .option('-d, --disableReport [optional]', 'Disables the auto opening of the test report in the browser')
  .option('-e, --email [optional]', 'email for sending reports to stakeholders')
  .option('-f, --featuresPath <path>', 'path to feature definitions. defaults to ./features', 'features')
  .option('-F, --featuresFiles <path>', 'comma-separated list of feature files to run')
  .option('-g, --reportName [optional]', 'basename for report files e.g. use report for report.json', global.reportName)
  .option(
    '-n, --environment <path>',
    'name of environment to run the framework / test in. default to test',
    /^(dev|test|uat|preprod|prod)$/i,
    'test'
  )
  .option(
    '-o, --sharedObjects <paths>',
    'path to shared objects (repeatable). defaults to ./shared-objects',
    collectPaths,
    ['shared-objects']
  )
  .option('-p, --pageObjects <path>', 'path to page objects. defaults to ./page-objects', 'page-objects')
  .option('-r, --reports <path>', 'output path to save reports. defaults to ./reports', 'reports')
  .option('-s, --steps <path>', 'path to step definitions. defaults to ./step_definitions', 'step_definitions')
  .option('-t, --tags <tagName>', 'name of tag to run')
  .option('-u, --updateBaselineImage [optional]', 'automatically update the baseline image after a failed comparison')
  .option(
    '-w, --remoteService [optional]',
    'which remote browser service, if any, should be used e.g. browserstack',
    ''
  )
  .option('-x, --extraSettings [optional]', 'further piped configs split with pipes', '')
  .option('-a, --aces [optional]', 'the switch to change the relative path for aces tests')
  .option('-l, --webDriverProtocol [optional]', 'the switch to change the browser option from devtools to webdriver')
  .parse(process.argv);

program.on('--help', function () {
  console.log('For more details please visit https://github.com/oup/OAF#readme\n');
});

const settings = {
  aces: program.aces,
  projectRoot: program.context,
  reportName: program.reportName,
  BROWSER_NAME: program.browsers,
  disableReport: program.disableReport,
  updateBaselineImage: program.updateBaselineImage,
  defaultTimeout: '300000 * 1000', // 5 mins
  remoteService: program.remoteService,
};

/**
 * Setting and Naming the Project Report files Globally
 * @type {string}
 */
global.projectName = process.env.PROJECT_NAME || projectName;

if (program.aces) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  envConfig = require(`./projects/${projectName}/test/configs/envConfig`);
} else {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  envConfig = require(`./projects/${projectName}/configs/envConfig`);
}
const { reportName } = envConfig;
const { projectReportName } = envConfig;

/** Setting emailList to be global so it works for all projects */
let emailData;

if (program.aces) {
  emailData = `./projects/${projectName}/test/configs/emailData`;
} else {
  emailData = `./projects/${projectName}/configs/emailData`;
}
global.mailList = emailData;
global.reportName = process.env.REPORT_NAME || reportName;
global.projectReportName = process.env.PROJECT_REPORT_NAME || projectReportName;

if (program.remoteService && program.extraSettings) {
  const additionalSettings = parseRemoteArguments(program.extraSettings);
  settings.remoteConfig = additionalSettings.config;
  /* this approach supports a single string defining both the target config and tags
    e.g. 'chrome/@tag1,@tag2'
   */
  if (additionalSettings.tags) {
    if (program.tags) {
      throw new Error('Cannot sent two types of tags - either use -x or -t');
    }
    // TODO: test this on multiple tags
    program.tags = additionalSettings.tags;
  }
}

function getProjectPath(objectName) {
  return path.resolve(settings.projectRoot + program[objectName]);
}

const paths = {
  pageObjects: getProjectPath('pageObjects'),
  reports: getProjectPath('reports'),
  featuresPath: getProjectPath('featuresPath'),
  sharedObjects: program.sharedObjects.map(function (item) {
    return path.resolve(settings.projectRoot + item);
  }),
};

/** expose settings and paths for global use */
global.BROWSER_NAME = program.browsers;
global.settings = settings;
global.paths = paths;

/**
 * Adding Global browser folder
 * Adding Accessibility folder at project level
 */
global.browserName = global.settings.remoteConfig || global.BROWSER_NAME;
const reports = `./reports/${browserName}`;
const axereports = `./reports/${browserName}/accessibility`;
let file;

/** file creation for userAgent globally */
if (program.aces) {
  file = './shared-objects/docs/userAgent.txt';
} else {
  file = `../${projectName}/shared-objects/docs/userAgent.txt`;
}

fs.ensureFileSync(file, function (err) {
  if (err) {
    console.log(`The fileName has NOT been created: ${err.stack}`);
  }
});
fs.ensureDirSync(reports, function (err) {
  if (err) {
    console.log(`The Reports Folder has NOT been created: ${err.stack}`);
  }
});
fs.ensureDirSync(axereports, function (err) {
  if (err) {
    console.log(`The Accessibility Reports Folder has NOT been created: ${err.stack}`);
  }
});

/** adding global helpers and making it global */
if (program.aces) {
  cpPath = `./projects/${projectName}/test/settings/helpers.js`;
} else {
  cpPath = `./projects/${projectName}/settings/helpers`;
}
// eslint-disable-next-line import/no-dynamic-require
global.helpers = require(cpPath);

/** adding global accessibility library */
// eslint-disable-next-line camelcase
const accessibility_lib = path.resolve(__dirname, './runtime/accessibility/accessibilityLib.js');
if (fs.existsSync(accessibility_lib)) {
  const rList = [];
  // eslint-disable-next-line global-require,import/no-dynamic-require
  global.accessibilityLib = require(accessibility_lib);
  global.accessibilityReportList = rList;

  console.log('Accessibility library is available for this project');
} else console.log('No Accessibility Lib');

/**
 * adding video link access
 * @type {string}
 */
// eslint-disable-next-line camelcase
const video_lib = path.resolve(__dirname, './runtime/getBsVideoLinks.js');
if (fs.existsSync(video_lib)) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  global.videoLib = require(video_lib);

  console.log('Video library is available for this project');
} else {
  console.log('No Video Lib');
}

/** adding global date function */
global.date = require('./runtime/confSettings').currentDate();
global.dateTime = require('./runtime/confSettings').reportDate();

/** store EnvName globally (used within world.js when building browser) */
global.envName = program.environment;

/** store BaseUrl globally (uesd within the world.js when building browser) */
global.base_url = program.environment;

/** rewrite command line switches for cucumber */
process.argv.splice(2, 100);

/** specify the feature files folder (this must be the first argument for Cucumber) */
process.argv.push(paths.featuresPath);

/** specify the feature files to be executed */
if (program.featureFile) {
  const splitFeatureFiles = program.featureFile.split(',');

  splitFeatureFiles.forEach(function (feature) {
    process.argv.push(feature);
  });
}

/** add switch to tell cucumber to produce json report files */
if (program.aces) {
  cpPath = '../../../node_modules/cucumber-pretty';
} else {
  cpPath = '../../node_modules/cucumber-pretty';
}

process.argv.push(
  '-f',
  cpPath,
  '-f',
  `json:${path.resolve(__dirname, paths.reports, browserName, `${projectName} ${global.reportName}-${dateTime}.json`)}`
);

/** add cucumber world as first required script (this sets up the globals) */
process.argv.push('-r', path.resolve(__dirname, './runtime/world.js'));

/** add path to import step definitions */
process.argv.push('-r', path.resolve(program.steps));

/** add tag to the scenarios */
if (program.tags) {
  // const splitTags = program.tags.split(',');
  // splitTags.forEach(function (tag) {
  //   process.argv.push('-t', tag);
  // });
  process.argv.push('-t', program.tags);
}

/** Add split to run multiple browsers from the command line */
if (program.browsers) {
  const splitBrowsers = program.browsers.split(',');
  splitBrowsers.forEach((browser) => {
    process.argv.push('-b', browser);
  });
}

/** add strict option (fail if there are any undefined or pending steps) */
process.argv.push('-S');

/** execute cucumber Cli */
global.cucumber = cucumber;

// eslint-disable-next-line global-require,import/no-extraneous-dependencies
const klassiCli = new (require('cucumber').Cli)({
  argv: process.argv,
  cwd: process.cwd(),
  stdout: process.stdout,
});

// eslint-disable-next-line no-new
try {
  klassiCli.run((success) => {
    if (!success) {
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
