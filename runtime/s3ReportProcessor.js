/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const path = require('path');
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const program = require('commander');

const s3Bucket = s3Data.S3_BUCKET;
const s3AccessKeyId = process.env.S3_KEY;
const s3SecretAccessKey = process.env.S3_SECRET;
const domainName = s3Data.S3_DOMAIN_NAME;

const s3 = new AWS.S3({
  region: s3Data.S3_REGION,
  accessKeyId: s3AccessKeyId,
  secretAccessKey: s3SecretAccessKey,
});

module.exports = {
  async s3Processor(projectName) {
    const s3date = helpers.formatDate();
    const folderName = s3date;
    projectName = dataconfig.s3FolderName;
    console.log(`Starting Processing of Test Report for: ${s3date}/${projectName} ...`);
    /**
     * This creates the test report from the sample template
     * @type {string}
     */
    const tempFile = path.resolve(__dirname, './scripts/s3ReportSample');
    let filePath;
    let date = helpers.currentDate();
    if (program.opts().dlink) {
      filePath = `../../${projectName}/test/reports/testReport-${date}.html`;
    } else {
      filePath = `../${projectName}/reports/testReport-${date}.html`;
    }

    const file = filePath;
    await fs.copySync(tempFile, file);

    /**
     * list of browsers test running on via lambdatest
     * @type {string[]}
     */
    const browserName = ['chrome', 'firefox', 'edge', 'safari', 'tabletGalaxy', 'tabletiPad'];
    let dataList;
    let dataNew = '';
    let browsername;
    let dataOut = await helpers.readFromFile(tempFile);

    s3.listObjects(
      {
        Bucket: s3Bucket,
        Marker: folderName,
        Prefix: `${s3date}/${projectName}`,
        MaxKeys: 1000,
      },
      async (err, data) => {
        if (data.Contents) {
          for (let x = 0; x < browserName.length; x++) {
            browsername = browserName[x];
            const browserData = [];

            for (let i = 0; i < data.Contents.length; i++) {
              const key = data.Contents[i].Key;
              if (key.substring(0, 10) === folderName) {
                if (key.split('.')[1] === 'html') {
                  dataList = `${domainName}/${key}`;
                  if (dataList.includes(browsername)) {
                    const envDataNew = dataList.replace(/^.*reports\/\w+\//, '').replace(/\/.*.html/, '');
                    dataNew = dataList
                      .replace(/^.*reports\/\w+\//, '')
                      .replace(`${envDataNew}/`, '')
                      .replace(/\.html/, '');
                    // console.log('this is the data new from the s3reportProcessor ln 92 ====> ', dataNew);
                    const theNewData = `${dataNew} -- ${envDataNew}`;
                    let dataFile = '';
                    browserData.push(
                      (dataFile = `${dataFile}<div class="panel ${browsername}"><p style="text-indent:40px">${browsername}</p><a href="${dataList}">${theNewData}</a></div>`)
                    );
                  }
                }
              }
            }
            dataOut = dataOut.replace('<-- browser_test_output -->', browserData.join(' '));
          }
        }
        await helpers.writeToTxtFile(file, dataOut);
        if (dataList === undefined) {
          console.error('There is no Data for this Project / project does not exist ....');
        } else if (dataList.length > 0) {
          console.log('Test run completed and s3 report being sent .....');
          await helpers.klassiEmail();
        }
      }
    );
  },
};
