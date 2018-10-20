/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

const
  resemble = require('node-resemble-js'),
  fs = require('fs-extra'),
  browserName = settings.browserName,
  log = global.log;

const
  baselineDir = `./visual-regression-baseline/${browserName}/`,
  resultDir = `./artifacts/visual-regression/new-screens/${browserName}/`,
  resultDirPositive = `${resultDir}positive/`,
  resultDirNegative = `${resultDir}negative/`,
  diffDir = `./artifacts/visual-regression/diffs/${browserName}/`,
  diffDirPositive = `${diffDir}positive/`,
  diffDirNegative = `${diffDir}negative/`;

let file_name, res, diffFile;

module.exports ={
  /**
   * Take a screenshot of the current page and saves it as the given filename.
   * @method saveScreenshot
   * @param {string} filename The complete path to the file name where the screenshot should be saved.
   * @param filename
   * @returns {Promise<void>}
   */
  saveScreenshot: async function(filename) {
    fs.ensureDirSync(resultDirPositive); // Make sure destination folder exists, if not, create it
    const resultPathPositive = `${resultDirPositive}${filename}`;
    await driver.saveScreenshot(resultPathPositive, err => {
      if (err){
        log.error(err.message);
      }
    });
    log.info(`\tScreenshot saved to: ${resultPathPositive}`);
  },
  
  /**
   * Runs assertions and comparison checks on the taken screenshots
   * @param filename
   * @param expected
   * @returns {Promise<void>}
   */
  assertion: async function(filename, expected) {
    file_name = filename;
    const baselinePath = `${baselineDir}${filename}`;
    const resultPathPositive = `${resultDirPositive}${filename}`;
    fs.ensureDirSync(baselineDir);
    fs.ensureDirSync(diffDirPositive);
  
    this.expected = expected || 0.1; // misMatchPercentage tolerance default 0.3%
    if (!fs.existsSync(baselinePath)) {  // create new baseline image if none exists
      log.info('\tWARNING: Baseline image does NOT exist.');
      log.info(`\tCreating Baseline image from Result: ${baselinePath}`);
      fs.writeFileSync(baselinePath, fs.readFileSync(resultPathPositive));
    }
    resemble.outputSettings({
      errorColor: {
        red: 225,
        green: 0,
        blue: 255
      },
      errorType: 'movement',
      transparency: 0.1,
      largeImageThreshold: 1200
    });
    resemble(baselinePath)
      .compareTo(resultPathPositive)
      .ignoreAntialiasing()
      .ignoreColors()
      .onComplete(async function (result, err) {
        if (err) {
          log.error('HELP AM DROWNING!!! ' + err.message);
        } else {
          res = await result;
        }
      });
  
    /**
     *
     * @param result
     * @returns {Promise<void>}
     */
    this.value = async function (result) {
      filename = await file_name;
      res = await result;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      const resultPathPositive = `${resultDirPositive}${filename}`;
      await driver.pause(500);
      const error = parseFloat(res.misMatchPercentage); // value this.pass is called with
      fs.ensureDirSync(diffDirNegative);
    
      if (error > this.expected) {
        diffFile = `${diffDirNegative}${filename}`;
        res
          .getDiffImage()
          .pack()
          .pipe(fs.createWriteStream(diffFile));
        
        fs.ensureDirSync(resultDirNegative);
        fs.removeSync(resultPathNegative);
        fs.moveSync(resultPathPositive, resultPathNegative);
        log.info(`\tCreate diff image [negative]: ${diffFile}`);
      }
      else {
        diffFile = `${diffDirPositive}${filename}`;
        res
          .getDiffImage()
          .pack()
          .pipe(fs.createWriteStream(diffFile));
      }
    };
  
    /**
     *
     * @param value
     * @returns {Promise<boolean>}
     */
    this.pass = async function (value) {
      res = await res;
      value = parseFloat(res.misMatchPercentage);
      this.message = `Screenshot Match Failed for ${filename} with a tolerance difference of ${
        (value - this.expected) + ' - expected: ' + this.expected + ' but got: ' + (value)}`;
      const baselinePath = `${baselineDir}${filename}`;
      const resultPathNegative = `${resultDirNegative}${filename}`;
      const pass = value <= this.expected;
      const err = value > this.expected;
    
      if (pass) {
        log.info(`Screenshots Matched for ${filename} with ${value}% difference.`);
      }
      if (err === true) {
        log.error(console.log(
          this.message +
          '   Screenshots at:\n' +
          `    Baseline: ${baselinePath}\n` +
          `    Result: ${resultPathNegative}\n` +
          `    Diff: ${diffFile}\n` +
          `   Open ${diffFile} to see how the screenshot has changed.\n` +
          '   If the Result Screenshot is correct you can use it to update the Baseline Screenshot and re-run your test:\n' +
          `    cp ${resultPathNegative} ${baselinePath}` ));
      
        if (settings.updateBaselineImage) {
          log.info(`All Baseline Screenshots have now been updated from: ${resultPathNegative}`);
          fs.copy(resultPathNegative, baselinePath, err => {
            if (err) {
              log.error(err.message);
              console.log(err.message);
              throw err;
            }
          });
        }
        throw err + ' - ' + this.message;
      }
      return pass;
    };
  }
  
};