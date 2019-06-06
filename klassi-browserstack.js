// Runs nightwatch tests on browserstack automate, integrated with CircleCI.
// Can be triggered locally with browserstack access key:
// BROWSERSTACK_USERNAME='' BROWSERSTACK_ACCESS_KEY='' npm run nightwatch-browserstack -c nw-browserstack.conf.js

const wdio = require('webdriverio');
const browserstack = require('browserstack-local');
const fs = require('fs-extra');

let browserstackLocal;
const browserstackKey = process.env.BROWSERSTACK_ACCESS_KEY;
const browserstackLocalIdentifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER;

initWdio();

function initWdio() {
  if (areEnvVarsSet()) {
    try {
      console.log(
        `\nExpecting a player build served at port: ${process.env.HOSTPORT ||
          '8080'}\n`
      );

      console.log('Removing existing artifacts..\n');
      fs.removeSync('./artifacts'); //  Removes the artifacts folder

      process.mainModule.filename = './node_modules/.bin/wdio';

      // Code to start browserstack local before start of test
      console.log('Connecting local to browserstack automate..');
      browserstackLocal = new browserstack.Local();
      wdio.browserstackLocal = browserstackLocal;
      browserstackLocal.start(
        {
          key: browserstackKey,
          'local-identifier': browserstackLocalIdentifier
        },
        error => {
          if (error) {
            throw error;
          }

          console.log(
            'Connected.\n\nNight gathers, and now my watch begins..\nI am the sword in the darkness.\n'
          );
          wdio.cli(argv => {
            wdio.CliRunner(argv)
              .setup(null, () => {
                // Stop browserstack local after parallel test
                browserstackLocal.stop(() => {
                  console.log('\tAnd now my watch has ended..');
                });
                process.exit();
              })
              .runTests(() => {
                // Stop browserstack local after single test
                browserstackLocal.stop(() => {
                  console.log('\tAnd now my watch has ended..');
                });
                process.exit();
              });
          });
        }
      );
    } catch (ex) {
      console.log('\tThere was an error while starting the test runner:\n\n');
      process.stderr.write(`${ex.stack}\n`);
      process.exit(2);
    }
  }
}

function areEnvVarsSet() {
  if (
    !browserstackKey ||
    !browserstackLocalIdentifier ||
    !process.env.BROWSERSTACK_USERNAME
  ) {
    console.log(`Please ensure you have set the following environment variables:
    BROWSERSTACK_USERNAME
    BROWSERSTACK_ACCESS_KEY
    BROWSERSTACK_LOCAL_IDENTIFIER`);
    return false;
  }
  return true;
}
