/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');

let s3Bucket;
let s3AccessKeyId;
let s3SecretAccessKey;
let domainName;

// eslint-disable-next-line no-undef
const awsData = dataconfig.awsConfig;

if (s3Bucket) {
  // eslint-disable-next-line no-unused-expressions
  process.env.AWS_BUCKET_NAME || s3Data.BUCKET_NAME || awsData.BUCKET_NAME;
}
if (s3AccessKeyId) {
  // eslint-disable-next-line no-unused-expressions
  process.env.AWS_ID || s3Data.ID || awsData.ID;
}
if (s3SecretAccessKey) {
  // eslint-disable-next-line no-unused-expressions
  process.env.AWS_SECRET || s3Data.SECRET || awsData.SECRET;
}
if (domainName) {
  // eslint-disable-next-line no-unused-expressions
  process.env.AWS_DOMAIN_NAME || s3Data.DOMAIN_NAME || awsData.DOMAIN_NAME;
}

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
    const browserName = ['chrome', 'firefox', 'edge', 'iexplorer', 'safari', 'tabletGalaxy', 'tabletiPad'];
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
                    // browserData.push((dataFile = `${dataFile}<a> <a href="${dataList}">${dataNew}</a></a>`));
                    browserData.push(
                      (dataFile = `${dataFile}<div class="panel ${browsername}"><p style="text-indent:40px">${browsername}</p><a href="${dataList}">${dataNew}</a></div>`)
                    );
                    // console.log('this is the browserData ', dataFile);
                  }
                }
              }
            }
            dataOut = dataOut.replace('<-- browser_test_output -->', browserData.join(' '));
            // dataOut = dataOut.replace(`This is ${browsername}`, browserData.join(' '));
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
