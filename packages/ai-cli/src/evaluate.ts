import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  aggregateStatus,
  AIEvaluationError,
  createAdapterRegistry,
  createTelemetryCollector,
  emitTelemetry,
  evaluateQualityGate,
  runEvaluation,
  type TelemetrySink,
  type AggregateStatus,
  type EvaluationCase,
  type EvaluationSample,
  type EvaluationSuite,
  type EvaluatorResult,
} from '@klassijs/ai-core';
import { FakeAIAdapter } from '@klassijs/ai-core/testing';
import { AzureOpenAIAdapter, AZURE_JUDGE_ADAPTER_ID, azureConfigurationIssues, defaultAzureProfile, judgeAzureProfile } from '@klassijs/ai-adapter-azure-openai';
import { DatasetValidationError, hashDataset, loadSuiteFile, parseEvaluationSuite } from '@klassijs/ai-datasets';
import { evidenceRunDirectory, FileEvidenceStore } from '@klassijs/ai-evidence';
import { registerDeterministicEvaluators, registerModelEvaluators, registerSecurityEvaluators } from '@klassijs/ai-evaluators';
import { createRunReport, writeRunReports, type ReportArtifact } from '@klassijs/ai-reporters';
import { EXIT_CODES, type ExitCode } from './exit-codes.js';

export interface EvaluateOptions {
  suite: string;
  caseId?: string;
  tag?: string;
  samples?: number;
  concurrency?: number;
  reporters?: ReportArtifact['format'][];
  registry?: ReturnType<typeof createAdapterRegistry>;
  output?: string;
  failFast?: boolean;
  cwd?: string;
  platform?: string;
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
  telemetry?: TelemetrySink;
}

export interface EvaluateOutcome {
  code: ExitCode;
  outputDir?: string;
  runId?: string;
  datasetHash?: string;
  suite?: EvaluationSuite;
  samples?: EvaluationSample[];
}

export interface RunAiEvaluationOptions extends Omit<EvaluateOptions, 'suite'> {
  suite: string | EvaluationSuite;
}

/** Programmatic runner. A string suite is loaded from disk. An object suite is validated and run in memory. */
export async function runAiEvaluation(options: RunAiEvaluationOptions): Promise<EvaluateOutcome> {
  const reporters = options.reporters ?? ['json'];
  if (typeof options.suite === 'string') {
    return evaluateSuite({ ...options, suite: options.suite, reporters });
  }
  try {
    const suite = parseEvaluationSuite(options.suite);
    return await evaluatePrepared(selectCases(suite, { ...options, suite: suite.id, reporters }), hashDataset(suite), { ...options, suite: suite.id, reporters });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { code: classifyError(error) };
  }
}

