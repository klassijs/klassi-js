import { createHash } from 'node:crypto';
import { AIEvaluationError, createEvaluatorResult, type AIExecutionResult, type Evaluator, type EvaluatorContext, type EvaluatorResult } from '@klassijs/ai-core';
import { getJudgePrompt } from './judge-prompts.js';
import { EVALUATOR_VERSION, failedConfig, outputText } from './support.js';

export interface JudgeScore {
  score: number;
  reason: string;
}

export function parseJudgeScore(text: string): JudgeScore | string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return 'judge output is not JSON';
  }
  if (!parsed || typeof parsed !== 'object') {
    return 'judge output must be an object';
  }
  const record = parsed as { score?: unknown; reason?: unknown };
  if (typeof record.score !== 'number' || !Number.isFinite(record.score) || record.score < 0 || record.score > 1) {
    return 'judge score must be a number from 0 to 1';
  }
  if (typeof record.reason !== 'string' || record.reason.trim().length === 0) {
    return 'judge reason is required';
  }
  return { score: record.score, reason: record.reason };
}

export function createModelEvaluator(id: string, name: string): Evaluator {
  return {
    id,
    name,
    version: EVALUATOR_VERSION,
    kind: 'model',
    evaluate: (context) => evaluateModel(id, context),
  };
}

async function evaluateModel(id: string, context: EvaluatorContext): Promise<EvaluatorResult> {
  const evaluator = { id, version: EVALUATOR_VERSION };
  const prompt = getJudgePrompt(id);
  const binding = context.evaluationCase.evaluators.find((item) => item.id === id && item.type === 'model');
  if (!prompt) {
    return failedConfig(evaluator, `No judge prompt is registered for ${id}`);
  }
  if (!binding?.judge?.adapter) {
    return failedConfig(evaluator, `${id} requires a judge adapter`);
  }

  let adapter;
  try {
    adapter = context.adapters.get(binding.judge.adapter);
  } catch (error) {
    const message = error instanceof AIEvaluationError ? error.message : 'judge adapter was not found';
    return failedConfig(evaluator, message);
  }

  const request = {
    messages: [
      { role: 'system' as const, content: prompt.instructions },
      { role: 'user' as const, content: `Request:\n${caseRequest(context)}\n\nAnswer:\n${outputText(context.result)}` },
    ],
    metadata: { profile: binding.judge.profile },
  };
  const requestHash = createHash('sha256').update(JSON.stringify(request)).digest('hex');
  const startedAt = new Date().toISOString();
  const judged = await adapter.execute(request, {
    runId: context.run.runId,
    suiteId: context.run.suiteId,
    caseId: context.evaluationCase.id,
    sampleId: context.sample.sampleId,
    startedAt,
    evidence: context.evidence,
    logger: { debug() {}, info() {}, warn() {}, error() {} },
  });
  const parsed = parseJudgeScore(judged.output.text ?? '');
  const evidenceRef = await context.evidence.write({
    name: `judge-${id}`,
    body: {
      judgeAdapterId: adapter.id,
      judgeAdapterVersion: adapter.version,
      judgeProfile: binding.judge.profile,
      judgeModel: judged.model,
      promptId: prompt.id,
      promptVersion: prompt.version,
      requestHash,
      response: judged.output.text ?? '',
      parsedScore: typeof parsed === 'string' ? null : parsed.score,
      reason: typeof parsed === 'string' ? parsed : parsed.reason,
      timing: judged.timing,
      usage: judged.usage ?? null,
    },
  });

  if (judged.status !== 'completed') {
    return createEvaluatorResult(evaluator, {
      status: 'error',
      evidenceRefs: [evidenceRef],
      metadata: judgeMetadata(adapter, binding.judge.profile, prompt, requestHash, judged),
      error: { code: judged.error?.code ?? 'EVALUATOR_ERROR', message: judged.error?.message ?? 'judge execution failed' },
    });
  }
  if (typeof parsed === 'string') {
    return createEvaluatorResult(evaluator, {
      status: 'error',
      evidenceRefs: [evidenceRef],
      metadata: judgeMetadata(adapter, binding.judge.profile, prompt, requestHash, judged),
      error: { code: 'EVALUATOR_ERROR', message: parsed },
    });
  }

  const threshold = binding.threshold;
  const passed = threshold === undefined || parsed.score >= threshold;
  return createEvaluatorResult(evaluator, {
    status: passed ? 'pass' : 'fail',
    score: parsed.score,
    ...(threshold === undefined ? {} : { threshold }),
    reason: parsed.reason,
    evidenceRefs: [evidenceRef],
    metadata: judgeMetadata(adapter, binding.judge.profile, prompt, requestHash, judged),
  });
}

function caseRequest(context: EvaluatorContext): string {
  return context.evaluationCase.input.messages
    .map((message) => (typeof message.content === 'string' ? message.content : ''))
    .join('\n');
}

function judgeMetadata(
  adapter: { id: string; version: string },
  profile: string | undefined,
  prompt: { id: string; version: string },
  requestHash: string,
  judged: AIExecutionResult,
): Record<string, unknown> {
  return {
    judgeAdapterId: adapter.id,
    judgeAdapterVersion: adapter.version,
    ...(profile ? { judgeProfile: profile } : {}),
    ...(judged.model?.requested ? { judgeModel: judged.model.requested } : {}),
    ...(judged.model?.deployment ? { judgeDeployment: judged.model.deployment } : {}),
    promptId: prompt.id,
    promptVersion: prompt.version,
    requestHash,
    latencyMs: judged.timing.latencyMs,
    ...(judged.usage ? { usage: judged.usage } : {}),
  };
}
