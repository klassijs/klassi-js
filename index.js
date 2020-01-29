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
'use strict';
const path = require('path');
const program = require('commander');
const fs = require('fs-extra');
const pjson = require('./package.json');
const cucumber = require('cucumber');

function collectPaths(value, paths) {
  paths.push(value);
  return paths;
}

function parseRemoteArguments(argumentString) {
  if (!argumentString) {
    throw new Error('Expected an argumentString');
  }
  let argSplit = argumentString.split('/');
  let CONFIG = 0;
  let TAGS = 1;
  let parsed = {
    config: argSplit[CONFIG],
    tags: argSplit[TAGS]
  };
  return parsed;
}

let cp_path;
let envConfig;

/**
 * Create all the required files and folders needed for the framework to function correctly
 * @type {string}
 */
let reports = './reports';
let fileDnldFldr = './shared-objects/fileDnldFolder/';
let docsFolder = './shared-objects/docs';
let file = ('../shared-objects/docs/userAgent.txt');

fs.ensureDirSync(reports, function(err) {
  if (err) {
    console.log('The Reports Folder has NOT been created: ' + err.stack);
  }
});
fs.ensureDirSync(fileDnldFldr, function(err) {
  if (err) {
    console.log('The File Download Folder has NOT been created: ' + err.stack);
  }
});
fs.ensureDir(docsFolder, function(err) {
  if (err) {
    console.log('The Docs Folder has NOT been created: ' + err.stack);
  }
});
fs.ensureFileSync(file, function(err) {
  if (err) {
    console.log('The fileName has NOT been created: ' + err.stack);
  }
});

program
  .version(pjson.version)
  .description(pjson.description)
  .option(
    '-b, --browsers [optional]',
    'name of browsers to use. defaults to chrome',
    /(chrome|edge|FIREFOX|iexplorer|safari|tabletGalaxy|tabletiPad)$/i,
    'chrome'
  )
  .option('-c, --context <path>', 'contextual root path for project-specific features, steps, objects etc', './')
  .option('-d, --disableReport [optional]', 'Disables the auto opening the browser with test report')
  .option('-e, --email [optional]', 'email for sending reports to stakeholders')
  .option('-f, --featuresPath <path>', 'path to feature definitions. defaults to ./features',
    'features')
  .option('-F, --featuresFiles <path>', 'comma-separated list of feature files to run')
  .option('-g, --reportName [optional]', 'basename for report files e.g. use report for report.json', global.reportName)
  .option('-n, --environment [<path>]', 'name of environment to run the framework / test in. default to test', /^(dev|test|uat|preprod|prod)$/i, 'test')
  .option('-o, --sharedObjects <paths>', 'path to shared objects (repeatable). defaults to ./shared-objects', collectPaths, ['shared-objects'])
  .option('-p, --pageObjects <path>', 'path to page objects. defaults to ./page-objects', 'page-objects')
  .option('-r, --reports <path>', 'output path to save reports. defaults to ./reports', 'reports')
  .option('-s, --steps <path>', 'path to step definitions. defaults to ./step_definitions', 'step_definitions')
  .option('-t, --tags <tagname>', 'name of tag to run', collectPaths, [])
  .option('-u, --updateBaselineImage [optional]', 'automatically update the baseline image after a failed comparison')
  .option('-w, --remoteService [optional]', 'which remote browser service, if any, should be used e.g. browserstack', '' )
  .option('-x, --extraSettings [optional]', 'further piped configs split with pipes', '')
  .option('-a, --aces [optional]', 'the switch to change the relative path for nested tests folders'
  )
  .parse(process.argv);

program.on('--help', function() {
  console.log('For more details please visit https://github.com/larryg01/klassi-js#readme\n');
});

let settings = {
  aces: program.aces,
  projectRoot: program.context,
  reportName: program.reportName,
  browserName: program.browsers,
  disableReport: program.disableReport,
  updateBaselineImage: program.updateBaselineImage,
  defaultTimeout: '300000 * 1000', // 5 mins
  remoteService: program.remoteService
};

/**
 * Setting and Naming the Project Globally
 * @type {string}
 */
global.projectName = process.env.PROJECT_NAME;


/**
 * Setting and Naming the Project Report files Globally
 * @type {string}
 */
