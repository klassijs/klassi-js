module.exports = {

    /** returns a promise that is called when the url has loaded and the body element is present
     * @param {string} url to load
     * @returns {Promise}
     * @example
     *      helpers.loadPage('http://www.google.co.uk');
     */
    loadPage: function(url, seconds){

        /** Wait function - measured in seconds for pauses during tests to give time for processes such as a page loading or the user to see what the test is doing
         * @param seconds
         * @type {number}
         */
         var timeout = (seconds) ? (seconds * 1000) : DEFAULT_TIMEOUT;

         /** load the url and wait for it to complete
          */
         return driver.url(url, function(){

             /** now wait for the body element to be present
              */
             return driver.waitUntil(driver.element('body'), timeout);
         });
    }

};