export async function evaluateSuite(options: EvaluateOptions): Promise<EvaluateOutcome> {
  try {
    const loaded = await loadSuiteFile(resolveSuitePath(options.suite, options.cwd ?? process.cwd()));
    return await evaluatePrepared(selectCases(loaded.suite, options), loaded.datasetHash, options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { code: classifyError(error) };
  }
}

async function evaluatePrepared(suite: EvaluationSuite, datasetHash: string, options: EvaluateOptions): Promise<EvaluateOutcome> {
  try {
    const registry = options.registry ?? createAdapterRegistry();
    if (!options.registry) {
      registerPlatform(registry, suite, options);
    }
    const evaluators = registerModelEvaluators(registerSecurityEvaluators(registerDeterministicEvaluators()));
    const collected = createTelemetryCollector();
    const telemetry: TelemetrySink = options.telemetry
      ? { emit(event) { collected.sink.emit(event); options.telemetry?.emit(event); } }
      : collected.sink;
    const execution = await runEvaluation({
      registry,
      suite,
      telemetry,
      cli: {
        ...(options.samples === undefined ? {} : { samples: options.samples }),
        ...(options.concurrency === undefined ? {} : { concurrency: options.concurrency }),
        ...(options.failFast === undefined ? {} : { failFast: options.failFast }),
      },
    });
    const root = options.output ?? options.cwd ?? process.cwd();
    const outputDir = evidenceRunDirectory(root, execution.run.runId);
    const store = new FileEvidenceStore(root);
    const samples = await scoreSamples(execution.samples.map((record) => record.sample), suite, execution.run, evaluators, registry, store, telemetry);
    await store.save({
      run: { runId: execution.run.runId, suiteId: suite.id, startedAt: execution.run.startedAt },
      suite: { suiteId: suite.id, name: suite.name, version: suite.version },
      cases: suite.cases.map((item) => ({ caseId: item.id, name: item.name, targetAdapter: item.target.adapter })),
      samples: samples.map((sample) => ({
        sampleId: sample.sampleId,
        caseId: sample.caseId,
        request: { messages: suite.cases.find((item) => item.id === sample.caseId)?.input.messages ?? [] },
        response: { text: sample.execution.output.text ?? '' },
        execution: {
          status: sample.execution.status,
          latencyMs: sample.execution.timing.latencyMs,
          finishReason: sample.execution.finishReason,
          model: sample.execution.model,
          usage: sample.execution.usage,
          output: sample.execution.output,
        },
        evaluators: sample.evaluatorResults.map((result) => ({ evaluatorId: result.evaluatorId, result })),
      })),
    });
    const gate = await evaluateQualityGate({
      gate: suite.qualityGate,
      samples,
      ...(suite.costTable ? { costTable: suite.costTable } : {}),
      cases: suite.cases.map((item) => ({ id: item.id, ...(item.tags ? { tags: item.tags } : {}) })),
      evidence: store.writer(execution.run.runId, { sampleId: 'run', caseId: 'suite' }),
    });
    const report = createRunReport({
      run: { runId: execution.run.runId, startedAt: execution.run.startedAt },
      suite,
      samples,
      gate: gate.decision,
      ...(suite.costTable ? { costTable: suite.costTable } : {}),
    });
    emitTelemetry(telemetry, { name: 'gate.completed', runId: execution.run.runId, suiteId: suite.id, status: gate.decision.status });
    await writeRunReports(report, outputDir, options.reporters);
    await writeFile(path.join(outputDir, 'telemetry.jsonl'), `${collected.events.map((event) => JSON.stringify(event)).join('\n')}\n`, 'utf8');
    const code = classifyExit(samples, gate.decision.status);
    const passed = report.cases.filter((item) => item.status === 'pass').length;
    const failed = report.cases.filter((item) => item.status === 'fail').length;
    console.log(`${report.suite.name}: ${report.status}`);
    console.log(`cases: ${passed} passed, ${failed} failed`);
    console.log(`quality gate: ${gate.decision.status}`);
    console.log(`report: ${path.join(outputDir, 'report.json')}`);
    console.log(`exit: ${code}`);
    return { code, outputDir, runId: execution.run.runId, datasetHash, suite, samples };
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { code: classifyError(error) };
  }
}

function registerPlatform(registry: ReturnType<typeof createAdapterRegistry>, suite: EvaluationSuite, options: EvaluateOptions): void {
  const platform = options.platform ?? 'fake';
  if (platform === 'fake') {
    const adapter = new FakeAIAdapter();
    const scriptedText = typeof suite.metadata?.fakeResponse === 'string' ? suite.metadata.fakeResponse : 'hello';
    const scriptedTurns = Array.isArray(suite.metadata?.fakeResponses)
      ? suite.metadata.fakeResponses.filter((item): item is string => typeof item === 'string')
      : [scriptedText];
    for (const item of suite.cases) {
      const sampleCount = options.samples ?? item.execution?.samples ?? 1;
      const turnCount = item.conversation?.turns.length ?? 1;
      const caseText = typeof item.metadata?.fakeResponse === 'string' ? item.metadata.fakeResponse : undefined;
      const toolNames = Array.isArray(item.metadata?.fakeToolCalls) ? item.metadata.fakeToolCalls.filter((name): name is string => typeof name === 'string') : [];
      for (let remaining = sampleCount; remaining > 0; remaining -= 1) {
        for (let turnIndex = 0; turnIndex < turnCount; turnIndex += 1) {
          const text = caseText ?? scriptedTurns[turnIndex] ?? scriptedTurns[scriptedTurns.length - 1] ?? scriptedText;
          adapter.useScript({
            kind: 'success',
            text,
            ...(toolNames.length === 0 ? {} : { toolCalls: toolNames.map((name, index) => ({ id: `call-${index + 1}`, name, status: 'requested' as const })) }),
          });
        }
      }
    }
    registry.register(adapter);
    return;
  }
  if (platform === 'azure-openai') {
    const issues = azureConfigurationIssues(options.env ?? process.env);
    if (issues.length > 0) {
      throw new AIEvaluationError('CONFIG_ERROR', issues.join('\n'));
    }
    registry.register(new AzureOpenAIAdapter({ profile: defaultAzureProfile, env: options.env, fetch: options.fetch }));
    if (suite.cases.some((item) => item.evaluators.some((evaluator) => evaluator.type === 'model'))) {
      const judgeIssues = azureConfigurationIssues(options.env ?? process.env, judgeAzureProfile);
      if (judgeIssues.length > 0) {
        throw new AIEvaluationError('CONFIG_ERROR', judgeIssues.join('\n'));
      }
      registry.register(new AzureOpenAIAdapter({
        id: AZURE_JUDGE_ADAPTER_ID,
        profile: judgeAzureProfile,
        env: options.env,
        fetch: options.fetch,
      }));
    }
    return;
  }
  throw new AIEvaluationError('CONFIG_ERROR', `Unknown AI platform "${platform}". Supported platforms: fake, azure-openai`);
}

function resolveSuitePath(suite: string, cwd: string): string {
  if (existsSync(suite)) {
    return suite;
  }
  const named = path.resolve(cwd, suite);
  if (existsSync(named)) {
    return named;
  }
  const candidates = ['json', 'yaml', 'yml'].map((extension) => path.resolve(cwd, 'examples/ai', `${suite}.${extension}`));
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new AIEvaluationError('DATASET_ERROR', `Suite "${suite}" was not found`);
  }
  return found;
}

