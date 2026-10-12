import { createHash } from 'node:crypto';
import type { AdapterHealth } from '../adapter.js';
import type { AIExecutionRequest, AIExecutionResult, EvidenceWriter, ExecutionContext } from '../execution.js';
import type { EvaluationSample } from '../sample.js';
import type { EvaluationSuite } from '../evaluation.js';
import { AIEvaluationError } from '../errors.js';
import type { AdapterRegistry } from '../registry.js';
import type { RunContext } from '../evaluator.js';
import type { ExecutionPolicy } from '../policy.js';
import { createRunId } from './ids.js';
import { planSuite, type PlannedSample } from './plan.js';
import { isInfrastructureRetry, retryDelayMs } from './policy.js';

export interface AttemptRecord {
  attempt: number;
  result: AIExecutionResult;
  retried: boolean;
}

export interface SampleRecord {
  plan: PlannedSample;
  attempts: AttemptRecord[];
  sample: EvaluationSample;
  evidence: Array<{ ref: string; name: string; body: unknown }>;
}

export interface EvaluationRun {
  run: RunContext;
  health: Array<{ adapterId: string; health: AdapterHealth }>;
  samples: SampleRecord[];
}

export interface RunEvaluationOptions {
  registry: AdapterRegistry;
  suite: EvaluationSuite;
  signal?: AbortSignal;
  cli?: Partial<ExecutionPolicy>;
  createRunId?: () => string;
  sleep?: (ms: number) => Promise<void>;
  now?: () => string;
}

const silentLogger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function requestHash(request: AIExecutionRequest): string {
  return createHash('sha256').update(JSON.stringify(request)).digest('hex');
}

function timeoutResult(adapterId: string, startedAt: string, timeoutMs: number): AIExecutionResult {
  return {
    id: `${adapterId}-timeout`,
    adapterId,
    status: 'failed',
    output: {},
    timing: {
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + timeoutMs).toISOString(),
      latencyMs: timeoutMs,
    },
    error: { code: 'TIMEOUT_ERROR', message: 'Sample exceeded timeoutMs', retryable: true },
  };
}

async function executeSampleAttempt(
  adapter: { execute: (request: AIExecutionRequest, context: ExecutionContext) => Promise<AIExecutionResult> },
  request: AIExecutionRequest,
  context: ExecutionContext,
  timeoutMs: number,
): Promise<AIExecutionResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<AIExecutionResult>((resolve) => {
    timer = setTimeout(() => resolve(timeoutResult(context.metadata?.adapterId as string, context.startedAt, timeoutMs)), timeoutMs);
  });
  try {
    return await Promise.race([adapter.execute(request, context), timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runWorker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index] as T);
    }
  };
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, () => runWorker());
  await Promise.all(workers);
  return results;
}

export async function runEvaluation(options: RunEvaluationOptions): Promise<EvaluationRun> {
  const now = options.now ?? (() => new Date().toISOString());
  const sleep = options.sleep ?? defaultSleep;
  const run: RunContext = {
    runId: (options.createRunId ?? createRunId)(),
    suiteId: options.suite.id,
    startedAt: now(),
  };
  const planned = planSuite(options.suite, run.runId, options.cli);
  const adapterIds = [...new Set(options.suite.cases.map((evaluationCase) => evaluationCase.target.adapter))];
  const health: EvaluationRun['health'] = [];

  for (const adapterId of adapterIds) {
    const adapter = options.registry.get(adapterId);
    const profile = options.suite.cases.find((evaluationCase) => evaluationCase.target.adapter === adapterId)?.target.profile;
    const checked = await adapter.healthCheck({ ...(profile ? { profile } : {}), signal: options.signal });
    health.push({ adapterId, health: checked });
    if (checked.status !== 'healthy') {
      throw new AIEvaluationError('PROVIDER_UNAVAILABLE', `Adapter "${adapterId}" failed its health check`);
    }
  }

  const byCase = new Map<string, PlannedSample[]>();
  for (const sample of planned) {
    const group = byCase.get(sample.evaluationCase.id) ?? [];
    group.push(sample);
    byCase.set(sample.evaluationCase.id, group);
  }

  const samples: SampleRecord[] = [];
  for (const group of byCase.values()) {
    if (options.signal?.aborted) {
      break;
    }
    const concurrency = group[0]?.policy.concurrency ?? 1;
    const records = await mapPool(group, concurrency, (plannedSample) =>
      executePlannedSample(plannedSample, options, run, sleep, now),
    );
    samples.push(...records);
    if (group[0]?.policy.failFast && records.some((record) => record.sample.status === 'error')) {
      break;
    }
  }

  return { run, health, samples };
}

