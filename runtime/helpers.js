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
             return driver.waitUntil(driver.element('body'));
         });
    },

    /** Takes screen shots of page in sections for comparison to previous screenshots
     *  to look for any changes that may have occurred, intended or not during regression.
     * @params page
     */
    cssImages: function(page){

        if (page.cssImages) {
            for (var a = 0, b = page.cssImages.length; a < b; a++) {
                var item = page.cssImages[a];
                driver.webdrivercss([item]);
            }
        }
    }

};
