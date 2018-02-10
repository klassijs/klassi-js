"use strict";

module.exports = {
  
  /**
   * Getting the Response Timing
   */
  resTime: function () {
    let endPoint = (envConfig.ga_narnia_api_base_url + shared.apiData.url.baseUrl + shared.apiData.url.docId);
    
    let options = {
      method: 'GET',
      url: endPoint,
      json: true,
      time: true,
      resolveWithFullResponse: true
    };
    
    return request(options)
    .then(function (res, err) {
      if (err){
        log.error('Help am Drowning ', err)
      }
      log.info(res.timings.response);
      return res;
    });
  },
  
  /**
   * Getting the Status Code
   */
  staCode: function () {
    return page.getMethod.resTime().then(function (res, err) {
      if (err) {
        log.error('Help am Drowning ', err);
      }
      else if (expect(res.statusCode).to.equal(200)) {
        log.info(res.statusCode);
      } else {
        log.error('Assert error - ', res.AssertionError);
      }
    })
  },
  
  /**
   * Getting the Content of the API
   */
  contApi: function () {
    driver.timeouts(3000);
    return page.getMethod.resTime().then(function (res, err) {
      if (err){
        log.error('Help am Drowning ', err);
      }else {
        log.info('content:- ', res.body);
      }
    })
  },
  
  /**
   * Getting the Data Type of the API
   */
  apiDataType: function () {
    return page.getMethod.resTime().then(function (res, err) {
      if (err){
        log.error('Help am Drowning ', err);
      }else{
        expect(res.body.additionalMetaTags).to.be.a('string');
        expect(res.body.midPageUnit).to.be.a('string');
        expect(res.body.pageTitle).to.be.a('string');
        expect(res.body.leftHandNavigation).to.be.a('string');
        expect(res.body.rightHandColumn).to.be.a('string');
        expect(res.body.publishDate).to.be.a('string');
        expect(res.body.url).to.be.a('string');
        expect(res.body.success).to.be.a('boolean');
        expect(res.body.fromCache).to.be.a('boolean');
      }
    })
  },
  
  contCode: function () {
    return page.getMethod.resTime().then(function (res, err) {
      if (err){
        log.error('Help am Drowning ', err);
      }else {
        
        log.info('Status Code: ' + res.statusCode);
        expect(res.statusCode).to.equal(200);
        log.info('Response: ' + res.body.midPageUnit);
      }
    })
  }
  
};