async function executePlannedSample(
  plannedSample: PlannedSample,
  options: RunEvaluationOptions,
  run: RunContext,
  sleep: (ms: number) => Promise<void>,
  now: () => string,
): Promise<SampleRecord> {
  const evaluationCase = plannedSample.evaluationCase;
  const adapter = options.registry.get(evaluationCase.target.adapter);
  const request: AIExecutionRequest = {
    messages: evaluationCase.input.messages,
    ...(evaluationCase.target.model ? { model: evaluationCase.target.model } : {}),
    ...(evaluationCase.target.deployment ? { deployment: evaluationCase.target.deployment } : {}),
  };
  const artifacts: Array<{ ref: string; name: string; body: unknown }> = [];
  const evidence: EvidenceWriter = {
    async write(artifact) {
      const ref = `${plannedSample.sampleId}:${artifacts.length}`;
      artifacts.push({ ref, name: artifact.name, body: artifact.body });
      return ref;
    },
  };
  const attempts: AttemptRecord[] = [];
  const maxAttempts = plannedSample.policy.retry.maxInfrastructureRetries + 1;
  let finalResult: AIExecutionResult | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      finalResult = timeoutResult(adapter.id, now(), 0);
      finalResult.error = { code: 'TIMEOUT_ERROR', message: 'Execution aborted', retryable: false };
      attempts.push({ attempt, result: finalResult, retried: false });
      break;
    }

    const startedAt = now();
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onAbort);
    const timer = setTimeout(() => controller.abort(), plannedSample.policy.timeoutMs);
    const context: ExecutionContext = {
      runId: run.runId,
      suiteId: run.suiteId,
      caseId: evaluationCase.id,
      sampleId: plannedSample.sampleId,
      startedAt,
      deadline: new Date(Date.parse(startedAt) + plannedSample.policy.timeoutMs).toISOString(),
      signal: controller.signal,
      evidence,
      logger: silentLogger,
      metadata: { adapterId: adapter.id },
    };

    let result: AIExecutionResult;
    try {
      result = await executeSampleAttempt(adapter, request, context, plannedSample.policy.timeoutMs);
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
    }

    const retry = attempt < maxAttempts && isInfrastructureRetry(result);
    attempts.push({ attempt, result, retried: retry });
    finalResult = result;
    if (!retry) {
      break;
    }
    await evidence.write({ name: `retry-${attempt}`, body: { sampleId: plannedSample.sampleId, attempt, code: result.error?.code } });
    await sleep(retryDelayMs(plannedSample.policy, attempt - 1));
  }

  if (!finalResult) {
    throw new AIEvaluationError('INTERNAL_ERROR', `Sample "${plannedSample.sampleId}" produced no result`);
  }

  const completedAt = finalResult.timing.completedAt;
  return {
    plan: plannedSample,
    attempts,
    evidence: artifacts,
    sample: {
      sampleId: plannedSample.sampleId,
      sampleIndex: plannedSample.sampleIndex,
      caseId: evaluationCase.id,
      requestHash: requestHash(request),
      execution: finalResult,
      evaluatorResults: [],
      status: finalResult.status === 'completed' ? 'review' : 'error',
      startedAt: attempts[0]?.result.timing.startedAt ?? now(),
      completedAt,
    },
  };
}
