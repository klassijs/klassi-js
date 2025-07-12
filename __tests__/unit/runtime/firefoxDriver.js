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
const firefoxDriver = require('../../../runtime/drivers/firefoxDriver');

describe('firefoxDriver', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = { setWindowSize: jest.fn() };
    webdriverio.remote.mockResolvedValue(mockBrowser);
  });

  it('should run in headless mode when isApiTest is true', async () => {
    filterQuietTags.mockResolvedValue([]);
    await firefoxDriver({ headless: true });
    expect(mockBrowser.setWindowSize).toHaveBeenCalledWith(1280, 1024);
  });

  it('should NOT run in headless mode when isApiTest is false', async () => {
    filterQuietTags.mockResolvedValue([]);
    await firefoxDriver({headless: false});
    expect(mockBrowser.setWindowSize).toHaveBeenCalledWith(1280, 1024);
  });
});