function selectCases(suite: EvaluationSuite, options: EvaluateOptions): EvaluationSuite {
  const tag = options.tag?.replace(/^@/, '');
  const cases = suite.cases.filter((item) => {
    const caseMatch = options.caseId === undefined || item.id === options.caseId;
    const tagMatch = tag === undefined || item.tags?.includes(tag) === true;
    return caseMatch && tagMatch;
  });
  if (cases.length === 0) {
    throw new AIEvaluationError('DATASET_ERROR', 'No evaluation cases matched --case/--tag');
  }
  return { ...suite, cases };
}

async function scoreSamples(
  samples: EvaluationSample[],
  suite: EvaluationSuite,
  run: { runId: string; suiteId: string; startedAt: string },
  evaluators: ReturnType<typeof registerModelEvaluators>,
  adapters: ReturnType<typeof createAdapterRegistry>,
  store: FileEvidenceStore,
  telemetry: TelemetrySink,
): Promise<EvaluationSample[]> {
  const scored: EvaluationSample[] = [];
  for (const sample of samples) {
    const evaluationCase = suite.cases.find((item) => item.id === sample.caseId);
    if (!evaluationCase) {
      scored.push(sample);
      continue;
    }
    const evaluatorResults: EvaluatorResult[] = [];
    for (const turn of sample.turns ?? []) {
      const turnSpec = evaluationCase.conversation?.turns.find((item) => item.id === turn.turnId);
      const turnResults: EvaluatorResult[] = [];
      for (const binding of turnSpec?.evaluators ?? []) {
        const scoredTurn = await scoreBinding(binding, evaluationCase, { ...sample, execution: turn.execution }, run, evaluators, adapters, store);
        turnResults.push(scoredTurn);
        emitTelemetry(telemetry, { name: 'evaluator.completed', runId: run.runId, suiteId: run.suiteId, caseId: sample.caseId, sampleId: sample.sampleId, evaluatorId: scoredTurn.evaluatorId, status: scoredTurn.status });
      }
      turn.evaluatorResults = turnResults;
      evaluatorResults.push(...turnResults);
      await store.writer(run.runId, { sampleId: sample.sampleId, caseId: sample.caseId }).write({
        name: `turn-${turn.turnId}`,
        body: {
          turnId: turn.turnId,
          index: turn.index,
          messages: turn.messages,
          response: turn.execution.output.text ?? '',
          status: turn.execution.status,
          evaluatorResults: turnResults,
        },
      });
    }
    for (const binding of evaluationCase.evaluators) {
      const scored = await scoreBinding(binding, evaluationCase, sample, run, evaluators, adapters, store);
      evaluatorResults.push(scored);
      emitTelemetry(telemetry, { name: 'evaluator.completed', runId: run.runId, suiteId: run.suiteId, caseId: sample.caseId, sampleId: sample.sampleId, evaluatorId: scored.evaluatorId, status: scored.status });
    }
    const statuses = evaluatorResults.map((result) => result.status).filter(isAggregateStatus);
    scored.push({
      ...sample,
      evaluatorResults,
      status: statuses.length === 0 ? sample.status : aggregateStatus(statuses),
    });
  }
  return scored;
}

