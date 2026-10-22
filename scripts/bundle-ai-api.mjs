import { build } from 'esbuild';

await build({
  entryPoints: ['scripts/ai-public-entry.mjs'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'runtime/ai/api.cjs',
  target: 'node22',
  legalComments: 'none',
  external: ['webdriverio'],
});
