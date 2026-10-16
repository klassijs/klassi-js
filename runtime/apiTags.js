/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard
 */
const fs = require('fs');
const path = require('path');

const apiTagsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'scripts/tagList.json')));

function normaliseTag(tag) {
  return String(tag || '').replace(/^@/, '').trim().toLowerCase();
}

function headlessApiTags() {
  return [...(apiTagsData?.tagNames || []), ...(global.tagNames || [])]
    .map(normaliseTag)
    .filter((tag, index, tags) => tag.length > 0 && tags.indexOf(tag) === index);
}

function tagNames(tags) {
  return (tags || []).map((tag) => normaliseTag(tag.name || tag));
}

function isHeadlessApiScenario(scenario) {
  const quiet = headlessApiTags();
  const names = [
    ...tagNames(scenario?.gherkinDocument?.feature?.tags),
    ...tagNames(scenario?.pickle?.tags),
  ];
  return names.includes('api') || names.some((name) => quiet.includes(name));
}

module.exports = { isHeadlessApiScenario, headlessApiTags };