async function scoreBinding(
  binding: EvaluationCase['evaluators'][number],
  evaluationCase: EvaluationCase,
  sample: EvaluationSample,
  run: { runId: string; suiteId: string; startedAt: string },
  evaluators: ReturnType<typeof registerModelEvaluators>,
  adapters: ReturnType<typeof createAdapterRegistry>,
  store: FileEvidenceStore,
): Promise<EvaluatorResult> {
  const evaluator = evaluators.resolve(binding);
  return evaluator.evaluate({
    run,
    evaluationCase,
    sample,
    result: sample.execution,
    config: binding.config ?? {},
    adapters,
    evidence: store.writer(run.runId, { sampleId: sample.sampleId, caseId: sample.caseId }),
  });
}

function classifyExit(samples: EvaluationSample[], gateStatus: 'pass' | 'fail'): ExitCode {
  if (samples.some((sample) => sample.execution.status !== 'completed')) {
    return EXIT_CODES.executionFailure;
  }
  if (samples.some((sample) => sample.evaluatorResults.some((result) => result.status === 'error'))) {
    return EXIT_CODES.evaluatorFailure;
  }
  return gateStatus === 'pass' ? EXIT_CODES.passed : EXIT_CODES.qualityGateFailed;
}

function classifyError(error: unknown): ExitCode {
  if (error instanceof DatasetValidationError) {
    return EXIT_CODES.configurationError;
  }
  if (error instanceof AIEvaluationError) {
    if (error.code === 'DATASET_ERROR' || error.code === 'CONFIG_ERROR') {
      return EXIT_CODES.configurationError;
    }
    if (error.code === 'EVALUATOR_ERROR') {
      return EXIT_CODES.evaluatorFailure;
    }
    if (error.code === 'EVIDENCE_ERROR' || error.code === 'REPORTER_ERROR') {
      return EXIT_CODES.reportingFailure;
    }
    if (error.code === 'PROVIDER_UNAVAILABLE' || error.code === 'ADAPTER_NOT_FOUND' || error.code === 'TIMEOUT_ERROR') {
      return EXIT_CODES.executionFailure;
    }
  }
  return EXIT_CODES.internalError;
}

function isAggregateStatus(status: string): status is AggregateStatus {
  return status === 'pass' || status === 'fail' || status === 'error' || status === 'review';
}
