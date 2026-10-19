import { parentPort, workerData } from 'node:worker_threads';
import vm from 'node:vm';

interface WorkerInput {
  code: string;
  test: string;
  timeoutMs: number;
  maxOutputBytes: number;
}

const input = workerData as WorkerInput;
const logs: string[] = [];

function pushLog(value: string): void {
  logs.push(value);
  const used = logs.join('\n').length;
  if (used > input.maxOutputBytes) {
    throw new Error('Sandbox output exceeded the limit');
  }
}

const moduleRecord: { exports: Record<string, unknown> } = { exports: {} };
const sandbox = {
  console: {
    log: (...args: unknown[]) => pushLog(args.map((item) => String(item)).join(' ')),
  },
  assert: {
    equal(actual: unknown, expected: unknown, message?: string) {
      if (actual !== expected) {
        throw new Error(message ?? 'assertion failed');
      }
    },
    ok(value: unknown, message?: string) {
      if (!value) {
        throw new Error(message ?? 'assertion failed');
      }
    },
  },
  module: moduleRecord,
  exports: moduleRecord.exports,
};

try {
  vm.runInNewContext(`${input.code}\n${input.test}`, sandbox, { timeout: input.timeoutMs });
  parentPort?.postMessage({ ok: true, logs: logs.join('\n'), envKeys: Object.keys(process.env) });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  parentPort?.postMessage({ ok: false, logs: logs.join('\n'), message, envKeys: Object.keys(process.env) });
}
