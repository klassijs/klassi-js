/**
 * Klassi Automated Testing Tool
 * Created by Larry Goddard
 * Contributors:
 */
'use strict';

module.exports = {

    /** returns a promise that is called when the url has loaded and the body element is present
     * @param {string} url to load
     * @returns {Promise}
     * @example
     *      helpers.loadPage('http://www.google.co.uk');
     */
    loadPage: function(url, seconds){
        /** Wait function - measured in seconds for pauses during tests to give time for processes such as
         * a page loading or the user to see what the test is doing
         * @param seconds
         * @type {number}
         */
         let timeout = (seconds) ? (seconds * 1000) : DEFAULT_TIMEOUT;

         /** load the url and wait for it to complete
          */
         return driver.url(url, function(){

             /** now wait for the body element to be present
              */
             return driver.waitUntil(driver.element('body'), timeout);
         });
    },

    /**
     * Images of each page for regression testing
     * @returns {*|{screenshotRoot, failedComparisonsRoot, misMatchTolerance, screenWidth}}
     */
    cssImages: function(pageName){
        return driver.webdrivercss(pageName, {
            name: '',
            elem: ''
        })
    },

    /**
     * the Global CMS login feature
     * List of variables to be passed into the function
     * @param {string} url to load, {string} webTime, {string} modalForm
     * @param {string} username, {string} psw, {string} password {string} loginBtn
     */
    cmsLogin: function(modalForm, usn, username, psw, password, loginBtn) {
        return driver.waitForExist(modalForm, 5000).then(function () {
            return driver.waitForVisible(usn).then(function () {
                return driver.setValue(usn, username).then(function () {
                    return driver.setValue(psw, password).then(function () {
                        return driver.click(loginBtn).pause(3000)
                    })
                })
            })
        })
    },
  
  /**
   * writeTextFile write data to file on hard drive
   * @param  string  filepath   Path to file on hard drive
   * @param  string   output     Data to be written
   */
  writeTextFile: function(filepath, output) {
      let fs = require('fs');
    fs.writeFile(filepath, output, function(err) {
      if (err) throw err;
    })
  },
  
  // /**
  //  * readTextFile read data from file
  //  * @param  string   filepath   Path to file on hard drive
  //  * @return string              String with file data
  //  */
  // readTextFile: function(filepath) {
  //   let data = fs.readFileSync(filepath, 'utf8');
  //
  //     console.log('file content ', data);
  // },

  /** clicks an element (or multiple if present) that is not visible,
     * useful in situations where a menu needs a hover before a child link appears
     * @param {string} css selector used to locate the elements
     * @param {string} text to match inner content (if present)
     * @example
     *    helpers.clickHiddenElement('nav[role="navigation"] ul li a','School Shoes');
     */
  clickHiddenElement: function(cssSelector, textToMatch) {
  
    /**
     * method to execute within the DOM to find elements containing text
     */
    function clickElementInDom(query, content) {
      /**
       * get the list of elements to inspect
       */
      let elements = document.querySelectorAll(query);
      /**
       * workout which property to use to get inner text
       */
      let txtProp = ('textContent' in document) ? 'textContent' : 'innerText';
    
      for (let i = 0, l = elements.length; i < l; i++) {
        /**
         * If we have content, only click items matching the content
         */
      if (content) {
        if (elements[i][txtProp] === content) {
            elements[i].click();
        }
      }
        /**
         * otherwise click all
         */
      else {
          elements[i].click();
        }
      }
    }
  
    /**
     * grab the matching elements
     */
    return driver.elements(cssSelector, clickElementInDom, textToMatch);
  }

};
