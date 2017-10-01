'use strict';
module.exports = {
    /** returns a promise that is called when the url has loaded and the body element is present
     * @param {string} url to load
     * @returns {Promise}
     * @example
     *    helpers.loadPage('http://www.google.co.uk');
     */
    loadPage: function(url, seconds){
        /** Wait function - measured in seconds for pauses during tests to give time for processes
         * such as a page loading or the user to see what the test is doing
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

    /** Images of each page for regression testing
     * @returns {*|{screenshotRoot, failedComparisonsRoot, misMatchTolerance, screenWidth}}
     */
    cssImages: function(pageName){
        return driver.webdrivercss(pageName, {
            name: '',
            elem: ''
        })
    },

    /** returns the value of an attribute on an element
     * @param {string} css selector used to find the element
     * @param {string} attribute name to retrieve
     * @returns {string} the value of the attribute or empty string if not found
     * @example
     *      helpers.getAttributeValue('body', 'class');
     */
    getAttributeValue: function (selector, attributeName) {
        /** get the element from the page
         */
        return driver.elements(selector).then(function(attributeValue) {
            return attributeValue;
        })
            .catch(function(){
                return '';
            });
    },

    /** returns list of elements matching a query selector who's inner text mathes param.
     * WARNING: The element returned might not be visible in the DOM and will therefore have restricted interactions
     * @param {string} css selector used to get list of elements
     * @param {string} inner text to match (does not have to be visible)
     * @returns {Promise}
     * @example
     *      helpers.getElementsContainingText('nav[role="navigation"] ul li a', 'Safety Boots')
     */
    getElementsContainingText: function(cssSelector, textToMatch) {
        /** method to execute within the DOM to find elements containing text
        */
        function findElementsContainingText(query, content) {
            let results = [];

            /** workout which property to use to get inner text
            */
            let txtProp = ('textContent' in document) ? 'textContent' : 'innerText';

            /** get the list of elements to inspect
            */
            let elements = document.querySelectorAll(query);

            for (let i=0, l=elements.length; i<l; i++) {
                if (elements[i][txtProp] === content){
                    results.push(elements[i]);
                }
            }
            return results;
        }
        /** grab matching elements
        */
        return driver.elements(findElementsContainingText, cssSelector, textToMatch);
    },

    /** returns first elements matching a query selector who's inner text matches textToMatch param
     * @param {string} css selector used to get list of elements
     * @param {string} inner text to match (does not have to be visible)
     * @returns {Promise}
     * @example
     *      helpers.getFirstElementContainingText('nav[role="navigation"] ul li a', 'Safety Boots').click();
     */
    getFirstElementContainingText: function(cssSelector, textToMatch){

        return helpers.getElementsContainingText(cssSelector, textToMatch).then(function(elements){
            return elements[0];
        });
    },

    /** clicks an element (or multiple if present) that is not visible,
     * useful in situations where a menu needs a hover before a child link appears
     * @param {string} css selector used to locate the elements
     * @param {string} text to match inner content (if present)
     * @example
     *    helpers.clickHiddenElement('nav[role="navigation"] ul li a','Safety Boots');
     */
    clickHiddenElement: function(cssSelector, textToMatch) {
        /** method to execute within the DOM to find elements containing text
        */
        function clickElementInDom(query, content) {
            /** get the list of elements to inspect
            */
            let elements = document.querySelectorAll(query);

            /** workout which property to use to get inner text
            */
            let txtProp = ('textContent' in document) ? 'textContent' : 'innerText';

            for (let i=0, l=elements.length; i<l; i++) {

                /** if we have content, only click items matching the content
                */
                if (content) {
                    if (elements[i][txtProp] === content){
                        elements[i].click();
                    }
                }
                /** otherwise click all
                */
                else {
                    elements[i].click();
                }
            }
        }
        /** grab matching elements
        */
        return driver.elements(clickElementInDom, cssSelector, textToMatch);
    }

};
