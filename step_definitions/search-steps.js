Before({ tags: '@skip' }, async () => {
  try {
    await helpers.apiCall('http://www.randomnumberapi.com/api/v1.0/random', 'GET', null, null);
    const resp = await helpers.getContent();

    if (resp.body[0] % 2 !== 0) {
      cucumberThis.attach(
        'The preliminary condition for this test failed. This test is programmed to skip if the ' +
          'random number retrieved from an API is odd, and the number was ' +
          resp.body[0] +
          '.'
      );
      return 'skipped';
    }
  } catch (e) {
    cucumberThis.attach('The preliminary condition for this test failed: Random number API could not be reached.');
    return 'skipped';
  }
});

Given(/^The user arrives on the duckduckgo search page$/, async () => {
  await helpers.loadPage(env.web_url, 10);
});

When(/^they input (.*)$/, async (searchWord) => {
  await pageObjects.search.performWebSearch(searchWord);
});

When(/^they use (.*)$/, async (searchWord) => {
  await pageObjects.search.performWebSearch(searchWord);
});

Then(/^they should see some results$/, async () => {
  await pageObjects.search.searchResult();
});

Then(/^Add modHeader (.*) (.*) (.*)$/, async (extName, username, password) => {
  if (browserName === 'chrome') {
    await helpers.modHeader(extName, username, password);
    await browser.pause(DELAY_200ms);
    await helpers.loadPage(env.web_url, 10);
    console.log('Chrome extension added successfully');
  }
});

Given(/^This step will always pass$/, async () => {
  expect(true).to.be.true;
});
