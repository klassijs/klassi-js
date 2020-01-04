/**
 Klassi Automated Testing Tool
 Created by Larry Goddard
 */
/**
 Copyright © klassitech 2016 - Larry Goddard <larryg@klassitech.co.uk>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

const fs = require('fs-extra');
const useragent = require('ua-parser-js');
const getRemote = require('../getRemote.js');

let remoteService = getRemote(global.settings.remoteService);
let uastring = fs.readFileSync('../../shared-objects/docs/userAgent.txt', 'utf8');
let parser = new useragent(uastring);
let helpers = require('../helpers');

console.log('This is it 1234 : ' + parser.getBrowser().browser);

module.exports = {
  metadata: [
    {
      name: 'Browser',
      value: parser.getBrowser().name + ' ' + parser.getBrowser().version
    },
    {
      name: 'OS',
      value: parser.getOS().name + ' ' + parser.getOS().version
    },
    {
      name: 'Device',
      value:
        remoteService && remoteService.type === 'browserstack'
          ? 'Remote'
          : 'Local'
    },
    {
      name: 'Date',
      value: helpers.getCurrentDateTime()
    }
  ]
};
