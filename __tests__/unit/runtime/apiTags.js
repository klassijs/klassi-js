const { isHeadlessApiScenario } = require('../../../runtime/apiTags');

function tagged(featureTags, scenarioTags) {
  return {
    gherkinDocument: { feature: { tags: featureTags.map((name) => ({ name })) } },
    pickle: { tags: scenarioTags.map((name) => ({ name })) },
  };
}

describe('isHeadlessApiScenario', () => {
  it('skips a screenshot when the scenario is tagged @api', () => {
    expect(isHeadlessApiScenario(tagged([], ['@api']))).toBe(true);
  });

  it('skips a screenshot when the feature is tagged @api', () => {
    expect(isHeadlessApiScenario(tagged(['@api'], ['@smoke']))).toBe(true);
  });

  it('treats @API on either the feature or the scenario as the same tag', () => {
    expect(isHeadlessApiScenario(tagged(['@API'], []))).toBe(true);
  });

  it('leaves a browser scenario eligible for a failure screenshot', () => {
    expect(isHeadlessApiScenario(tagged(['@ui'], ['@regression']))).toBe(false);
  });
});
