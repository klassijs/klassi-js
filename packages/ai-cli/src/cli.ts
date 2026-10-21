import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Command, CommanderError } from 'commander';
import { compareBaselines, createBaseline, type ComparisonThresholds } from '@klassijs/ai-core';
import { DatasetValidationError, parseBaseline } from '@klassijs/ai-datasets';
import type { ReportArtifact } from '@klassijs/ai-reporters';
import { runAzureDoctor } from '@klassijs/ai-adapter-azure-openai';
import { fetchBundle, importTestGenieBundle, readBundle } from '@klassijs/ai-artefacts/import';
import { evaluateSuite, type EvaluateOptions } from './evaluate.js';
import { EXIT_CODES } from './exit-codes.js';

const REPORT_FORMATS: Record<string, ReportArtifact['format']> = {
  json: 'json',
  markdown: 'markdown',
  html: 'html',
  cucumber: 'cucumber-json',
  junit: 'junit',
  sarif: 'sarif',
};

export async function execute(argv: string[]): Promise<number> {
  let code: number = EXIT_CODES.configurationError;
  const program = new Command();
  program.exitOverride().name('klassi');
  addRunOptions(program.command('ai:evaluate').description('Run an AI evaluation suite'))
    .option('--reporter <list>', 'json, markdown, html, cucumber, junit, sarif', 'json,markdown,html,cucumber,junit,sarif')
    .option('--output <dir>', 'directory that receives the run evidence and reports')
    .action(async (options) => {
      const outcome = await evaluateSuite(runOptions(options, parseReporters(options.reporter)));
      code = outcome.code;
    });
  addRunOptions(program.command('ai:baseline').description('Run a suite and save the result as a baseline'))
    .requiredOption('--output <file>', 'baseline JSON file')
    .option('--name <name>', 'baseline name')
    .action(async (options) => {
      code = await writeBaseline(options);
    });
  addRunOptions(program.command('ai:compare').description('Run a suite and compare it with a baseline'))
    .requiredOption('--baseline <file>', 'baseline JSON file')
    .option('--output <dir>', 'directory that receives the run evidence and reports')
    .option('--score-delta <number>', 'absolute score change that counts as material', parseDelta)
    .option('--pass-rate-delta <number>', 'absolute pass-rate change that counts as material', parseDelta)
    .option('--latency-delta <number>', 'absolute P95 latency change, in milliseconds, that counts as material', parseDelta)
    .action(async (options) => {
      code = await compareRun(options);
    });
  program.command('ai:doctor').description('Check AI platform configuration and connectivity').requiredOption('--platform <id>', 'platform adapter id').action(async (options: { platform: string }) => {
    code = await runAzureDoctor({ platform: options.platform });
  });
  program
    .command('ai:import')
    .description('Import a verified Test Genie bundle into features, steps, and page objects')
    .option('--file <path>', 'bundle JSON file')
    .option('--dir <path>', 'folder that contains bundle.json')
    .option('--from <source>', 'pull a stored bundle from Test Genie SaaS')
    .option('--generation <id>', 'Test Genie generation id')
    .option('--out <dir>', 'project directory that receives the Cucumber files', '.')
    .option('--bind-locators', 'open the product URL and bind locators from the live page')
    .action(async (options: { file?: string; dir?: string; from?: string; generation?: string; out: string; bindLocators?: boolean }) => {
      code = await importBundle(options);
    });

  try {
    await program.parseAsync(argv);
  } catch (error) {
    if (error instanceof CommanderError) {
      return EXIT_CODES.configurationError;
    }
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_CODES.internalError;
  }
  return code;
}

function addRunOptions(command: Command): Command {
  return command
    .requiredOption('--suite <name>', 'suite name or path')
    .option('--case <id>', 'run one case id')
    .option('--tag <tag>', 'run cases with this tag')
    .option('--samples <count>', 'override the sample count', parsePositiveInteger)
    .option('--concurrency <count>', 'override the sample concurrency', parsePositiveInteger)
    .option('--fail-fast', 'stop later cases after an infrastructure error', false)
    .option('--platform <id>', 'fake or azure-openai', 'fake');
}

function runOptions(options: { suite: string; case?: string; tag?: string; samples?: number; concurrency?: number; output?: string; failFast?: boolean; platform?: string }, reporters: ReportArtifact['format'][]): EvaluateOptions {
  return {
    suite: options.suite,
    caseId: options.case,
    tag: options.tag,
    samples: options.samples,
    concurrency: options.concurrency,
    reporters,
    output: options.output,
    failFast: options.failFast,
    platform: options.platform,
  };
}

