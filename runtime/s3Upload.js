/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const path = require('path');
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const async = require('async');
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

/**
 * function to upload the test report folder to an s3 Bucket - AWS
 */
module.exports = {
  s3Upload: async () => {
    let envName = env.envName.toLowerCase();
    let date = require('./helpers').s3BucketCurrentDate();
    const browserName = settings.remoteConfig || BROWSER_NAME;
    const rootFolder = path.resolve('./reports');
    const folderName = `${date}/${dataconfig.s3FolderName}/reports/`;
    const BUCKET = s3Data.S3_BUCKET;
    const S3_KEY = process.env.S3_KEY;
    const S3_SECRET = process.env.S3_SECRET;
    const uploadFolder = `./${browserName}/`;

    const s3Client = new S3Client({
      region: s3Data.S3_REGION || ' ',
      credentials: {
        accessKeyId: S3_KEY,
        secretAccessKey: S3_SECRET,
      },
    });
    async function mybucketList() {
      try {
        const data = await s3Client.send(new ListBucketsCommand({}));
        return data.Buckets; // For unit tests.
      } catch (err) {
        console.error('Error ', err.message);
      }
    }

    async function filesToRemove() {
      const filePath = rootFolder + '/' + browserName + '/' + envName;
      const filelist = fs.readdirSync(filePath);
      // console.log('this is the list of files ============> ', filelist);
      for (let i = 0; i < filelist.length; i++) {
        let filename = filelist[i];

        if (filename.endsWith('.html.json')) {
          fs.removeSync(path.resolve(filePath, filename));
        }
      }
    }

    let dirToRemove = rootFolder + '/' + browserName + '/' + envName + 'Combine';
    async function getFiles(dirPath) {
      if (await fs.existsSync(dirToRemove)) {
        await fs.rmSync(dirToRemove, { recursive: true });
      }
      return fs.existsSync(dirPath) ? readdir(dirPath) : [];
    }
    async function deploy(upload) {
      await filesToRemove();
      const filesToUpload = await getFiles(path.resolve(rootFolder, upload));
      await async.eachOfLimit(filesToUpload, 20, async (file) => {
        const Key = await file.replace(`${rootFolder}/`, '');
        console.log(`uploading: [${Key}]`);
        const uploadParams = {
          Bucket: BUCKET,
          Key: folderName + Key,
          Body: fs.readFileSync(file),
        };
        try {
          await s3Client.send(new PutObjectCommand(uploadParams));
        } catch (err) {
          console.error('Error', err.message);
        }
      });
    }
    const mybucket = await mybucketList();
    const bucketExists = mybucket.some((bucket) => bucket.Name === s3Data.S3_BUCKET);
    if (!bucketExists) {
      console.log('The s3 bucket does not exist');
      return;
    }
    deploy(uploadFolder)
      .then(() => {
        console.log('Report files uploaded successfully to s3 Bucket');
      })
      .catch((err) => {
        console.error(err.message);
      });
  },
};
