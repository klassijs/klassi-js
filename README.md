[![STAT](https://nodei.co/npm/webdriverio-cucumber-js.png?downloads=true)](https://nodei.co/npm/webdriverio-cucumber-js/)

# webdriverio-cucumber-js [![Run Status](https://api.shippable.com/projects/585832b28171491100bb123f/badge?branch=master)](https://app.shippable.com/projects/585832b28171491100bb123f) [![Build Status](https://travis-ci.org/larryg01/webdriverio-cucumber-js.svg?branch=master)](https://travis-ci.org/larryg01/webdriverio-cucumber-js)

  A debuggable JS BDD framework that uses [webdriver.io (the Selenium 2.0 bindings for NodeJS)](http://webdriver.io/) and [cucumber-js](https://github.com/cucumber/cucumber-js "view cucumber js documentation")


## Installation

```bash
npm install webdriverio-cucumber-js

# To run your test locally, you'll need a local selenium server running, you can install and launch a selenium standalone server with chrome, firefox and phantomjs drivers via the following commands in a seperate terminal:

npm install selenium-standalone@latest -g --save-dev
selenium-standalone install
selenium-standalone start
```

## Usage

```bash
node ./node_modules/webdriverio-cucumber-js/index.js -s ./step-definitions
or
node index.js -t @search -b firefox     // if you are already inside the project directory
```

### Options

```bash
-h, --help                   output usage information
-v, --version                output the version number
-s, --steps <path>           path to step definitions. defaults to ./step-definitions
-p, --pageObjects <path>     path to page objects. defaults to ./page-objects
-o, --sharedObjects [paths]  path to shared objects (repeatable). defaults to ./shared-objects
-b, --browser <path>         name of browser to use. defaults to chrome
-r, --reports <path>         output path to save reports. defaults to ./reports
-t, --tags <tagName>         name of tag to run
```

By default tests are run using Google Chrome, to run tests using another browser supply the name of that browser along with the `-b` switch. Available options are:

| Browser | Example |
| :--- | :--- |
| Chrome | `-b chrome` |
| Firefox | `-b firefox` |
| Phantom JS | `-b phantomjs` |

### Feature files

A feature file is a [Business Readable, Domain Specific Language](http://martinfowler.com/bliki/BusinessReadableDSL.html) file that lets you describe software’s behaviour without detailing how that behaviour is implemented. Feature files are written using the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin) and must live in a folder named **features** within the root of your project.

```gherkin
# ./features/google-search.feature

Feature: Searching for apps with google
  As an internet user
  In order to find out more about certain user apps
  I want to be able to search for information about the required apps

  Scenario: Google search for the britain's got talent app
    When I search Google for "britain's got talent app"
    Then I should see some results
```

The browser automatically closes after each scenario to ensure the next scenario uses a fresh browser environment.

### Step definitions

Step definitions act as the glue between features files and the actual system under test.

_To avoid confusion **always** return a JavaScript promise your step definition in order to let cucumber know when your task has completed._

```javascript
// ./step-definitions/google-search-steps.js

module.exports = function () {

    this.Then(/^I should see some results$/, function(){

            /** driver waitUntil returns a promise so return that */
            return driver.waitUntil(driver.element('div.g'), 10000).then(function(){

                /** return the promise of an element to the following then. */
                return driver.element('div.g')
            })
            .then(function(elements){

                /** verify this element has children */
                expect(elements.length).to.not.equal(0);
            })
        });
};
```
The following variables are available within the ```Given()```, ```When()``` and ```Then()``` functions:

| Variable | Description |
| :--- | :---  |
| `driver`     | an instance of [web driver](http://webdriver.io/guide/services/selenium-standalone.html) (_the browser_) |
| `webdriverio`| the raw [webdriver](http://webdriver.io/api.html) module, providing access to static properties/methods |
| `page`       | collection of **page** objects loaded from disk and keyed by filename |
| `shared`     | collection of **shared** objects loaded from disk and keyed by filename |
| `helpers`    | a collection of [helper methods](runtime/helpers.js) _things webdriver.io does not provide but really should!_ |
| `expect`     | instance of [chai expect](http://chaijs.com/api/bdd/) to ```expect('something').to.equal('something')``` |
| `assert`     | instance of [chai assert](http://chaijs.com/api/assert/) to ```assert.isOk('everything', 'everything is ok')``` |
| `trace`      | handy trace method to log console output with increased visibility |



### Page objects

Page objects are accessible via a global ```page``` object and are automatically loaded from ```./page-objects``` _(or the path specified using the ```-p``` switch)_. Page objects are exposed via a camel-cased version of their filename, for example ```./page-objects/google-search.js``` becomes ```page.googleSearch```.

Page objects also have access to the same runtime variables available to step definitions.

An example page object:

```javascript
// ./page-objects/gogole-search.js

module.exports = {

    url: 'http://google.co.uk',
    elements: {
        searchInput: ('q'),
        searchResultLink: ('div.g > h3 > a')
    },

    /**
     * enters a search term into Google's search box and presses enter
     * @param {string} searchQuery
     * @returns {Promise} a promise to enter the search values
     */
    preformSearch: function (searchQuery) {

        var selector = page.googleSearch.elements.searchInput;

        /**
         * return a promise so the calling function knows the task has completed
         */
        return driver.element(selector, driver.keys(searchQuery), driver.keys('Enter'));
    }
};
```

And its usage within a step definition:

```js
// ./step-definitions/google-search-steps.js
this.When(/^I search Google for "([^"]*)"$/, function (searchQuery) {

    return helpers.loadPage('http://www.google.co.uk').then(function() {

        // use a method on the page object which also returns a promise
        return page.googleSearch.performSearch(searchQuery);
    })
});
```

### CSS regression functionality with [webdriverCSS](https://github.com/webdriverio/webdrivercss)

Automatic visual regression testing, gives the ability to take and save fullpage screenshots or of specific parts of the application / page under test.

You will need to have GraphicsMagick preinstalled on your system because WebdriverCSS uses it for image processing. To install GraphicsMagick follow the [instructions here](https://github.com/webdriverio/webdrivercss#install) .

```js
// ./runtime/helpers.js

cssImages: function(pageName){
    return driver.webdrivercss(pageName, {
        name: '',
        elem: ''
    })
}
```
And its usage within a step definition:

```js
module.exports = function (){

    this.Given(/^I am on klassifashion home page$/, function () {

        return helpers.loadPage('http://klassifashion.com', 10).then(function(){

            /** Take an image of the page under test */
            return helpers.cssImages(pageName)
        })
    });
};
```

### Shared objects

Shared objects allow you to share anything from test data to helper methods throughout your project via a global ```shared``` object. Shared objects are automatically loaded from ```./shared-objects``` _(or the path specified using the ```-o``` switch)_ and made available via a camel-cased version of their filename, for example ```./shared-objects/test-data.js``` becomes ```shared.testData```.

Shared objects also have access to the same runtime variables available to step definitions.

An example shared object:

```javascript
// ./shared-objects/test-data.js

module.exports = {
    username: "import-test-user",
    password: "import-test-pa**word"
}
```

And its usage within a step definition:

```js
module.exports = function () {

    this.Given(/^I am logged in"$/, function () {

        driver.element('usn').keys(shared.testData.username);
        driver.element('pass').keys(shared.testData.password);
    });
};
```

### Reports

HTML and JSON reports are automatically generated and stored in the default `./reports` folder. This location can be changed by providing a new path using the `-r` command line switch:

![Cucumber HTML report](img/cucumber-html-report.png)

### Event handlers

You can register event handlers for the following events within the cucumber lifecycle.

| Event          | Example                                                     |
|----------------|-------------------------------------------------------------|
| BeforeFeature  | ```this.BeforeFeatures(function(feature, callback) {}) ```  |
| BeforeScenario | ```this.BeforeScenario(function(scenario, callback) {});``` |
| AfterScenario  | ```this.AfterScenario(function(scenario, callback) {});```  |
| AfterFeature   | ```this.AfterFeature(function(feature, callback) {});```    |

## How to debug

Most webdriverio methods return a [JavaScript Promise](https://spring.io/understanding/javascript-promises "view JavaScript promise introduction") that is resolved when the method completes. The easiest way to step in with a debugger is to add a ```.then``` method to a selenium function and place a ```debugger``` statement within it, for example:

```js
module.exports = function () {

    this.When(/^I search Google for "([^"]*)"$/, function (searchQuery, done) {

        driver.element('q').then(function(input) {
            expect(input).to.exist;
            debugger; // <<- your IDE should step in at this point, with the browser open
            return input;
        })
        .then(function(input){
            input.keys(searchQuery);
            input.keys(driver.keys('Enter'));

            done(); // <<- let cucumber know you're done
        });
    });
};
```

## Default directory structure

You can use the framework without any command line arguments if your application uses the following folder structure:
```
.
├── features
│   └── google-search.feature
├── step-definitions
│   └── google-search-steps.js
├── page-objects
│   └── google-search.js
└── shared-objects
│   ├── test-data.js
│   └── stuff.json
└── reports
    ├── cucumber-report.json
    └── cucumber-report.html
```

## Demo

This project includes an example feature file and step definition to help you get started. You can run the example using the following command:

```bash
node ./node_modules/webdriverio-cucumber-js/index.js
```

## Bugs

Please raise bugs via the [webdriverio-cucumber-js issue tracker](https://github.com/larryg01/webdriverio-cucumber-js/issues) and, if possible, please provide enough information to allow the bug to be reproduced.

## Contributing

Every and anyone is welcome to contribute to this project. you can contribute by forking, adding specs and sending pull requests, submitting bugs or suggesting improvements by [opening an issue on GitHub](https://github.com/larryg01/webdriverio-cucumber-js/issues)  In lieu of a formal styleguide, please take care to maintain the existing coding style.

## Credits

[Webdriverio-cucumber-js](https://github.com/larryg01/webdriverio-cucumber-js) was originated from [John Doherty's](https://www.linkedin.com/in/john-i-doherty) initial npm javaScript project called [selenium-cucumber-js](https://github.com/john-doherty/selenium-cucumber-js)

## License

[MIT License](LICENSE) &copy; 2016 [Larry Goddard](https://uk.linkedin.com/in/goddardl)
