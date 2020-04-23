
let errorCount =0;
let totalErrorCout=0;
module.exports = {
 
  getAccessibilityError: function(){

    return errorCount;
  },
  getAccessibilityTotalError: function(){

    return totalErrorCout;
  },
  /** main method to be called for accessibility report */
  getAccessibilityReport: async function(PageName){
    errorCount=0;
    if(PageName==null){
      PageName='PageNameNotAvailable';
    }
    const axeSource = require('axe-core').source;

    await browser.execute(axeSource);
    let results = await browser.executeAsync(function (done) {
      // run axe on our site
      axe.run(function (err, results) {
        if (err) done(err);
        done(results);
      });
    });

    // console.log(results);
    //this.attach(JSON.stringify(results.violations,undefined,4));
    let additionalData=await browser.capabilities;
    let browserName=additionalData.browserName;
    console.log('Generating Axe Report');
    // console.log(additionalData);
    //AccessLib.GenerateAccessibilityReport(results,Pname);
    await module.exports.GenerateFinalAccessibilityReport(results,additionalData,PageName,browserName);

    errorCount= results.violations.length +results.incomplete.length;
    totalErrorCout=totalErrorCout+errorCount;
  }, 
  GenerateFinalAccessibilityReport: async function (fullData,additionalData,Pagename,browserName){
    let fs = require('fs');
    const path = require('path');
    const sample = fs.readFileSync(path.resolve(__dirname, './ReportSample'),'utf-8');

    let addDataInHtml=sample.replace('XXX-DetailData',JSON.stringify(fullData));
    let finalHtml=addDataInHtml.replace('XXX-AdditinalData',JSON.stringify(additionalData));
    finalHtml=finalHtml.replace('XXX-PageName',Pagename);

    let screenpic=await module.exports.takeScreenPic();
    //console.log(screenpic);
    finalHtml=finalHtml.replace('XXX-Pic',screenpic);
    let dirAcc=global.paths.reports+'/accessibility';
    if (!fs.existsSync(dirAcc)){
      fs.mkdirSync(dirAcc);
    }

    let curdatatime= module.exports.getCurrentDateTime();
    let fileName= 'AccessbilityReport_'+Pagename+'-'+browserName+'_'+curdatatime;

    fs.writeFile(dirAcc+'/'+fileName+'.html',finalHtml, 'utf-8', function(err){
      if(err) throw err; 
      else accessibilityReportList.push(
        {
          filename: fileName+'.html',
          path: dirAcc+'/'+fileName+'.html'
        }
      );
      
    });
    fs.writeFile(dirAcc+'/AccessbilityReport_'+Pagename+'-'+browserName+'_'+curdatatime+'.json',JSON.stringify(fullData,null, 4), 'utf-8', function(err){
      if(err) throw err; 
      
    });
    
  },
  /** This is depricated */
  GenerateAccessibilityReport: function (detailreport,Pagename) {
    let fs = require('fs');
    const sample = fs.readFileSync('./Accessibility/ReportSample', 'utf-8');
    let violationHtml = module.exports.CreateHTMLBase(detailreport.violations, 1000);
    let incompleteHtml = module.exports.CreateHTMLBase(detailreport.incomplete, 2000);
    let passedHtml = module.exports.CreateHTMLBase(detailreport.passes, 3000);
    let iapplicableHtml = module.exports.CreateHTMLBase(detailreport.inapplicable, 4000);
    let NewHtml = sample.replace('XXX-Violation', violationHtml);
    NewHtml = NewHtml.replace('XXX-Incomplete', incompleteHtml);
    NewHtml = NewHtml.replace('XXX-Passed', passedHtml);
    NewHtml = NewHtml.replace('XXX-Inapplicable', iapplicableHtml);
    let dirAcc=global.paths.reports+'/Accessibility';
    if (!fs.existsSync(dirAcc)){
      fs.mkdirSync(dirAcc);
    }

    fs.writeFile(dirAcc+'/AccessbilityReport_'+Pagename+'.html',NewHtml, 'utf-8', function(err){
      if(err) throw err; 
      
    });

  },
  CreateHTMLBase: function (data, y) {
    var txt = '';
    //var y=0;
    var z = 0;
    for (x in data) {
      y = y + 1;
      z = z + 1;
      txt += '<div class="panel panel-default">';
      txt += '<div class="panel-heading" style="background-color:#F9E79F">';
      txt += '<h4 class="panel-title">';

      txt += '<a data-toggle="collapse" data-parent="#accordion" href="#collapse';
      txt += y;
      txt += '">';
      txt += z + ': ' + (data[x].help).replace(/(<([^>]+)>)/ig, '');
      //txt+= z+": "+(data[x].help).replace( /<>/ig, '');
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

      txt += '<xmp>' + data[x].help + '</xmp>';
      txt += '</a>';
      txt += '<div>';
      txt += '<xmp>' + data[x].description + '</xmp>';
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

      /*txt +="<div>"
            txt+= data[x].help;
            txt+="</dev>"*/
    }
    return txt;
  },

  /** fuction to attach screen shot into the acceesibility report */
  takeScreenPic: async function(){
    let picstring;
    await browser.takeScreenshot().then(function(screenShot) {
      picstring=screenShot;
    });
    return picstring;
  },
  
  /** to get current data time */
  getCurrentDateTime: function (){
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();

    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return (dd + '/' + mm + '/' + yyyy + '-' + hours + ':' + minutes + ':' + seconds).replace(/\//g, '').replace(/:/g, '').replace(' ', '');
  }
  
};