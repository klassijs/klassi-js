import { registerAdapterContractTests } from '@klassijs/ai-core/testing';
import { HttpAIAdapter } from '../dist/index.js';

const secret = 'super-secret-token';

registerAdapterContractTests({
  name: 'HttpAIAdapter',
  secret,
  createAdapter() {
    const scripts = [];
    const adapter = new HttpAIAdapter({
      id: 'http',
      profile: { endpoint: 'http://127.0.0.1/evaluate', timeoutMs: 1000 },
      redactValues: [secret],
      async fetch(_url, init) {
        if (init?.method === 'GET') {
          return new Response('ok', { status: 200 });
        }
        if (init?.signal?.aborted) {
          const aborted = new Error('aborted');
          aborted.name = 'AbortError';
          throw aborted;
        }
        const script = scripts.shift() ?? { kind: 'success', text: '' };
        if (script.kind === 'timeout') {
          const timeout = new Error('timeout');
          timeout.name = 'AbortError';
          throw timeout;
        }
        if (script.kind === 'rate-limit') {
          return new Response('slow down', { status: 429 });
        }
        if (script.kind === 'provider-failure') {
          return Response.json({ code: script.providerCode }, { status: 500 });
        }
        if (script.kind === 'authentication') {
          return new Response(script.message ?? 'Authentication failed', { status: 401 });
        }
        return Response.json({
          text: script.text,
          structured: script.structured,
          usage: script.usage,
          citations: script.citations,
          toolCalls: script.toolCalls,
          safety: script.safety,
          finishReason: script.finishReason,
          latencyMs: script.latencyMs ?? 0,
        });
      },
    });
    return Object.assign(adapter, {
      useScript(script) {
        scripts.push(script);
      },
    });
  },
});
