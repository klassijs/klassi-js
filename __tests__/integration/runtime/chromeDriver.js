jest.mock('webdriverio', () => ({
  remote: jest.fn(),
}));

jest.mock('@cucumber/cucumber', () => ({
  Before: jest.fn(),
}));

const { filterQuietTags } = require('../../../cucumber.js');

jest.mock('../../../cucumber.js', () => ({
  filterQuietTags: jest.fn(),
}));

const webdriverio = require('webdriverio');
const chromeDriver = require('../../../runtime/drivers/chromeDriver');

describe('chromeDriver', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = { setWindowSize: jest.fn() };
    webdriverio.remote.mockResolvedValue(mockBrowser);
  });

  it('should run in headless mode when isApiTest is true', async () => {
    filterQuietTags.mockResolvedValue(['@apiTest']);

    await chromeDriver({ headless: true });

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
