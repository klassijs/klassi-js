/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
const axe = require('axe-core');
const fs = require('fs');
const path = require('path');

let errorCount = 0;
let totalErrorCount = 0;

const envName = env.envName.toLowerCase();

module.exports = {
  /** main method to be called for accessibility report */
  async getAccessibilityReport(pageName) {
    errorCount = 0;
    if (pageName == null) {
      pageName = 'pageNameNotAvailable';
    }
    await browser.execute(require('axe-core').source);
    let results = await browser.executeAsync((done, err) => {
      if (err) {
        done(err);
      } else {
        axe.configure({ reporter: 'v2', noHtml: true });
        axe.run(document, (err, results) => {
          if (err) done(err);
          done(results);
        });
      }
    });

    const additionalData = await browser.capabilities;
    const browserName = settings.remoteConfig || BROWSER_NAME;
    console.log('Generating Axe Report........');
    module.exports.generatelAccessibilityReport(results, additionalData, pageName, browserName);

    errorCount = results.violations.length + results.incomplete.length;
    totalErrorCount += errorCount;
  },

  getAccessibilityError() {
    return errorCount;
  },
  getAccessibilityTotalError() {
    return totalErrorCount;
  },

  generatelAccessibilityReport(fullData, additionalData, pageName, browserName) {
    const sample = fs.readFileSync(path.resolve(__dirname, './ReportSample'), 'utf-8');
    const addDataInHtml = sample.replace('XXX-DetailData', JSON.stringify(fullData));

    let finalHtml = addDataInHtml.replace('XXX-AdditinalData', JSON.stringify(additionalData));
    finalHtml = finalHtml.replace('XXX-PageName', pageName);

    const dirAcc = `${paths.reports}/${browserName}/${envName}/accessibilityReport`;
    const datatime = helpers.reportDateTime();
    const fileName = `${pageName}-${browserName}_${datatime}`;

    if (!fs.existsSync(dirAcc)) {
      fs.mkdirSync(dirAcc);
    }
    fs.writeFileSync(dirAcc + '/' + fileName + '.json', JSON.stringify(fullData, null, 4));
    fs.writeFileSync(
      dirAcc + '/' + fileName + '.html',
      finalHtml,
      'utf-8',
      accessibilityReportList.push({
        filename: `${fileName}.html`,
        path: `${dirAcc}/${fileName}.html`,
      })
    );
  },
};
