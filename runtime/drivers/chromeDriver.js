const { remote } = require('webdriverio');
const { Before } = require('@cucumber/cucumber');
const fs = require('fs-extra');
const path = require('path');

const apiTagsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scripts/tagList.json')));
const apiTags = global.tagNames;

let defaults = {};
let isApiTest = false;
let useProxy = false;

Before(async (scenario) => {
  try {
    const scenarioTags = scenario.pickle.tags.map(tag => tag.name.replace('@', '').toLowerCase());
    const tagList = (apiTagsData.tagNames && apiTags || []).map(tag => tag.replace('@', '').toLowerCase());
    isApiTest = scenarioTags.some(tag => tagList.includes(tag));
  } catch (error) {
    console.error('Error in Before hook: ', error);
  }
});

module.exports = async function chromeDriver(options) {
  defaults = {
    logLevel: 'error',
    path: '/',
    automationProtocol: 'webdriver',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-popup-blocking',
          '--allow-file-access-from-files',
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream',
          '--disable-extensions',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=0'
        ],
        prefs: {
          'profile.password_manager_leak_detection': false
        }
      }
    }
  };

  if (isApiTest) {
    defaults.capabilities['goog:chromeOptions'].args.unshift('--headless=new');
  }

  if (useProxy) {
    defaults.capabilities.proxy = {
      httpProxy: 'http://klassiarray.klassi.co.uk:8080',
      proxyType: 'MANUAL',
      autodetect: false,
    };
  }

  const extendedOptions = Object.assign(defaults, options);

  try {
    global.browser = await remote(extendedOptions);
    await global.browser.setWindowSize(1280, 1024);
    return global.browser;
  } catch (error) {
    console.error('Error in Chrome driver:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};
