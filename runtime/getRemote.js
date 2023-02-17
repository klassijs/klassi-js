/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const lambdatest = require('./remotes/lambdatest');

module.exports = function getRemote(remoteService) {
  const remote = {};

  function noop() {
    console.log('"If you\'re seeing this, you\'re running a non-existent remoteService"');
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
