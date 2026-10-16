import { createHash } from 'node:crypto';
import type { AdapterHealth, AIPlatformAdapter } from '../adapter.js';
import type { AIExecutionRequest, AIExecutionResult, AIResponseFormat, EvidenceWriter, ExecutionContext } from '../execution.js';
import type { AIMessage } from '../messages.js';
import type { ConversationTurnResult, EvaluationSample } from '../sample.js';
import type { EvaluationCase, EvaluationSuite } from '../evaluation.js';
import { AIEvaluationError } from '../errors.js';
import type { AdapterRegistry } from '../registry.js';
import type { RunContext } from '../evaluator.js';
import type { ExecutionPolicy } from '../policy.js';
import { createRunId } from './ids.js';
import { planSuite, type PlannedSample } from './plan.js';
import { isInfrastructureRetry, retryDelayMs } from './policy.js';
import { emitTelemetry, type TelemetrySink } from '../telemetry.js';

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
  telemetry?: TelemetrySink;
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

/** A case schema, or an explicit JSON flag, asks the adapter for JSON output. */
function withResponseFormat(evaluationCase: EvaluationCase, request: AIExecutionRequest): AIExecutionRequest {
  const schema = jsonSchemaFor(evaluationCase);
  const explicitJson = evaluationCase.metadata?.json === true || evaluationCase.target.options?.json === true;
  if (!schema && !explicitJson) {
    return request;
  }
  const responseFormat: AIResponseFormat = schema ? { type: 'json', schema } : { type: 'json' };
  return { ...request, responseFormat };
}

function jsonSchemaFor(evaluationCase: EvaluationCase): Record<string, unknown> | undefined {
  if (evaluationCase.expectations?.expectedSchema) {
    return evaluationCase.expectations.expectedSchema;
  }
  for (const binding of evaluationCase.evaluators) {
    const schema = binding.config?.schema;
    if (binding.id === 'json-schema' && schema && typeof schema === 'object' && !Array.isArray(schema)) {
      return schema as Record<string, unknown>;
    }
  }
  return undefined;
}