if (program.aces) {
  envConfig = require('./projects/' + projectName + '/test/configs/envConfig');
} else {
  envConfig = require('./projects/' + projectName + '/configs/envConfig');
}
let reportName = envConfig.reportName;
let projectReportName = envConfig.projectReportName;
global.reportName = process.env.REPORT_NAME || reportName;
global.projectReportName = process.env.PROJECT_REPORT_NAME || projectReportName;

if (program.remoteService && program.extraSettings) {
  let additionalSettings = parseRemoteArguments(program.extraSettings);
  settings.remoteConfig = additionalSettings.config;
  /* this approach supports a single string defining both the target config and tags
    e.g. 'win10-chrome/@tag1,@tag2'
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

let paths = {
  pageObjects: getProjectPath('pageObjects'),
  reports: getProjectPath('reports'),
  featuresPath: getProjectPath('featuresPath'),
  sharedObjects: program.sharedObjects.map(function(item) {
    return path.resolve(settings.projectRoot + item);
  })
};

/**
 * expose settings and paths for global use
 * */
global.browserName = program.browsers;
global.settings = settings;
global.paths = paths;


/**
 * add helpers and making it global
 */
if (program.aces) {
  cp_path = './projects/' + projectName + '/test/settings/helpers.js';
  console.log(cp_path);
} else {
  cp_path = './projects/' + projectName + '/settings/helpers.js';
}
global.helpers = require(cp_path);

/**
 *  adding global date function
 */
global.date = require('./runtime/confSettings').currentDate();
global.dateTime = require('./runtime/confSettings').reportDate();

/**
 * store EnvName globally (used within world.js when building browser)
 */
global.envName = program.environment;

/**
 * rewrite command line switches for cucumber
 */
process.argv.splice(2, 100);

/**
 * specify the feature files folder (this must be the first argument for Cucumber)
 */
process.argv.push(paths.featuresPath);

/**
 * specify the feature files to be executed
 */
if (program.featureFile) {
  let splitFeatureFiles = program.featureFile.split(',');
  splitFeatureFiles.forEach(function(feature) {
    process.argv.push(feature);
  });
}

/**
 * add switch to tell cucumber to produce json report files
 */
// // single run report
// process.argv.push(
//   '-f',
//   '../../node_modules/cucumber-pretty',
//   '-f',
//   'json:' +
//     path.resolve(
//       __dirname,
//       paths.reports,
//       projectName + ' ' + settings.reportName + '-' + date + '.json'
//     )
// );

if (program.aces) {
  cp_path = '../../../node_modules/cucumber-pretty';
} else {
  cp_path = '../../node_modules/cucumber-pretty';
}
// process.argv.push(
//   '-f',
//   cp_path,
//   '-f',
//   'json:' +
//   path.resolve(
//     __dirname,
//     paths.reports,
//     projectName + ' ' + global.reportName + '-' + date + '.json'
//   )
// );

// multi run report
process.argv.push(
  '-f',
  cp_path,
  '-f',
  'json:' +
    path.resolve(global.paths.reports, browserName + '-' + dateTime + '.json')
); // getting the full JSON file report name

/**
 * add cucumber world as first required script (this sets up the globals)
 */
process.argv.push('-r', path.resolve(__dirname, './runtime/world.js'));

/**
 * add path to import step definitions
 */
process.argv.push('-r', path.resolve(program.steps));

/**
 * add tag to the scenarios
 */
if (program.tags) {
  process.argv.push('-t', program.tags);
}

/**
 * Add split to run multiple browsers from the command line
 */
if (program.browsers) {
  let splitBrowsers = program.browsers.split(',');
  splitBrowsers.forEach(function(browser) {
    process.argv.push('-b', browser);
  });
}

/**
 * add strict option (fail if there are any undefined or pending steps)
 */
process.argv.push('-S');

/**
 * execute cucumber Cli
 */
global.cucumber = cucumber;

let klassiCli = new (require('cucumber')).Cli({
  argv: process.argv,
  cwd: process.cwd(),
  stdout: process.stdout
});

new Promise(function(resolve, reject) {
  try {
    klassiCli.run(function(success) {
      resolve = success ? 0 : 1;
      function exitNow() {
        process.exit(resolve);
      }
      if (process.stdout.write('')) {
        exitNow();
      } else {
        /**
         * write() returned false, kernel buffer is not empty yet...
         */
        process.stdout.on('drain', exitNow);
      }
    });
  } catch (err) {
    console.log('cucumber integration has failed ' + err.message);
    reject(err);
    throw err;
  }
});
