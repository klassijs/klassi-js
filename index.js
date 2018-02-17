/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

const path = require('path'),
    program = require('commander'),
    pjson = require('./package.json'),
    cucumber = require('cucumber');

function collectPaths(value, paths){
  paths.push(value);
  return paths;
}

/**
 * Setting and Naming the Project Report files Globally
 * @type {string}
 */
global.reportName = 'KlassiTech Automated Test Report';
global.projectName = 'Klassi Technologies';

program
    .version(pjson.version)
    .description(pjson.description)
    .option('-s, --steps <path>', 'path to step definitions. defaults to ./step-definitions', './step-definitions')
    .option('-p, --pageObjects <path>', 'path to page objects. defaults to ./page-objects', './page-objects')
    .option('-d, --disableReport [optional]', 'Disables the auto opening the browser with test report')
    .option('-o, --sharedObjects [paths]', 'path to shared objects (repeatable). defaults to ./shared-objects', collectPaths, ['./shared-objects'])
    .option('-b, --browser <path>', 'name of browser to use. defaults to chrome', /^(chrome|firefox|phantomjs)$/i, 'chrome')
    .option('-r, --reports <path>', 'output path to save reports. defaults to ./reports', './reports')
    .option('-t, --tags <tagName>', 'name of tag to run')
    .parse(process.argv);

program.on('--help', function(){
    console.log('  For more details please visit https://github.com/larryg01/webdriverio-cucumber-js#readme\n');
});

/**
 * add helpers
 */
global.helpers = require('./runtime/helpers.js');

/**
 *  adding global date function
 */
let date = helpers.currentDate();

/**
 * store browserName globally (used within world.js to build driver)
 */
global.browserName = program.browser;

/**
 * used within world.js to import page objects
 */
global.pageObjectPath = path.resolve(program.pageObjects);

/** used within world.js to output reports
 */
global.reportsPath = path.resolve(program.reports);

/** used within world.js to import shared objects into the shared namespace
 * @type {any}
 */
global.sharedObjectPaths = program.sharedObjects.map(function(item){
    return path.resolve(item);
});

/** used within world.js to decide if reports should be generated
 */
global.disableReport = (program.disableReport);

/** rewrite command line switches for cucumber
 */
process.argv.splice(2, 100);

/** add switch to tell cucumber to produce json report files
 */
process.argv.push('-f', 'pretty', '-f', 'json:' + path.resolve(__dirname, global.reportsPath, global.reportName + '-' + date + '.json'));

/** add cucumber world as first required script (this sets up the globals)
 */
process.argv.push('-r', path.resolve(__dirname, './runtime/world.js'));

/** add path to import step definitions
 */
process.argv.push('-r', path.resolve(program.steps));

/** add tag to the scenarios
 */
if (program.tags) {
    process.argv.push('-t', program.tags);
}

/**
 * add strict option (fail if there are any undefined or pending steps)
 */
process.argv.push('-S');

/**
 * execute cucumber Cli
 */
let oupCli = cucumber.Cli(process.argv);
global.cucumber = cucumber;

oupCli.run(function (succeeded) {
    let code = succeeded ? 0 : 1;
    function exitNow() {
        process.exit(code);
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