async function writeBaseline(options: { suite: string; case?: string; tag?: string; samples?: number; concurrency?: number; output: string; failFast?: boolean; name?: string; platform?: string }): Promise<number> {
  const directory = path.dirname(options.output);
  const outcome = await evaluateSuite({ ...runOptions(options, ['json']), output: directory });
  if (!outcome.suite || !outcome.samples || !outcome.runId || !outcome.datasetHash || outcome.code > EXIT_CODES.qualityGateFailed) {
    return outcome.code;
  }
  const baseline = createBaseline({
    id: `baseline-${outcome.runId}`,
    name: options.name ?? outcome.suite.name,
    createdAt: new Date().toISOString(),
    suiteId: outcome.suite.id,
    suiteVersion: outcome.suite.version,
    datasetHash: outcome.datasetHash,
    sourceRunId: outcome.runId,
    samples: outcome.samples,
  });
  await mkdir(directory, { recursive: true });
  await writeFile(options.output, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
  console.log(`baseline: ${options.output}`);
  console.log(`source run: ${baseline.sourceRunId}`);
  return EXIT_CODES.passed;
}

async function compareRun(options: {
  suite: string;
  case?: string;
  tag?: string;
  samples?: number;
  concurrency?: number;
  failFast?: boolean;
  platform?: string;
  baseline: string;
  output?: string;
  scoreDelta?: number;
  passRateDelta?: number;
  latencyDelta?: number;
}): Promise<number> {
  let saved;
  try {
    saved = parseBaseline(JSON.parse(await readFile(options.baseline, 'utf8')));
  } catch (error) {
    console.error(error instanceof DatasetValidationError || error instanceof Error ? error.message : String(error));
    return EXIT_CODES.configurationError;
  }
  const outcome = await evaluateSuite({ ...runOptions(options, ['json']), output: options.output });
  if (!outcome.suite || !outcome.samples || !outcome.runId || !outcome.datasetHash || outcome.code > EXIT_CODES.qualityGateFailed) {
    return outcome.code;
  }
  const current = createBaseline({
    id: `current-${outcome.runId}`,
    name: outcome.suite.name,
    createdAt: new Date().toISOString(),
    suiteId: outcome.suite.id,
    suiteVersion: outcome.suite.version,
    datasetHash: outcome.datasetHash,
    sourceRunId: outcome.runId,
    samples: outcome.samples,
  });
  const thresholds: ComparisonThresholds = {
    scoreDelta: options.scoreDelta ?? 0.05,
    passRateDelta: options.passRateDelta ?? 0.05,
    latencyMsDelta: options.latencyDelta ?? 0,
  };
  const comparison = compareBaselines(saved, current, thresholds);
  console.log(`comparison: ${comparison.verdict}`);
  console.log(comparison.reason);
  for (const item of comparison.cases) {
    console.log(`${item.caseId}: ${item.verdict}`);
  }
  if (comparison.verdict === 'regression') {
    return EXIT_CODES.qualityGateFailed;
  }
  if (comparison.verdict === 'not comparable') {
    return EXIT_CODES.configurationError;
  }
  return EXIT_CODES.passed;
}

async function importBundle(options: { file?: string; dir?: string; from?: string; generation?: string; out: string; bindLocators?: boolean }): Promise<number> {
  let payload: unknown;
  try {
    if (options.from === 'test-genie') {
      payload = await fetchBundle(options.generation ?? '');
    } else {
      const location = options.file ?? options.dir ?? process.env.KLASSI_WDRIVE ?? '';
      if (!location.trim()) {
        throw new Error('KLASSI_WDRIVE is not set. Pass --dir or --file, or set KLASSI_WDRIVE.');
      }
      payload = await readBundle(location);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_CODES.configurationError;
  }
  let result;
  try {
    result = await importTestGenieBundle(payload, options.out, {
      bindLocators: Boolean(options.bindLocators || process.env.PRODUCT_BASE_URL),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_CODES.configurationError;
  }
  console.log(`Test Genie ${result.generationId}: ${result.outcome}`);
  for (const finding of result.findings) {
    console.log(finding);
  }
  for (const item of result.imported) {
    console.log(`${item.id}: ${item.feature}`);
  }
  for (const id of result.skipped) {
    console.log(`${id}: already exists, not overwritten`);
  }
  return result.outcome === 'VERIFIED' ? EXIT_CODES.passed : EXIT_CODES.qualityGateFailed;
}

function parseDelta(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new CommanderError(EXIT_CODES.configurationError, 'ai.option', `${value} must be a non-negative number`);
  }
  return parsed;
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new CommanderError(EXIT_CODES.configurationError, 'ai.option', `${value} must be a positive integer`);
  }
  return parsed;
}

function parseReporters(value: string): ReportArtifact['format'][] {
  const formats = value.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
  const resolved = formats.map((item) => REPORT_FORMATS[item]);
  if (resolved.length === 0 || resolved.some((item) => item === undefined)) {
    throw new CommanderError(EXIT_CODES.configurationError, 'ai.reporter', `Unknown reporter list "${value}"`);
  }
  return resolved;
}
