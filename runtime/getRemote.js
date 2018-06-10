/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const browserstack = require('./remotes/browserstack.js');

module.exports = function getRemote(remoteService){

  let remote = {};

  function noop(){
    console.log("If you're seeing this, you're running a non-existent remoteService");
    // log.info("If you're seeing this, you're running a non-existent remoteService");
  }

  if (!remoteService){
    remote.type = "disabled";
    remote.after = noop;
  }
  else if (remoteService === "browserstack"){
    remote.type = "browserstack";
    remote.after = browserstack.submitResults;
  }
  else {
    console.log(`Unknown remote service ${remoteService}`);
    // log.info(`Unknown remote service ${remoteService}`);
    remote.type = "unknown";
    remote.after = noop;
  }

  return remote;

}