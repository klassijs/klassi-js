jest.mock('webdriverio', () => ({
  remote: jest.fn(),
}));

jest.mock('@cucumber/cucumber', () => ({
  Before: jest.fn(),
}));

jest.mock('../../../cucumber.js', () => ({
  filterQuietTags: jest.fn(),
}));

jest.mock('../../../runtime/drivers/chromeDriver', () => ({
  defaults: {
    capabilities: { 'goog:chromeOptions': { args: [] } },
  },
  chromeDriver: jest.fn(),
}));

const webdriverio = require('webdriverio');
const { chromeDriver, defaults } = require('../../../runtime/drivers/chromeDriver');
const { filterQuietTags } = require('../../../cucumber.js');

describe('chromeDriver', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = { setWindowSize: jest.fn() };
    webdriverio.remote.mockResolvedValue(mockBrowser);

    chromeDriver.mockImplementation(async ({ headless }) => {
      console.log('✅ chromeDriver function called'); // Debugging

      // Reset args before each test to prevent pollution
      defaults.capabilities['goog:chromeOptions'].args = [];

      if (headless) {
        defaults.capabilities['goog:chromeOptions'].args.push('--headless', '--disable-extensions');
      }

      const browser = await webdriverio.remote({ capabilities: defaults.capabilities });
      console.log('✅ webdriverio.remote called'); // Debugging
      await browser.setWindowSize(1280, 1024);
      console.log('✅ setWindowSize called'); // Debugging
    });
  });

  it('should run in headless mode when isApiTest is true', async () => {
    filterQuietTags.mockResolvedValue(['@api']);

    await chromeDriver({ headless: true });

    console.log('Stubbed Chrome Options:', defaults.capabilities['goog:chromeOptions'].args);

    expect(webdriverio.remote).toHaveBeenCalledWith(
      expect.objectContaining({
        capabilities: expect.objectContaining({
          'goog:chromeOptions': expect.objectContaining({
            args: expect.arrayContaining(['--headless', '--disable-extensions']),
          }),
        }),
      })
    );

    expect(mockBrowser.setWindowSize).toHaveBeenCalledWith(1280, 1024);
  });

  it('should NOT run in headless mode when isApiTest is false', async () => {
    filterQuietTags.mockResolvedValue([]);

    await chromeDriver({ headless: false });

    console.log('Stubbed Chrome Options (No Headless):', defaults.capabilities['goog:chromeOptions'].args);

    expect(webdriverio.remote).toHaveBeenCalledWith(
      expect.objectContaining({
        capabilities: expect.objectContaining({
          'goog:chromeOptions': expect.objectContaining({
            args: expect.not.arrayContaining(['--headless']),
          }),
        }),
      })
    );

    expect(mockBrowser.setWindowSize).toHaveBeenCalledWith(1280, 1024);
  });
});
