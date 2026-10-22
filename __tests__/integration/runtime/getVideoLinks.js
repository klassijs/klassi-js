process.env.LAMBDATEST_API_URL = 'api.lambdatest.com/automation/api/v1';
process.env.LAMBDATEST_USERNAME = 'mockUsername';
process.env.LAMBDATEST_ACCESS_KEY = 'mockAccessKey';

const pactumJs = require('pactum');
const { getVideoList, getVideoId, reportHtml } = require('../../../runtime/getVideoLinks');

jest.mock('pactum', () => ({
  spec: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  withAuth: jest.fn().mockReturnThis(),
  toss: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: { url: 'https://cdn.example/video.mp4', view_video_url: 'https://automation.lambdatest.com/video' },
  }),
}));

describe('getVideoLinks', () => {
  beforeEach(() => {
    global.browser = { sessionId: 'mockSessionId' };
    process.env.LAMBDATEST_API_URL = 'api.lambdatest.com/automation/api/v1';
    process.env.LAMBDATEST_USERNAME = 'mockUsername';
    process.env.LAMBDATEST_ACCESS_KEY = 'mockAccessKey';
    pactumJs.get.mockClear();
    pactumJs.withAuth.mockClear();
  });

  afterEach(() => {
    delete global.browser;
    delete process.env.LAMBDATEST_API_URL;
    delete process.env.LAMBDATEST_USERNAME;
    delete process.env.LAMBDATEST_ACCESS_KEY;
  });

  it('fetches the session video from the current LambdaTest API', async () => {
    const video = await getVideoList();

    expect(pactumJs.spec).toHaveBeenCalled();
    expect(pactumJs.get).toHaveBeenCalledWith(
      'https://api.lambdatest.com/automation/api/v1/sessions/mockSessionId/video'
    );
    expect(pactumJs.withAuth).toHaveBeenCalledWith('mockUsername', 'mockAccessKey');
    expect(video).toEqual({
      url: 'https://cdn.example/video.mp4',
      viewUrl: 'https://automation.lambdatest.com/video',
    });
  });

  it('returns the last fetched video', async () => {
    await getVideoList();
    await expect(getVideoId()).resolves.toEqual({
      url: 'https://cdn.example/video.mp4',
      viewUrl: 'https://automation.lambdatest.com/video',
    });
  });

  it('embeds a public mp4 and opens a credentialed LambdaTest url in a popup', () => {
    expect(reportHtml({
      url: 'https://cdn.example/video.mp4',
      viewUrl: 'https://automation.lambdatest.com/logs',
    })).toMatch(/source src=https:\/\/cdn.example\/video.mp4/);
    const html = reportHtml({
      url: 'https://user:secret@api.lambdatest.com/automation/api/v1/bundler/session/video.mp4',
      viewUrl: 'https://automation.lambdatest.com/logs',
    });
    expect(html).toMatch(/Play session video/);
    expect(html).toMatch(/window\.open\(this\.href,'lt-session-video'/);
    expect(html).toMatch(/target="lt-session-video"/);
    expect(html).not.toMatch(/secret|user:|@api\.lambdatest/);
  });
});
