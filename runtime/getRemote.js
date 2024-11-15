/**
 * klassi Automated Testing Tool
 * Created by Larry Goddard
 */
const lambdatest = require('./remotes/lambdatest');

module.exports = function getRemote(remoteService) {
  const remote = {};

  function noop() {
    console.log('"If you\'re seeing this, you\'re trying to run a non-existent remoteService"');
  }
  if (!remoteService) {
    remote.type = 'disabled';
    remote.after = noop;
  } else if (remoteService === 'lambdatest') {
    remote.type = 'lambdatest';
    remote.after = lambdatest.submitResults;
  } else {
    console.log(`Unknown remote service ${remoteService}`);
    remote.type = 'unknown';
    remote.after = noop;
  }
  return remote;
};
