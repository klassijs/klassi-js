import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { AIEvaluationError } from '@klassijs/ai-core';
import { createTestExecutionContext, textRequest } from '@klassijs/ai-core/testing';
import { HttpAIAdapter } from '../dist/index.js';

function serve(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function endpoint(server) {
  const address = server.address();
  return `http://127.0.0.1:${address.port}/evaluate`;
}

test('a local endpoint returns a normalised result and keeps the api key out of native evidence', async () => {
  const seen = [];
  const server = await serve((request, response) => {
    if (request.method === 'GET') {
      response.writeHead(200);
      response.end('ok');
      return;
    }
    seen.push(request.headers.authorization);
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({
        choices: [{ message: { content: `echo ${body.messages[0].content}` }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 },
      }));
    });
  });
  process.env.KLASSI_HTTP_TEST_KEY = 'local-test-key';
  try {
    const adapter = new HttpAIAdapter({ profile: { endpoint: endpoint(server), apiKeyEnv: 'KLASSI_HTTP_TEST_KEY', timeoutMs: 1000 } });
    const health = await adapter.healthCheck({});
    const result = await adapter.execute(textRequest('hello'), createTestExecutionContext());
    assert.equal(health.status, 'healthy');
    assert.equal(result.status, 'completed');
    assert.equal(result.output.text, 'echo hello');
    assert.equal(result.usage.totalTokens, 5);
    assert.equal(result.finishReason, 'stop');
    assert.equal(seen[0], 'Bearer local-test-key');
    assert.equal(JSON.stringify(result.native).includes('local-test-key'), false);
  } finally {
    delete process.env.KLASSI_HTTP_TEST_KEY;
    server.close();
  }
});

test('http status and abort become normalised execution errors', async () => {
  const server = await serve((request, response) => {
    if (request.method === 'GET') {
      response.writeHead(200);
      response.end('ok');
      return;
    }
    response.writeHead(429);
    response.end('slow down');
  });
  try {
    const adapter = new HttpAIAdapter({ profile: { endpoint: endpoint(server), timeoutMs: 1000 } });
    const limited = await adapter.execute(textRequest(), createTestExecutionContext());
    assert.equal(limited.error.code, 'RATE_LIMIT_ERROR');
    assert.equal(limited.error.retryable, true);

    const hanging = await serve((_request, _response) => {});
    const slow = new HttpAIAdapter({ profile: { endpoint: endpoint(hanging), timeoutMs: 30 } });
    const timedOut = await slow.execute(textRequest(), createTestExecutionContext());
    assert.equal(timedOut.error.code, 'TIMEOUT_ERROR');
    assert.equal(timedOut.error.retryable, true);
    hanging.close();

    const controller = new AbortController();
    controller.abort();
    const aborted = await adapter.execute(textRequest(), createTestExecutionContext({ signal: controller.signal }));
    assert.equal(aborted.error.message, 'Execution aborted');
    assert.equal(aborted.error.retryable, false);
  } finally {
    server.close();
  }
});

test('the profile rejects a non-http endpoint before any request', () => {
  assert.throws(() => new HttpAIAdapter({ profile: { endpoint: 'file:///tmp/model' } }), AIEvaluationError);
});
