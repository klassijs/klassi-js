Given(/^The user arrives on the duckduckgo search page$/, async () => {
  await helpers.loadPage(env.web_url, 10);
});

When(/^they input (.*)$/, async (searchWord) => {
  await pageObjects.search.performWebSearch(searchWord);
});

Then(/^they should see some results (.*)$/, async (searchWord) => {
  await pageObjects.search.searchResult(searchWord);
});
