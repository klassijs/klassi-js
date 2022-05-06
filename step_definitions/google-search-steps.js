let Google;

try {
  // eslint-disable-next-line global-require
  Google = require('../page-objects/__utam__/compiledUTAM/google');
  // eslint-disable-next-line no-empty
} catch (e) {}

Given(/^The user navigates to Google$/, async () => {
  await helpers.loadPage('www.google.com', 10);
  const google = await utam.load(Google);
  const acceptModalBtn = await google.getAcceptModalBtn();
  await acceptModalBtn.click();
  await google.waitForAbsence();
});

When(/^They use the engine to search for a word$/, async () => {
  const google = await utam.load(Google);
  await google.searchWord('Synecdoche, New York');
  await google.waitForAbsence();
});

Then(/^The results are correct$/, async () => {
  const google = await utam.load(Google);
  const resultHeadingText = await google.getResultHeadingText();
  await resultHeadingText.waitForVisible();
  expect(await resultHeadingText.getText()).to.equal('Synecdoche, New York');
});
