let Google;

try {
  Google = require('../page-objects/__utam__/compiledUTAM/google');
} catch (err) {}

Given(/^The user navigates to Google$/, async () => {
  await helpers.loadPage(env.web_utam_url, 10);
  const modal = await browser.$('button[id="L2AGLb"]');
  if ((await modal.isDisplayed()) === true) {
    const google = await utam.load(Google);
    const acceptModalBtn = await google.getAcceptModalBtn();
    if (acceptModalBtn) {
      await acceptModalBtn.click();
    }
    if (process.platform !== 'darwin') {
      await google.waitForAbsence();
    }
  }
});
When(/^They use the engine to search for a word$/, async () => {
  const google = await utam.load(Google);
  await google.searchWord('Synecdoche, New York');
  await google.waitForAbsence();
});

Then(/^The results are correct$/, async () => {
  const resultHeadingText = await browser.$('div[data-attrid="title"]');
  expect(await resultHeadingText.getText()).to.be.oneOf(['Synecdoche, New York', 'Synecdoche; New York']);
});
