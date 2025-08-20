const getRemote = require('../../../runtime/getRemote');
const lambdatest = require('../../../runtime/remotes/lambdatest');

jest.mock('../../../runtime/remotes/lambdatest', () => ({
  submitResults: jest.fn(),
}));

describe('getRemote', () => {
  it('should return disabled remote when no remoteService is provided', () => {
    const remote = getRemote();

    expect(remote.type).toBe('disabled');
    expect(remote.after).toBeInstanceOf(Function);
    expect(remote.after()).toBeUndefined();
  });

  it('should return lambdatest remote when remoteService is lambdatest', () => {
    const remote = getRemote('lambdatest');

    expect(remote.type).toBe('lambdatest');
    expect(remote.after).toBe(lambdatest.submitResults);
  });

  it('should return unknown remote when remoteService is unknown', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const remote = getRemote('unknownService');

    expect(consoleSpy).toHaveBeenCalledWith('Unknown remote service unknownService');
    expect(remote.type).toBe('unknown');
    expect(remote.after).toBeInstanceOf(Function);
    expect(remote.after()).toBeUndefined();

    consoleSpy.mockRestore();
  });

  it('should log a message when noop function is called', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const remote = getRemote('unknownService');

    remote.after();

    expect(consoleSpy).toHaveBeenCalledWith('"If you\'re seeing this, you\'re trying to run a non-existent remoteService"');

    consoleSpy.mockRestore();
  });
});