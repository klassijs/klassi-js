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
const resemble = require('node-resemble-js');
const fs = require('fs-extra');
const program = require('commander');
const confSettings = require('./confSettings.js');
const log = require('./logger').oupLog();

const browserName = global.settings.remoteConfig || global.BROWSER_NAME;

const baselineDir = `./visual-regression-baseline/${browserName}/`;
const resultDir = `./artifacts/visual-regression/original/${browserName}/`;
const resultDirPositive = `${resultDir}positive/`;
const resultDirNegative = `${resultDir}negative/`;
const diffDir = `./artifacts/visual-regression/diffs/${browserName}/`;
const diffDirPositive = `${diffDir}positive/`;
const diffDirNegative = `${diffDir}negative/`;

// eslint-disable-next-line camelcase
let file_name;
let diffFile;

module.exports = {
  /**
   * Take an image of the current page and saves it as the given filename.
   * @method saveScreenshot
   * @param {string} filename The complete path to the file name where the image should be saved.
   * @param elementsToHide
   * @param filename
   * @returns {Promise<void>}
   */
  saveScreenshot: async (filename, elementsToHide) => {
    if (elementsToHide) {
      await confSettings.hideElements(elementsToHide);
    }
    fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
    const resultPathPositive = `${resultDirPositive}${filename}`;
    await browser.saveScreenshot(resultPathPositive, (err) => {
      if (err) {
        log.error(err.message);
      }
    });
    if (elementsToHide) {
      await confSettings.showElements(elementsToHide);
    }
    log.info(`\t images saved to: ${resultPathPositive}`);
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
    // eslint-disable-next-line camelcase
    file_name = filename;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
    fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
    this.expected = expected || 0.1; // misMatchPercentage tolerance default 0.3%
    if (!fs.existsSync(baselinePath)) {
      // create new baseline image if none exists
      log.info('\t WARNING: Baseline image does NOT exist.');
      log.info(`\t Creating Baseline image from Result: ${baselinePath}`);
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
      // eslint-disable-next-line func-names
      .onComplete(async (res) => {
        // eslint-disable-next-line no-param-reassign
        result = await res;
      });
    /**
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line func-names
    this.value = async function () {
      // eslint-disable-next-line no-param-reassign,camelcase
      filename = await file_name;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      // eslint-disable-next-line no-shadow
      const resultPathPositive = `${resultDirPositive}${filename}`;
      while (typeof result === 'undefined') {
        // eslint-disable-next-line no-await-in-loop
        await browser.pause(DELAY_100ms);
      }
      const error = parseFloat(result.misMatchPercentage); // value this.pass is called with
      fs.ensureDirSync(diffDirNegative); // Make sure destination folder exists, if not, create it

      if (error > this.expected) {
        diffFile = `${diffDirNegative}${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        await result.getDiffImage().pack().pipe(writeStream);
        // eslint-disable-next-line func-names
        writeStream.on('error', function (err) {
          console.log('this is the writeStream error ', err);
        });
        fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
        fs.removeSync(resultPathNegative);
        fs.moveSync(resultPathPositive, resultPathNegative);
        log.info(`\t Create diff image [negative]: ${diffFile}`);
      } else {
        diffFile = `${diffDirPositive}${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        result.getDiffImage().pack().pipe(writeStream);
        // eslint-disable-next-line func-names
        writeStream.on('error', function (err) {
          console.log('this is the writeStream error ', err);
        });
      }
    };
    /**
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line func-names
    this.pass = async function () {
      // eslint-disable-next-line no-param-reassign
      value = parseFloat(result.misMatchPercentage);
      this.message = `image Match Failed for ${filename} with a tolerance difference of ${`${
        value - this.expected
      } - expected: ${this.expected} but got: ${value}`}`;
      // eslint-disable-next-line no-shadow
      const baselinePath = `${baselineDir}${filename}`;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      const pass = value <= this.expected;
      const err = value > this.expected;

      if (pass) {
        log.info(`image Match for ${filename} with ${value}% difference.`);
        await browser.pause(DELAY_1s);
      }

      if (err === true && program.updateBaselineImage) {
        log.error(
          console.log(
            `${this.message}   images at:\n` +
              `   Baseline: ${baselinePath}\n` +
              `   Result: ${resultPathNegative}\n` +
              `    cp ${resultPathNegative} ${baselinePath}`
          )
        );
        // eslint-disable-next-line no-shadow
        await fs.copy(resultPathNegative, baselinePath, (err) => {
          log.info(` All Baseline images have now been updated from: ${resultPathNegative}`);
          if (err) {
            log.error('The Baseline images were NOT updated: ', err.message);
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
        // eslint-disable-next-line no-throw-literal
        throw `${err} - ${this.message}`;
      }
    };
  },
};
