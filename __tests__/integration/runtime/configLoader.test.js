const configLoader = require('../../../runtime/configLoader');
const fs = require('fs-extra');

jest.mock('fs-extra');

describe('configLoader', () => {
  it('should return a parsed JSON.', () => {
    const input = '{"test": "example"}';
    fs.readFileSync.mockImplementationOnce(() => input);

    const actual = configLoader(input);
    const expected = {
      test: 'example'
    };
    expect(actual).toEqual(expected);
  });
});