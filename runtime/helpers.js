'use strict';
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
    },

    /**
     * Images of each page for regression testing
     * @returns {*|{screenshotRoot, failedComparisonsRoot, misMatchTolerance, screenWidth}}
     */
    cssImages: function(pageName){

        return driver.webdrivercss(pageName, { name: '', elem: '' })
    },


    /***
     * returns the value of an attribute on an element
     * @param {string} css selector used to find the element
     * @param {string} attribute name to retrieve
     * @returns {string} the value of the attribute or empty string if not found
     * @example
     *      helpers.getAttributeValue('body', 'class');
     */
    getAttributeValue: function (selector, attributeName) {
        /** get the element from the page
         */
        return driver.element(selector).then(function(attributeValue) {
            return attributeValue;
        })
            .catch(function(){
                return '';
            });
    },


    /**
     * returns list of elements matching a query selector who's inner text mathes param.
     * WARNING: The element returned might not be visible in the DOM and will therefore have restricted interactions
     * @param {string} css selector used to get list of elements
     * @param {string} inner text to match (does not have to be visible)
     * @returns {Promise}
     * @example
     *      helpers.getElementsContainingText('#block_top_menu > ul > li:nth-child(2)','bikini')
     */
    getElementsContainingText: function(cssSelector, textToMatch) {
        /** method to execute within the DOM to find elements containing text
         * @param query
         * @param content
         * @returns {Array}
         */
        function findElementsContainingText(query, content) {

            var results = []; /** array to hold results */

            /** workout which property to use to get inner text */
            var txtProp = ('textContent' in document) ? 'textContent' : 'innerText';

            /** get the list of elements to inspect */
            var elements = document.querySelectorAll(query);

            for (var i=0, l=elements.length; i<l; i++) {
                if (elements[i][txtProp] === content){
                    results.push(elements[i]);
                }
            }
            return results;
        }
        /** grab matching elements */
        return driver.elements(findElementsContainingText, cssSelector, textToMatch);
    },


    /**
     * returns first elements matching a query selector who's inner text matches textToMatch param
     * @param {string} css selector used to get list of elements
     * @param {string} inner text to match (does not have to be visible)
     * @returns {Promise}
     * @example
     *      helpers.getFirstElementContainingText('#block_top_menu > ul > li:nth-child(2)','bikini').click();
     */
    getFirstElementContainingText: function(cssSelector, textToMatch){

        return helpers.getElementsContainingText(cssSelector, textToMatch).then(function(elements){
            return elements[0];
        });
    },


    /**
     * clicks an element (or multiple if present) that is not visible, useful in situations where a menu needs a hover before a child link appears
     * @param {string} css selector used to locate the elements
     * @param {string} text to match inner content (if present)
     * @returns {*|{menuItem, productId}|XMLList|{searchInput, searchResultLink}}
     * @example
     *      helpers.clickHiddenElement('#block_top_menu > ul > li:nth-child(2)','bikini');
     */
    clickHiddenElement: function(cssSelector, textToMatch) {
        /**
         * method to execute within the DOM to find elements containing text
         * @param query
         * @param content
         */
        function clickElementInDom(query, content) {
            /**
             * get the list of elements to inspect
             * @type {NodeList}
             */
            var elementList = ($$(document.querySelectorAll(query))),
                /**
                 * workout which property to use to get inner text
                 * @type {string}
                 */
                txtProp = ($$('textContent' in document)) ? 'textContent' : 'innerText';

            for (var i=0, l=elementList.length; i<l; i++) {
                /**
                 * if we have content, only click items matching the content
                 */
                if (content) {

                    if (elementList[i][txtProp] === content){
                        elementList[i].click();
                    }
                }
                else {
                    elementList[i].click();
                }
            }
        }
        /** grab matching elements */
        return driver.moveToObject(cssSelector , driver.click(clickElementInDom, textToMatch));
    }

};
