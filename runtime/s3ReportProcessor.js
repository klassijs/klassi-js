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
const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');

// eslint-disable-next-line no-undef
const awsData = dataconfig.awsConfig;

const s3Bucket = process.env.AWS_BUCKET_NAME || s3Data.BUCKET_NAME || awsData.BUCKET_NAME;
const s3AccessKeyId = process.env.AWS_ID || s3Data.ID || awsData.ID;
const s3SecretAccessKey = process.env.AWS_SECRET || s3Data.SECRET || awsData.SECRET;
const domainName = process.env.AWS_DOMAIN_NAME || s3Data.DOMAIN_NAME || awsData.DOMAIN_NAME;

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
    projectName = s3Data.s3FolderName || awsData.s3FolderName;
    console.log(`Starting Processing of Test Report for: ${date}/${projectName} ...`);
    /**
     * This creates the test report from the sample template
     * @type {string}
     */
    const tempFile = path.resolve(__dirname, './scripts/secrets/s3ReportSample');
    const file = `../${projectName}/reports/testReport-${date}.html`;
    await fs.copySync(tempFile, file);

    /**
     * list of browsers test running on via BrowserStack
     * @type {string[]}
     */
    const browserName = [
      'chrome',
      'chromev81',
      'chromeDE',
      'firefox',
      'edge',
      'iexplorer',
      'safari',
      'tabletGalaxy',
      'tabletiPad',
      'tabletiPad12',
    ];
    let dataList;
    let dataNew = '';
    let browsername;
    let dataOut = await helpers.readFromFile(tempFile);

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
          for (let x = 0; x < browserName.length; x++) {
            browsername = browserName[x];
            const browserData = [];

            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.Contents.length; i++) {
              const key = data.Contents[i].Key;
              if (key.substring(0, 10) === folderName) {
                if (key.split('.')[1] === 'html') {
                  dataList = `${domainName}/${key}`;

                  if (dataList.includes(browsername)) {
                    // eslint-disable-next-line no-await-in-loop,no-unused-vars
                    dataNew = dataList.replace(/^.*reports\/\w+\//, '').replace(/\.html/, '');
                    let dataFile = '';
                    browserData.push((dataFile = `${dataFile}<a> <a href="${dataList}">${dataNew}</a></a>`));
                  }
                }
              }
            }
            dataOut = dataOut.replace(`This is ${browsername}`, browserData.join(' '));
          }
        }
        await helpers.writeToTxtFile(file, dataOut);
        if (dataList === undefined) {
          console.log('There is no Data for this Project / project does not exist ....', dataList);
        } else if (dataList.length > 0) {
          console.log('Test run completed and s3 report being sent .....');
          await helpers.klassiEmail();
        }
      }
    );
  },
  formatDate() {
    const $today = new Date();
    let $yesterday = new Date($today);
    $yesterday.setDate($today.getDate() - 1); // this cause the month to rollover.
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
