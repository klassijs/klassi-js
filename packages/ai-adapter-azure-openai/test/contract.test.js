import { registerAdapterContractTests } from '@klassijs/ai-core/testing';
import { AzureOpenAIAdapter, defaultAzureProfile } from '../dist/index.js';

const secret = 'super-secret-token';
const env = {
  AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com',
  AZURE_OPENAI_DEPLOYMENT: 'support-eval',
  AZURE_OPENAI_API_KEY: secret,
};

registerAdapterContractTests({
  name: 'AzureOpenAIAdapter responses',
  secret,
  createAdapter: () => scriptedAdapter('responses'),
});

registerAdapterContractTests({
  name: 'AzureOpenAIAdapter chat completions',
  secret,
  createAdapter: () => scriptedAdapter('chat-completions'),
});

function scriptedAdapter(executionApi) {
  const scripts = [];
  let clock = 0;
  const adapter = new AzureOpenAIAdapter({
    profile: { ...defaultAzureProfile, executionApi },
    env,
    now: () => clock,
    async fetch(url, init) {
      if (init?.method === 'GET' || String(url).endsWith('/models')) {
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
        return new Response('slow down', { status: 429, headers: { 'retry-after': '2' } });
      }
      if (script.kind === 'provider-failure') {
        return Response.json({ error: { code: script.providerCode, message: 'provider failed' } }, { status: 500 });
      }
      if (script.kind === 'authentication') {
        return new Response(script.message ?? 'Authentication failed', { status: 401 });
      }
      clock += script.latencyMs ?? 0;
      return Response.json(executionApi === 'chat-completions' ? chatBody(script) : responsesBody(script));
    },
  });
  return Object.assign(adapter, {
    useScript(script) {
      scripts.push(script);
    },
  });
}

function responsesBody(script) {
  return {
    id: 'resp_contract',
    model: 'provider-model',
    status: 'completed',
    output: [
      {
        type: 'message',
        content: [
          {
            type: 'output_text',
            text: script.text,
            annotations: (script.citations ?? []).map((citation) => ({ type: 'url_citation', id: citation.id, url: citation.uri, title: citation.title })),
          },
          ...(script.structured !== undefined ? [{ type: 'output_json', json: script.structured }] : []),
        ],
      },
      ...(script.toolCalls ?? []).map((call) => ({ type: 'function_call', call_id: call.id, name: call.name, arguments: '{}' })),
    ],
    usage: {
      input_tokens: script.usage?.inputTokens,
      output_tokens: script.usage?.outputTokens,
      total_tokens: script.usage?.totalTokens,
    },
    content_filter_results: Object.fromEntries((script.safety ?? []).map((item) => [item.category, { filtered: item.action === 'block', severity: item.severity }])),
  };
}

function chatBody(script) {
  return {
    id: 'chatcmpl_contract',
    model: 'provider-model',
    choices: [
      {
        finish_reason: script.finishReason ?? 'stop',
        message: {
          content: [
            { type: 'text', text: script.text },
            ...(script.structured !== undefined ? [{ type: 'json', json: script.structured }] : []),
          ],
          context: { citations: (script.citations ?? []).map((citation) => ({ id: citation.id, title: citation.title, url: citation.uri })) },
          tool_calls: (script.toolCalls ?? []).map((call) => ({ id: call.id, type: 'function', function: { name: call.name, arguments: '{}' } })),
        },
        content_filter_results: Object.fromEntries((script.safety ?? []).map((item) => [item.category, { filtered: item.action === 'block', severity: item.severity }])),
      },
    ],
    usage: {
      prompt_tokens: script.usage?.inputTokens,
      completion_tokens: script.usage?.outputTokens,
      total_tokens: script.usage?.totalTokens,
    },
  };
}
