import assert from 'node:assert/strict';
import test from 'node:test';
import { harvestProductWithBrowser, harvestRenderedNodes } from '../dist/browserHarvest.js';

test('harvestRenderedNodes reads the live page script result', async () => {
  const nodes = await harvestRenderedNodes({
    url: async () => undefined,
    execute: async () => [{ tag: 'img', text: 'klassi trademark logo', aria: undefined }],
  });
  assert.equal(nodes[0].text, 'klassi trademark logo');
});

test('harvestProductWithBrowser opens each URL and closes the session', async () => {
  const opened = [];
  let closed = false;
  const nodes = await harvestProductWithBrowser(['https://klassi.co.uk'], {
    openBrowser: async () => ({
      url: async (target) => {
        opened.push(target);
      },
      pause: async () => undefined,
      waitUntil: async () => undefined,
      execute: async () => [{ tag: 'img', text: 'klassi trademark logo' }],
      deleteSession: async () => {
        closed = true;
      },
    }),
  });
  assert.deepEqual(opened, ['https://klassi.co.uk']);
  assert.equal(closed, true);
  assert.equal(nodes[0].text, 'klassi trademark logo');
});
