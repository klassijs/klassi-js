/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const resemble = require('node-resemble-js');
const fs = require('fs-extra');
const program = require('commander');

const envName = env.envName.toLowerCase();

let fileName;
let diffFile;
let browserName;

module.exports = {
  /**
   * Take an image of the current page and saves it as the given filename.
   * @method saveScreenshot
   * @param {string} filename The complete path to the file name where the image should be saved.
   * @param elementsToHide
   * @param filename
   * @returns {Promise<void>}
   */
  takePageImage: async (filename, elementsToHide) => {
    const getRemote = require('./getRemote');
    const remoteService = getRemote(settings.remoteService);

    if (remoteService && remoteService.type === 'lambdatest') {
      browserName = settings.remoteConfig || BROWSER_NAME;
      await browserName;
    } else {
      browserName = settings.remoteConfig || program.opts().browser;
    }

    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;

    if (elementsToHide) {
      await helpers.hideElements(elementsToHide);
    }
    fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
    const resultPathPositive = `${resultDirPositive}${filename}`;
    await browser.saveScreenshot(resultPathPositive, async (err) => {
      await browser.pause(DELAY_500ms);
      if (err) {
        console.error(err.message);
      }
    });

    if (elementsToHide) {
      await helpers.showElements(elementsToHide);
    }
    console.log(`\t images saved to: ${resultPathPositive}`);
  },

  /**
   * Runs assertions and comparison checks on the taken images
   * @param filename
   * @param expected
   * @param result
   * @param value
   * @returns {Promise<void>}
   */
  assertion(filename, expected, result, value) {
    const baselineDir = `./visual-regression-baseline/${browserName}/${envName}/`;
    const resultDir = `./artifacts/visual-regression/original/${browserName}/${envName}/`;
    const resultDirPositive = `${resultDir}positive/`;
    const resultDirNegative = `${resultDir}negative/`;

    const diffDir = `./artifacts/visual-regression/diffs/${browserName}/${envName}/`;
    const diffDirPositive = `${diffDir}positive/`;
    const diffDirNegative = `${diffDir}negative/`;

    fileName = filename;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
    fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
    this.expected = 0.2 || expected; // misMatchPercentage tolerance default 0.3%
    if (!fs.existsSync(baselinePath)) {
      // create new baseline image if none exists
      console.log('\t WARNING: Baseline image does NOT exist.');
      console.log(`\t Creating Baseline image from Result: ${baselinePath}`);
      fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
    }
    resemble.outputSettings({
      errorColor: {
        red: 225,
        green: 0,
        blue: 225,
      },
      errorType: 'movement',
      transparency: 0.1,
      largeImageThreshold: 1200,
    });
    resemble(baselinePath)
      .compareTo(resultPathPositive)
      .ignoreAntialiasing()
      .ignoreColors()
      .onComplete(async (res) => {
        result = await res;
      });
    /**
     * @returns {Promise<void>}
     */
    this.value = async function () {
      filename = await fileName;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      const resultPathPositive = `${resultDirPositive}${filename}`;
      while (typeof result === 'undefined') {
        await browser.pause(DELAY_100ms);
      }
      const error = parseFloat(result.misMatchPercentage); // value this.pass is called with
      fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it

      if (error > this.expected) {
        diffFile = `${diffDirNegative}${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        await result.getDiffImage().pack().pipe(writeStream);
        writeStream.on('error', (err) => {
          console.log('this is the writeStream error ', err);
        });
        fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
        fs.removeSync(resultPathNegative);
        fs.moveSync(resultPathPositive, resultPathNegative, false);
        console.log(`\t Create diff image [negative]: ${diffFile}`);
      } else {
        diffFile = `${diffDirPositive}${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        result.getDiffImage().pack().pipe(writeStream);
        writeStream.on('error', (err) => {
          console.log('this is the writeStream error ', err);
        });
      }
    };
    /**
     * @returns {Promise<boolean>}
     */
    this.pass = async function () {
      value = parseFloat(result.misMatchPercentage);
      this.message = `image Match Failed for ${filename} with a tolerance difference of ${`${
        value - this.expected
      } - expected: ${this.expected} but got: ${value}`}`;
      const baselinePath = `${baselineDir}${filename}`;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      const pass = value <= this.expected;
      const err = value > this.expected;

      if (pass) {
        console.log(`image Match for ${filename} with ${value}% difference.`);
        await browser.pause(DELAY_1s);
      }

      if (err === true && program.opts().updateBaselineImage) {
        console.log(
          `${this.message}   images at:\n` +
            `   Baseline: ${baselinePath}\n` +
            `   Result: ${resultPathNegative}\n` +
            `    cp ${resultPathNegative} ${baselinePath}`
        );
        await fs.copy(resultPathNegative, baselinePath, (err) => {
          console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
          if (err) {
            console.error('The Baseline images were NOT updated: ', err.message);
            throw err;
          }
        });
      } else if (err) {
        console.log(
          `${this.message}   images at:\n` +
            `   Baseline: ${baselinePath}\n` +
            `   Result: ${resultPathNegative}\n` +
            `   Diff: ${diffFile}\n` +
            `   Open ${diffFile} to see how the image has changed.\n` +
            '   If the Resulting image is correct you can use it to update the Baseline image and re-run your test:\n' +
            `    cp ${resultPathNegative} ${baselinePath}`
        );
        throw `${err} - ${this.message}`;
      }
    };
  },
};
