process.env.LAMBDATEST_API_URL = 'mockApiUrl';
process.env.LAMBDATEST_USERNAME = 'mockUsername';
process.env.LAMBDATEST_ACCESS_KEY = 'mockAccessKey';

const pactumJs = require('pactum');
const { getVideoList, getVideoId } = require('../../../runtime/getVideoLinks');

jest.mock('pactum', () => ({
  spec: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  withHeaders: jest.fn().mockReturnThis(),
  withRequestTimeout: jest.fn().mockReturnThis(),
  expectStatus: jest.fn().mockReturnThis(),
  toss: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: { data: [{ session_id: 'mockSessionId', video_url: 'mockVideoUrl' }] },
  }),
}));

describe('getVideoLinks', () => {
  beforeEach(() => {
    global.browser = { sessionId: 'mockSessionId' };
    process.env.LAMBDATEST_API_URL = 'mockApiUrl';
    process.env.LAMBDATEST_USERNAME = 'mockUsername';
    process.env.LAMBDATEST_ACCESS_KEY = 'mockAccessKey';
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
      `https://${process.env.LAMBDATEST_API_URL}/sessions?limit=50`
    );
    expect(pactumJs.withHeaders).toHaveBeenCalledWith(
      'Authorization',
      `Basic ${Buffer.from(`${process.env.LAMBDATEST_USERNAME}:${process.env.LAMBDATEST_ACCESS_KEY}`).toString('base64')}`
    );
    expect(videoID).toBe('mockVideoUrl');
  });

  it('should return the video ID', async () => {
    const videoID = await getVideoId();
    expect(videoID).toBe('mockVideoUrl');
  });
});
