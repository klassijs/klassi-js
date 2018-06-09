/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const fs = require('fs');

module.exports = function(configFilePath){
    
  const json = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
  
  //TODO: add validation if schema
  
  return json;

};