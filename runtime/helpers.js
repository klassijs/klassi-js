/**
 * KlassiTech Automated Testing Tool
 * Created by Larry Goddard
 */
'use strict';

module.exports = {
  
  /**
   * ========== All operational functions ==========
   */
    /**
     * returns a promise that is called when the url has loaded and the body element is present
     * @param {string} url to load
     * @returns {Promise}
     * @example
     *      helpers.loadPage('http://www.google.co.uk');
     */
    loadPage: function (url, seconds) {
        /** Wait function - measured in seconds for pauses during tests to give time for processes such as
         * a page loading or the user to see what the test is doing
         * @param seconds
         * @type {number}
         */
        let timeout = (seconds) ? (seconds * 1000) : DEFAULT_TIMEOUT;

        /** load the url and wait for it to complete
         */
        return driver.url(url, function () {

            /** now wait for the body element to be present
             */
            return driver.waitUntil(driver.element('body'), timeout);
        });
    },

    /**
     * Images of each page for regression testing
     * @returns {*|{screenshotRoot, failedComparisonsRoot, misMatchTolerance, screenWidth}}
     */
    cssImages: function (pageName) {
        return driver.webdrivercss(pageName, {
            name: '',
            elem: ''
        })
    },
    
    /**
     * writeTextFile write data to file on hard drive
     * @param  string  filepath   Path to file on hard drive
     * @param  string   output     Data to be written
     */
    writeTextFile: function (filepath, output) {
        fs.writeFile(filepath, output, function (err) {
            if (err) throw err;
        })
    },

    /**
     * clicks an element (or multiple if present) that is not visible,
     * useful in situations where a menu needs a hover before a child link appears
     * @param {string} css selector used to locate the elements
     * @param {string} text to match inner content (if present)
     * @example
     *    helpers.clickHiddenElement('nav[role="navigation"] ul li a','School Shoes');
     */
    clickHiddenElement: function (cssSelector, textToMatch) {
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
        return driver.elements(cssSelector, clickElementInDom, textToMatch.toLowerCase().trim);
    },

    /**
     * Generate random integer from a given range
     */
    generateRandomInteger: function (range) {
        return Math.floor(Math.random() * Math.floor(range));
    },

    /**
     * This method is useful for dropdown boxes as some of them have default "Please select" option on index 0
     *
     * @param range
     * @returns randomNumber excluding index 0
     */
    getRandomIntegerExcludeFirst: function (range) {
        let randomNumber = helpers.generateRandomInteger(range);

        if (randomNumber <= 1) {
            randomNumber += 2;
        }
        return randomNumber;
    },

    /**
     * Converting String date into the Date format
     *
     * @param _date : String date that user passes in
     * @param _format : "dd/MM/yyyy", "mm/dd/yyyy", "mm-dd-yyyy"
     * @param _delimiter
     * @returns {Date}
     *
     * Example use
     *
     * stringToDate("17/9/2014","dd/MM/yyyy","/");
     * stringToDate("9/17/2014","mm/dd/yyyy","/")
     * stringToDate("9-17-2014","mm-dd-yyyy","-")
     */
    stringToDate: function (_date, _format, _delimiter) {
        let formatLowerCase = _format.toLowerCase();
        let formatItems = formatLowerCase.split(_delimiter);
        let dateItems = _date.split(_delimiter);
        let monthIndex = formatItems.indexOf("mm");
        let dayIndex = formatItems.indexOf("dd");
        let yearIndex = formatItems.indexOf("yyyy");
        let month = parseInt(dateItems[monthIndex]);
        month -= 1;
        return new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    },
    
    /**
     * Get the current date dd-mm-yyyy
     * @returns {string|*}
     */
    currentDate: function () {
        let MyDate = new Date();
        let date;
        MyDate.setDate(MyDate.getDate());
        date = ('-' + '0' + MyDate.getDate())
        .slice(-2) + '-' + ('0' + (MyDate.getMonth()+1))
        .slice(-2) + '-' + MyDate.getFullYear();
        return date;
    },

    /**
     * Get current date and time dd/mm/yyy 00:00:00
     */
    getCurrentDateTime: function () {
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1; //January is 0!
        let yyyy = today.getFullYear();
        let hours = today.getHours();
        let minutes = today.getMinutes();
        let seconds= today.getSeconds();
        
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        
        if (hours < 10){
            hours = '0' + hours
        }
        if (minutes < 10) {
            minutes = '0' + minutes
        }
        if (seconds < 10) {
            seconds = '0' + seconds
        }
        return dd + '-' + mm + '-' + yyyy + '-' + hours + ':' + minutes + ':' + seconds;
    },

    /**
     * Get the text of an Element
     * @param selector
     * @returns text
     */
    getElementText: function (selector) {
        return driver.waitForExist(selector, 10000).pause(3000).then(function () {
            return driver.getText(selector).then(function (text) {
                return text;
            })
        })
    },

    /**
     * Get the href link from an element
     * @param selector
     * @returns {String|String[]|*|string}
     */
    getLink: function (selector) {
        return driver.getAttribute(selector, 'href')
    },
  
/**
 * ========== EMAIL FUNCTIONALITY ==========
 */
    /**
     *   Sends an Email to the concerned users with the log and the test report
     */
    klassiEmail: function () {
        try{
            let mailer = require('../runtime/mailer').klassiSendMail();
                return mailer;
        }
        catch(err){
            if(err) {
                console.log('This is a Email system error: ', err.stack);
            }
        }
        return this;
    },

    /**
     *  Sorts results by date
     * @param array
     * @returns {*}
     */
    sortByDate: function (array) {
        array.sort(function (a, b) {
            let sentDateA = a.split('/');
            let c = new Date(sentDateA[2], sentDateA[1], sentDateA[0]);
            let sentDateB = b.split('/');
            let d = new Date(sentDateB[2], sentDateB[1], sentDateB[0]);
            return d - c;
        });
        return array;
    },

    /**
     * function to get element from frame or frameset
     * @param frame_name
     * @param selector
     * @returns {Promise.<TResult>}
     */
    getElementFromFrame: function (frame_name, selector) {
        let frame = driver.element(frame_name);
        driver.frame(frame.value);
        driver.getHTML(selector);
        return driver;
    },

    /**
     * This will assert 'equal' text being returned
     * @param selector
     * @param expectedText
     */
    assertText: function (selector, expectedText) {
        return driver.getText(selector).then(function (actualText) {
            assert.equal(actualText, expectedText);
            return this;
        })
    },

    /**
     * This will assert 'to include' text being returned
     * @param selector
     * @param expectedText
     */
    expectToIncludeText: function (selector, expectedText) {
        return driver.getText(selector).then(function (actualText) {
            expect(actualText).to.include(expectedText);
            return this;
        })
    },

    /**
     * This will assert url being returned
     * @param expected
     */
    assertUrl: function (expected) {
        return driver.getUrl().then(function (actual) {
            assert.equal(actual, expected);
            return this;
        })
    },
    
    /**
     *  ========== API calls for GET, PUT, POST and DELETE reusable functionality ==========
     * @param endPoint
     * @param method
     * @param body
     * @param url
     */
    /**
     * GET API function
     */
    getAPI: function (endpoint) {
        let endPoint = (endpoint);
        
        let options = {
            method: 'GET',
            url: endPoint,
            json: true,
            time: true,
            resolveWithFullResponse: true,
        };
        
        return request(options)
        .then(function (response, err) {
            if (err) {
                log.error('GET Api error msg: ', err.stack)
            }
            log.info(response.timings.response);
            return response;
        });
    },
    
    /**
     *  API call for GET, PUT, POST and DELETE functionality
     * @param url
     * @param method
     * @param body
     * @param fileName
     * @param statusCode
     */
    apiCall: function (endPoint, method, body, fileName) {
        
        // let random;
        let options = {
            url: endPoint,
            method: method,
            // body: {
            body: body,
            docId: fileName,
            // },
            json: true,
            time: true,
            resolveWithFullResponse: true,
        };
        
        // if (method === 'DELETE' || 'POST'){
        //     return fs.readFileSync(fileName, 'utf8', function (docId) {
        //             console.log('this is something', docId);
        //             options.body['docId'] = docId;
        //
        //     });
        // }
        return request(options)
        .then(function (res) {
            // expect(res.statusCode).to.equal(statusCode);
            if (method === 'DELETE' || 'POST'){
                console.log('this is a Delete or Post ' + (fs.readFileSync(fileName)));
                return fs.readFileSync(fileName, "utf8")
            }else{
                console.log('this is a Create');
                return helpers.writeTextFile(fileName, res.body.docId)
            }
            // console.log(options.body['docId']);
            // return options.body['docId'];
        });
        
    },
    
    /**
     * Create 'PUT' API function
     * @param url
     * @param body
     * @returns {*|Promise<T>}
     */
    putApi: function (url, body, fileName) {
        url = (url);
        body = (body);
        // fileName = (fileName);
        
        let options = {
            method: 'PUT', //param
            url: url,
            body: body,
            json: true,
            time: true,
            resolveWithFullResponse: true,
        };
        
        return request(options)
        .then(function (res) {
            log.info('This is the doc_Id:- ', res);
            return helpers.writeTextFile(fileName, res.body.docId);
        })
        .catch(function (err) {
            console.log('PUT Api error msg:', err.stack)
        });
    },
    
    /**
     * Edit 'POST' Api function
     * @param url
     * @param docId
     * @param body
     * @returns {*|Promise<T>}
     */
    postApi: function (url, body) {
        url = (url);
        body = (body);
        
        let options = {
            method: 'POST',
            url: url,
            body: body,
            json: true,
            resolveWithFullResponse: true,
        };
        
        return request(options)
        .then(function (res) {
            log.info('this is the status: ', res);
        })
        .catch(function (err) {
            log.error('Post Api error msg: ', err.stack)
        });
    },
    
    /**
     * Delete Api function
     * @returns {*|Promise<T>}
     */
    deleteApi: function (url, docId) {
        url = (url);
        docId = (docId);
        
        let options = {
            method: 'DELETE',
            url: url,
            body: {
                docId: docId,
            },
            json: true
        };
        
        return request(options)
        .then(function (res) {
            log.info('Delete Api response: ', res);
            return res;
        })
        .catch(function (err) {
            log.error('Delete Api error msg: ', err.stack)
        });
    },
  
};
