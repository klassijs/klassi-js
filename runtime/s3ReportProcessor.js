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
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const program = require('commander');
const sendMail = require('./confSettings');
const confSettings = require('./confSettings');
const s3Data = require('./scripts/secrets/awsConfig');

const s3Bucket = s3Data.BUCKET_NAME;
const s3AccessKeyId = s3Data.ID;
const s3SecretAccessKey = s3Data.SECRET;
// TODO: set up s3 values to run in env
// const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
// const s3SecretAccessKey = process.env.S3_SECRET_ACCESS;
// const s3Bucket = process.env.S3_BUCKET;
const domainName = s3Data.DOMAIN_NAME;

const s3 = new AWS.S3({
  region: 'eu-west-1',
  accessKeyId: s3AccessKeyId,
  secretAccessKey: s3SecretAccessKey,
});

module.exports = {
  async s3Processor(projectName) {
    const date = this.formatDate();
    const folderName = date;
    // eslint-disable-next-line no-param-reassign
    projectName = global.projectName;
    console.log(`Starting Processing of Test Report for: ${date}/${projectName} ...`);
    /**
     * This creates the test report from the sample template
     * @type {string}
     */
    let cpPath;
    if (program.aces) {
      cpPath = '../../../shared-objects/docs/s3ReportSample';
    } else {
      cpPath = '../../shared-objects/docs/s3ReportSample';
    }
    const tempFile = cpPath;

    let filePath;
    if (program.aces) {
      filePath = `../../${projectName}/test/reports/testReport-${date}.html`;
    } else {
      filePath = `../${projectName}/reports/testReport-${date}.html`;
    }
    const file = filePath;
    await fs.copySync(tempFile, file);

    /**
     * list of browsers test running on via BrowserStack
     * @type {*[]}
     */
    const chrome = [];
    const firefox = [];
    const edge = [];
    const safari = [];
    const iexplorer = [];
    const tabletGalaxy = [];
    const tabletiPad = [];
    let dataList;
    
    s3.listObjects(
      {
        Bucket: s3Bucket,
        Marker: folderName,
        Prefix: `${date}/${projectName}`,
        MaxKeys: 1000,
      },
      async (err, data) => {
        if (data.Contents) {
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < data.Contents.length; i++) {
            const key = data.Contents[i].Key;

            if (key.substring(0, 10) === folderName) {
              if (key.split('.')[1] === 'html') {
                dataList = `${domainName}/${key}`;

                if (dataList.includes('chrome')) {
                  chrome.push(dataList);
                }
                if (dataList.includes('firefox')) {
                  firefox.push(dataList);
                }
                if (dataList.includes('edge')) {
                  edge.push(dataList);
                }
                if (dataList.includes('safari')) {
                  safari.push(dataList);
                }
                if (dataList.includes('iexplorer')) {
                  iexplorer.push(dataList);
                }
                if (dataList.includes('tabletGalaxy')) {
                  tabletGalaxy.push(dataList);
                }
                if (dataList.includes('tabletiPad')) {
                  tabletiPad.push(dataList);
                }
              }
              if (key.split('.')[1] === 'json') {
                // do nothing
              }
            }
          }

          const readData = await confSettings.readTxtFile(tempFile);
          let dataFile = '';
          /**
           * strips out the individual browser data from the file
           */
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of chrome) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*chrome\/([^\/]+)/, '$1');
            // console.log('This is the line: ', dataNew);
            dataFile += `<a> <a href="${data}">${dataNew}</a> </a>`;
          }
          console.log('this is the data ', data);
          const newData = await readData.replace('This is Chrome', dataFile);

          dataFile = '';
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of firefox) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*firefox\/([^\/]+)/, '$1');
            dataFile += `<a> <a href="${data}">${dataNew}</a></a>`;
          }
          const newData1 = await newData.replace('This is Firefox', dataFile);

          dataFile = '';
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of edge) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*edge\/([^\/]+)/, '$1');
            dataFile = `${dataFile}<a> <a href="${data}">${dataNew}</a></a>`;
          }
          const newData2 = await newData1.replace('This is Edge', dataFile);

          dataFile = '';
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of safari) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*safari\/([^\/]+)/, '$1');
            dataFile += `<a> <a href="${data}">${dataNew}</a></a>`;
          }
          const newData3 = await newData2.replace('This is Safari', dataFile);

          dataFile = '';
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of iexplorer) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*iexplorer\/([^\/]+)/, '$1');
            dataFile = `${dataFile}<a> <a href="${data}">${dataNew}</a></a>`;
          }
          const newData4 = await newData3.replace('This is IExplorer', dataFile);

          dataFile = '';
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of tabletGalaxy) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*tabletGalaxy\/([^\/]+)/, '$1');
            dataFile += `<a> <a href="${data}">${dataNew}</a></a>`;
          }
          const newData5 = await newData4.replace('This is tabletGalaxy', dataFile);

          dataFile = '';
          // eslint-disable-next-line no-restricted-syntax,no-param-reassign
          for (data of tabletiPad) {
            // eslint-disable-next-line no-useless-escape
            const dataNew = data.replace(/.*tabletiPad\/([^\/]+)/, '$1');
            dataFile += `<a> <a href="${data}">${dataNew}</a></a>`;
          }
          const newData6 = await newData5.replace('This is tabletiPad', dataFile);

          /**
           * writes the data into the respective browser spaces
           */
          await confSettings.createTxtFile(file, newData6);

          /**
           * checks that the list is populated so that it will NOT send a blank email
           */
          if (dataList === undefined) {
            /** if project does not exist */
            console.log('There is no Data for this Project....', dataList);
          } else if (dataList.length > 0) {
            await browser.pause(DELAY_5s);
            await sendMail.klassiEmail();
            await browser.pause(DELAY_500ms);
            console.log('Test run completed and s3 report email sent');
          }
        }
      }
    );
  },
  formatDate() {
    const $today = new Date();
    let $yesterday = new Date($today);
    $yesterday.setDate($today.getDate() - 1); // setDate also supports negative values, which cause the month to rollover.
    let $dd = $yesterday.getDate();
    let $mm = $yesterday.getMonth() + 1; // January is 0!
    const $yyyy = $yesterday.getFullYear();
    if ($dd < 10) {
      $dd = `0${$dd}`;
    }
    if ($mm < 10) {
      $mm = `0${$mm}`;
    }
    $yesterday = `${$dd}-${$mm}-${$yyyy}`;
    return $yesterday;
  },
};
