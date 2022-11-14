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

When(/^The screenshots should differ with the filenames "([^"]*)" & "([^"]*)"$/, async (fileName1, fileName2) => {
  const numDiffPixels = await helpers.imagePixelMatch(fileName1, fileName2);
  assert.isAbove(numDiffPixels, 0, 'Num of pixels should be greater than 0');
});

Then(/^Add modHeader (.*) (.*) (.*)$/, async (extName, username, password) => {
  if (browserName === 'chrome') {
    await helpers.modHeader(extName, username, password);
    await browser.pause(DELAY_200ms);
    await helpers.loadPage(env.web_url, 10);
    console.log('Chrome extension added successfully');
  }
});