function scoredExecutionStatus(status: AIExecutionResult['status']): 'review' | 'error' {
  return status === 'completed' || status === 'blocked' ? 'review' : 'error';
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
      const detail = checked.checks?.filter((check) => check.status === 'fail').map((check) => check.message).filter((message): message is string => Boolean(message)).join('; ');
      throw new AIEvaluationError('PROVIDER_UNAVAILABLE', detail ? `Adapter "${adapterId}" failed its health check: ${detail}` : `Adapter "${adapterId}" failed its health check`);
    }
  }

  emitTelemetry(options.telemetry, { name: 'run.started', runId: run.runId, suiteId: run.suiteId });
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
    const caseId = group[0]?.evaluationCase.id ?? 'unknown';
    emitTelemetry(options.telemetry, { name: 'case.started', runId: run.runId, suiteId: run.suiteId, caseId });
    const concurrency = group[0]?.policy.concurrency ?? 1;
    const records = await mapPool(group, concurrency, (plannedSample) =>
      executePlannedSample(plannedSample, options, run, sleep, now),
    );
    samples.push(...records);
    emitTelemetry(options.telemetry, {
      name: 'case.completed',
      runId: run.runId,
      suiteId: run.suiteId,
      caseId,
      status: records.some((record) => record.sample.status === 'error') ? 'error' : 'review',
    });
    if (group[0]?.policy.failFast && records.some((record) => record.sample.status === 'error')) {
      break;
    }
  }

  emitTelemetry(options.telemetry, { name: 'run.completed', runId: run.runId, suiteId: run.suiteId, status: samples.some((record) => record.sample.status === 'error') ? 'error' : 'completed' });
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
  const artifacts: Array<{ ref: string; name: string; body: unknown }> = [];
  const evidence: EvidenceWriter = {
    async write(artifact) {
      const ref = `${plannedSample.sampleId}:${artifacts.length}`;
      artifacts.push({ ref, name: artifact.name, body: artifact.body });
      return ref;
    },
  };
  emitTelemetry(options.telemetry, { name: 'sample.started', runId: run.runId, suiteId: run.suiteId, caseId: evaluationCase.id, sampleId: plannedSample.sampleId });
  const attempts: AttemptRecord[] = [];
  const requestBase = {
    ...(evaluationCase.target.model ? { model: evaluationCase.target.model } : {}),
    ...(evaluationCase.target.deployment ? { deployment: evaluationCase.target.deployment } : {}),
  };

  if (evaluationCase.conversation && evaluationCase.conversation.turns.length > 0) {
    const history: AIMessage[] = [];
    const turns: ConversationTurnResult[] = [];
    let finalResult: AIExecutionResult | undefined;
    for (const [index, turn] of evaluationCase.conversation.turns.entries()) {
      history.push(...turn.messages);
      const request: AIExecutionRequest = withResponseFormat(evaluationCase, { ...requestBase, messages: history.map((message) => ({ ...message })) });
      const executed = await runAttempts(request, adapter, plannedSample, options, run, evidence, sleep, now);
      attempts.push(...executed.attempts);
      finalResult = executed.result;
      const responseText = executed.result.output.text ?? '';
      turns.push({
        turnId: turn.id,
        index,
        messages: history.map((message) => ({ ...message })),
        execution: executed.result,
        evaluatorResults: [],
      });
      await evidence.write({
        name: `turn-${turn.id}`,
        body: { turnId: turn.id, index, request: turn.messages, history: history.map((message) => ({ ...message })), response: responseText, status: executed.result.status },
      });
      if (executed.result.status !== 'completed') {
        break;
      }
      history.push({ role: 'assistant', content: responseText });
    }
    if (!finalResult) {
      throw new AIEvaluationError('INTERNAL_ERROR', `Sample "${plannedSample.sampleId}" produced no result`);
    }
    emitTelemetry(options.telemetry, {
      name: 'sample.completed',
      runId: run.runId,
      suiteId: run.suiteId,
      caseId: evaluationCase.id,
      sampleId: plannedSample.sampleId,
      status: scoredExecutionStatus(finalResult.status),
    });
    const transcript = turns.map((turn) => turn.execution.output.text ?? '').filter((text) => text.length > 0).join('\n');
    return {
      plan: plannedSample,
      attempts,
      evidence: artifacts,
      sample: {
        sampleId: plannedSample.sampleId,
        sampleIndex: plannedSample.sampleIndex,
        caseId: evaluationCase.id,
        requestHash: requestHash({ ...requestBase, messages: history }),
        execution: { ...finalResult, output: { ...finalResult.output, text: transcript, messages: history.map((message) => ({ ...message })) } },
        turns,
        evaluatorResults: [],
        status: scoredExecutionStatus(finalResult.status),
        startedAt: attempts[0]?.result.timing.startedAt ?? now(),
        completedAt: finalResult.timing.completedAt,
      },
    };
  }

  const request: AIExecutionRequest = withResponseFormat(evaluationCase, { ...requestBase, messages: evaluationCase.input.messages });
  const executed = await runAttempts(request, adapter, plannedSample, options, run, evidence, sleep, now);
  emitTelemetry(options.telemetry, {
    name: 'sample.completed',
    runId: run.runId,
    suiteId: run.suiteId,
    caseId: evaluationCase.id,
    sampleId: plannedSample.sampleId,
    status: scoredExecutionStatus(executed.result.status),
    latencyMs: executed.result.timing.latencyMs,
  });
  return {
    plan: plannedSample,
    attempts: executed.attempts,
    evidence: artifacts,
    sample: {
      sampleId: plannedSample.sampleId,
      sampleIndex: plannedSample.sampleIndex,
      caseId: evaluationCase.id,
      requestHash: requestHash(request),
      execution: executed.result,
      evaluatorResults: [],
      status: scoredExecutionStatus(executed.result.status),
      startedAt: executed.attempts[0]?.result.timing.startedAt ?? now(),
      completedAt: executed.result.timing.completedAt,
    },
  };
}

async function runAttempts(
  request: AIExecutionRequest,
  adapter: AIPlatformAdapter,
  plannedSample: PlannedSample,
  options: RunEvaluationOptions,
  run: RunContext,
  evidence: EvidenceWriter,
  sleep: (ms: number) => Promise<void>,
  now: () => string,
): Promise<{ result: AIExecutionResult; attempts: AttemptRecord[] }> {
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
      caseId: plannedSample.evaluationCase.id,
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
    emitTelemetry(options.telemetry, {
      name: 'adapter.call',
      runId: run.runId,
      suiteId: run.suiteId,
      caseId: plannedSample.evaluationCase.id,
      sampleId: plannedSample.sampleId,
      adapterId: adapter.id,
      status: result.status,
      latencyMs: result.timing.latencyMs,
      attempt,
    });
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
  return { result: finalResult, attempts };
}
