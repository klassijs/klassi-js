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
const resemble = require('node-resemble-js');
const fs = require('fs-extra');
const program = require('commander');

const browserName = global.settings.remoteConfig || global.BROWSER_NAME;

const baselineDir = `./visual-regression-baseline/${browserName}/`;
const resultDir = `./artifacts/visual-regression/original/${browserName}/`;
const resultDirPositive = `${resultDir}positive/`;
const resultDirNegative = `${resultDir}negative/`;
const diffDir = `./artifacts/visual-regression/diffs/${browserName}/`;
const diffDirPositive = `${diffDir}positive/`;
const diffDirNegative = `${diffDir}negative/`;

// eslint-disable-next-line camelcase
let fileName;
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
  takeScreenshot: async (filename, elementsToHide) => {
    if (elementsToHide) {
      await helpers.hideElements(elementsToHide);
    }
    fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
    const resultPathPositive = `${resultDirPositive}${filename}`;
    await browser.saveScreenshot(resultPathPositive, (err) => {
      if (err) {
        log.error(err.message);
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
    fileName = filename;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    fs.ensureDirSync(baselineDir); // Make sure destination folder exists, if not, create it
    fs.ensureDirSync(diffDirPositive); // Make sure destination folder exists, if not, create it
    this.expected = expected || 0.1; // misMatchPercentage tolerance default 0.3%
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
      // eslint-disable-next-line no-param-reassign
      filename = await fileName;
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
        writeStream.on('error', (err) => {
          console.log('this is the writeStream error ', err);
        });
        fs.ensureDirSync(resultDirNegative); // Make sure destination folder exists, if not, create it
        fs.removeSync(resultPathNegative);
        fs.moveSync(resultPathPositive, resultPathNegative);
        console.log(`\t Create diff image [negative]: ${diffFile}`);
      } else {
        diffFile = `${diffDirPositive}${filename}`;

        const writeStream = fs.createWriteStream(diffFile);
        result.getDiffImage().pack().pipe(writeStream);
        // eslint-disable-next-line func-names
        writeStream.on('error', (err) => {
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
        console.log(`image Match for ${filename} with ${value}% difference.`);
        await browser.pause(DELAY_1s);
      }

      if (err === true && program.opts().updateBaselineImages) {
        console.log(
          `${this.message}   images at:\n` +
            `   Baseline: ${baselinePath}\n` +
            `   Result: ${resultPathNegative}\n` +
            `    cp ${resultPathNegative} ${baselinePath}`
        );
        // eslint-disable-next-line no-shadow
        await fs.copy(resultPathNegative, baselinePath, (err) => {
          console.log(` All Baseline images have now been updated from: ${resultPathNegative}`);
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
