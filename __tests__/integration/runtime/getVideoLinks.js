process.env.LAMBDATEST_API_URL = 'mockApiUrl';
process.env.LAMBDATEST_USERNAME = 'mockUsername';
process.env.LAMBDATEST_ACCESS_KEY = 'mockAccessKey';

const pactumJs = require('pactum');
const { getVideoList, getVideoId } = require('../../../runtime/getVideoLinks');

jest.mock('pactum', () => ({
  spec: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  withAuth: jest.fn().mockReturnThis(),
  expectStatus: jest.fn().mockReturnThis(),
  toss: jest.fn().mockResolvedValue({ body: { url: 'mockVideoUrl' } }),
}));

describe('getVideoLinks', () => {
  beforeEach(() => {
    global.browser = { sessionId: 'mockSessionId' };
  });

  afterEach(() => {
    delete global.browser;
    delete process.env.LAMBDATEST_API_URL;
    delete process.env.LAMBDATEST_USERNAME;
    delete process.env.LAMBDATEST_ACCESS_KEY;
  });

  it('should get video list and return video ID', async () => {
    const videoID = await getVideoList();

    expect(pactumJs.spec).toHaveBeenCalled();
    expect(pactumJs.get).toHaveBeenCalledWith(
      `https://${process.env.LAMBDATEST_API_URL}/sessions/${global.browser.sessionId}/video`
    );
    expect(pactumJs.withAuth).toHaveBeenCalledWith(
      `${process.env.LAMBDATEST_USERNAME}`, `${process.env.LAMBDATEST_ACCESS_KEY}`
    );
    expect(pactumJs.expectStatus).toHaveBeenCalledWith(200);
    expect(videoID).toBe('mockVideoUrl');
  });

  it('should return the video ID', async () => {
    const videoID = await getVideoId();
    expect(videoID).toBe('mockVideoUrl');
  });
});
