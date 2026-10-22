process.env.LAMBDATEST_API_URL = 'api.lambdatest.com/automation/api/v1';
process.env.LAMBDATEST_USERNAME = 'mockUsername';
process.env.LAMBDATEST_ACCESS_KEY = 'mockAccessKey';

const pactumJs = require('pactum');
const { getVideoList, getVideoId } = require('../../../runtime/getVideoLinks');

jest.mock('pactum', () => ({
  spec: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  withAuth: jest.fn().mockReturnThis(),
  expectStatus: jest.fn().mockReturnThis(),
  toss: jest.fn().mockResolvedValue({ body: { url: 'https://cdn.example/video.mp4' } }),
}));

describe('getVideoLinks', () => {
  beforeEach(() => {
    global.browser = { sessionId: 'mockSessionId' };
    process.env.LAMBDATEST_API_URL = 'api.lambdatest.com/automation/api/v1';
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
      'https://api.lambdatest.com/automation/api/v1/sessions/mockSessionId/video'
    );
    expect(pactumJs.withAuth).toHaveBeenCalledWith('mockUsername', 'mockAccessKey');
    expect(pactumJs.expectStatus).toHaveBeenCalledWith(200);
    expect(videoID).toBe('https://cdn.example/video.mp4');
  });

  it('should return the video ID', async () => {
    await getVideoList();
    await expect(getVideoId()).resolves.toBe('https://cdn.example/video.mp4');
  });
});
