let errorCount = 0;
let totalErrorCout = 0;

module.exports = {
  getAccessibilityError() {
    return errorCount;
  },
  getAccessibilityTotalError() {
    return totalErrorCout;
  },
  /** main method to be called for accessibility report */
  async getAccessibilityReport(PageName) {
    errorCount = 0;
    if (PageName == null) {
      // eslint-disable-next-line no-param-reassign
      PageName = 'PageNameNotAvailable';
    }
    // eslint-disable-next-line global-require
    const axeSource = require('axe-core').source;

    await browser.execute(axeSource);
    const results = await browser.executeAsync(function (done) {
      // run axe on our site
      // eslint-disable-next-line func-names,no-shadow
      axe.run(function (err, results) {
        if (err) done(err);
        done(results);
      });
    });

    const additionalData = await browser.capabilities;
    const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
    console.log('Generating Axe Report');
    const reportLiteType = mailList.AccessibilityLiteReport;
    if (reportLiteType === 'Yes') {
      await module.exports.GenerateFinalAccessibilityLiteReport(results, additionalData, PageName, browserName);
    } else {
      await module.exports.GenerateFinalAccessibilityReport(results, additionalData, PageName, browserName);
    }

    errorCount = results.violations.length + results.incomplete.length;
    totalErrorCout += errorCount;
  },

  async GenerateFinalAccessibilityReport(fullData, additionalData, Pagename, browserName) {
    // eslint-disable-next-line global-require
    const fs = require('fs-extra');
    // eslint-disable-next-line global-require
    const path = require('path');
    const sample = fs.readFileSync(path.resolve(__dirname, './ReportSample'), 'utf-8');

    const addDataInHtml = sample.replace('XXX-DetailData', JSON.stringify(fullData));
    let finalHtml = addDataInHtml.replace('XXX-AdditinalData', JSON.stringify(additionalData));
    finalHtml = finalHtml.replace('XXX-PageName', Pagename);

    //  let screenpic=await module.exports.takeScreenPic();
    //  finalHtml=finalHtml.replace('XXX-Pic',screenpic);
    const dirAcc = `${global.paths.reports}/${browserName}/accessibility`;
    if (!fs.existsSync(dirAcc)) {
      fs.ensureDirSync(dirAcc);
    }

    const curdatatime = module.exports.getCurrentDateTime();
    const fileName = `AccessbilityReport_${Pagename}-${browserName}_${curdatatime}`;

    fs.writeFile(`${dirAcc}/${fileName}.html`, finalHtml, 'utf-8', function (err) {
      if (err) throw err;
      else
        accessibilityReportList.push({
          filename: `${fileName}.html`,
          path: `${dirAcc}/${fileName}.html`,
        });
    });
    fs.writeFile(
      `${dirAcc}/AccessbilityReport_${Pagename}-${browserName}_${curdatatime}.json`,
      JSON.stringify(fullData, null, 4),
      'utf-8',
      function (err) {
        if (err) throw err;
      }
    );
  },

  async GenerateFinalAccessibilityLiteReport(fullData, additionalData, Pagename, browserName) {
    // eslint-disable-next-line global-require
    const fs = require('fs-extra');
    // eslint-disable-next-line global-require
    const path = require('path');
    const sample = fs.readFileSync(path.resolve(__dirname, './ReportSample-lite'), 'utf-8');
    const summaryViewInfo = await module.exports.htmlsummaryView(fullData);
    const summaryViewData = await module.exports.htmlsummaryData(fullData.testEnvironment, fullData);
    const violationdata = await module.exports.htmlDataRender(fullData.violations, 1000, 'Violation');
    const incompletedata = await module.exports.htmlDataRender(fullData.incomplete, 2000, 'Incomplete');

    // let addDataInHtml=sample.replace('XXX-DetailData',JSON.stringify(fullData));
    let addDataInHtml = sample.replace('XXXNoViolationRuleXXX', violationdata);
    addDataInHtml = addDataInHtml.replace('XXXNoIncompleteRuleXXX', incompletedata);
    addDataInHtml = addDataInHtml.replace('XXsystemDetailsXX', summaryViewData);
    addDataInHtml = addDataInHtml.replace('XXX-DetailCount', JSON.stringify(summaryViewInfo));

    let finalHtml = addDataInHtml.replace('XXX-AdditinalData', JSON.stringify(additionalData));
    finalHtml = finalHtml.replace('XXX-PageName', Pagename);

    //  let screenpic=await module.exports.takeScreenPic();
    //  finalHtml=finalHtml.replace('XXX-Pic',screenpic);
    const dirAcc = `${global.paths.reports}/${browserName}/accessibility`;
    if (!fs.existsSync(dirAcc)) {
      fs.ensureDirSync(dirAcc);
    }

    const curdatatime = module.exports.getCurrentDateTime();
    const fileName = `AccessbilityReport_${Pagename}-${browserName}_${curdatatime}`;

    fs.writeFile(`${dirAcc}/${fileName}.html`, finalHtml, 'utf-8', function (err) {
      if (err) throw err;
      else
        accessibilityReportList.push({
          filename: `${fileName}.html`,
          path: `${dirAcc}/${fileName}.html`,
        });
    });
    fs.writeFile(
      `${dirAcc}/AccessbilityReport_${Pagename}-${browserName}_${curdatatime}.json`,
      JSON.stringify(fullData, null, 4),
      'utf-8',
      function (err) {
        if (err) throw err;
      }
    );
  },

  /** This is depricated */
  GenerateAccessibilityReport(detailreport, Pagename) {
    // eslint-disable-next-line global-require
    const fs = require('fs-extra');
    const sample = fs.readFileSync('./Accessibility/ReportSample-lite', 'utf-8');
    const violationHtml = module.exports.CreateHTMLBase(detailreport.violations, 1000);
    const incompleteHtml = module.exports.CreateHTMLBase(detailreport.incomplete, 2000);
    const passedHtml = module.exports.CreateHTMLBase(detailreport.passes, 3000);
    const iapplicableHtml = module.exports.CreateHTMLBase(detailreport.inapplicable, 4000);
    let NewHtml = sample.replace('XXX-Violation', violationHtml);
    NewHtml = NewHtml.replace('XXX-Incomplete', incompleteHtml);
    NewHtml = NewHtml.replace('XXX-Passed', passedHtml);
    NewHtml = NewHtml.replace('XXX-Inapplicable', iapplicableHtml);
    const dirAcc = `${global.paths.reports}/Accessibility`;
    if (!fs.existsSync(dirAcc)) {
      fs.mkdirSync(dirAcc);
    }

    fs.writeFile(`${dirAcc}/AccessbilityReport_${Pagename}.html`, NewHtml, 'utf-8', function (err) {
      if (err) throw err;
    });
  },

  CreateHTMLBase(data, y) {
    let txt = '';
    // var y=0;
    let z = 0;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (x in data) {
      // eslint-disable-next-line no-param-reassign
      y += 1;
      z += 1;
      txt += '<div class="panel panel-default">';
      txt += '<div class="panel-heading" style="background-color:#F9E79F">';
      txt += '<h4 class="panel-title">';

      txt += '<a data-toggle="collapse" data-parent="#accordion" href="#collapse';
      txt += y;
      txt += '">';
      txt += `${z}: ${data[x].help.replace(/(<([^>]+)>)/gi, '')}`;
      // txt+= z+": "+(data[x].help).replace( /<>/ig, '');
      txt += '</a>';

      txt += '<div style="float: right">';
      txt += data[x].impact;
      txt += '</div>';
      txt += '</h4>';
      txt += '</div>';
      txt += '<div id="collapse';
      txt += y;
      txt += '" class="panel-collapse collapse ">';
      txt += '<div class="panel-body" style="background-color: #92a8d1">';
      txt += '<a href=';
      txt += data[x].helpUrl;
      txt += ' target="_blank">';

      txt += `<xmp>${data[x].help}</xmp>`;
      txt += '</a>';
      txt += '<div>';
      txt += `<xmp>${data[x].description}</xmp>`;
      txt += '</div>';
      txt += '<div>';
      txt += data[x].impact;
      txt += '</div>';
      txt += '<div style="overflow:auto">';
      txt += '<xmp>';
      txt += JSON.stringify(data[x].nodes, undefined, 2);
      txt += '</xmp>';
      txt += '</div>';
      txt += '</div>';

      txt += '</div>';

      txt += '</div>';
    }
    return txt;
  },

  /** fuction to attach screen shot into the acceesibility report */
  async takeScreenPic() {
    let picstring;
    await browser.takeScreenshot().then(function (screenShot) {
      picstring = screenShot;
    });
    return picstring;
  },

  /** to get current data time */
  getCurrentDateTime() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();

    if (dd < 10) {
      dd = `0${dd}`;
    }
    if (mm < 10) {
      mm = `0${mm}`;
    }
    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    return `${dd}/${mm}/${yyyy}-${hours}:${minutes}`.replace(/\//g, '').replace(/:/g, '').replace(' ', '');
  },

  htmlDataRender(data, y, type) {
    let panColor = '#F9E79F';
    let changeColor = false;
    if (type === 'Violation' || type === 'Incomplete') {
      changeColor = true;
    }
    let txt = '';
    // var y=0;
    let z = 0;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const x in data) {
      let ImpactMessage = '';

      if (data[x].impact != null && (type === 'Violation' || type === 'Incomplete')) {
        ImpactMessage = data[x].impact;

        if (changeColor) {
          if (data[x].impact === 'serious') {
            panColor = '#F78C75';
          }

          if (data[x].impact === 'critical') {
            panColor = '#F7994B';
          }
          if (data[x].impact === 'moderate') {
            panColor = '#F7CD4B';
          }
        }
      } else if (type === 'Passed') {
        panColor = '#A0F9AC';
      }

      // eslint-disable-next-line no-param-reassign
      y += 1;
      z += 1;

      txt += '<div class="panel panel-default">';
      txt += `<div class="panel-heading" style="background-color:${panColor}"`;
      txt += '>';
      txt += '<h4 class="panel-title">';

      txt += '<a data-toggle="collapse" data-parent="#accordion" href="#collapse';
      txt += y;
      txt += '">';
      txt += `${z}. ${data[x].help.replace(/(<([^>]+)>)/gi, '')}`;
      // txt+= z+": "+(data[x].help).replace( /<>/ig, '');
      txt += '</a>';

      txt += '<div style="float: right">';
      txt += ImpactMessage;
      txt += '</div>';
      txt += '</h4>';
      txt += '</div>';
      txt += '<div id="collapse';
      txt += y;
      txt += '" class="panel-collapse collapse">';
      txt += '<div class="panel-body" style="background-color: #F3EBD0">';
      txt += '<a href=';
      txt += data[x].helpUrl;
      txt += ' target="_blank">';

      txt += `<xmp>${data[x].help}</xmp>`;
      txt += '</a>';
      txt += '<div>';
      txt += `<xmp>${data[x].description}</xmp>`;
      txt += '</div>';
      txt += '<div>';
      txt += data[x].impact;
      txt += '</div>';
      txt += '<div style="overflow:auto">';
      txt += '<xmp>';
      txt += JSON.stringify(data[x].nodes, undefined, 2);
      txt += '</xmp>';
      txt += '</div>';
      txt += '</div>';

      txt += '</div>';

      txt += '</div>';

      /* txt +="<div>"
      txt+= data[x].help;
      txt+="</dev>" */
      panColor = '#F9E79F';
    }
    return txt;
  },

  htmlsummaryView(data) {
    const countData = {
      ViolatedRuleCount: 0,
      IncompleteRuleCount: 0,
      PassesRuleCount: 0,
    };
    if (data.violations.length === undefined) {
      countData.ViolatedRuleCount = 0;
    } else {
      countData.ViolatedRuleCount = data.violations.length;
    }
    if (data.incomplete.length === undefined) {
      countData.IncompleteRuleCount = '0';
    } else {
      countData.IncompleteRuleCount = data.incomplete.length;
    }

    if (data.passes.length === undefined) {
      countData.PassesRuleCount = '0';
    } else {
      countData.PassesRuleCount = data.passes.length;
    }
    return countData;
  },

  htmlsummaryData(jsonObject, jsonDetail) {
    let txthtml = '';
    txthtml += `<p>URL :${jsonDetail.url}</p>`;
    txthtml += `<p>DateTime :${jsonDetail.timestamp}</p>`;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in jsonObject) {
      //	console.log(key, jsonObject[key]);
      txthtml += `<p>${key} : ${jsonObject[key]}</p>`;
    }

    // document.getElementById("systemDetails").innerHTML=;
    return txthtml;
  },
};
