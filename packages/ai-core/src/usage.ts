import type { EvaluationSample } from './sample.js';

/** Optional prices. A missing row does not remove token totals. */
export interface CostTable {
  version: string;
  currency: string;
  prices: Array<{
    match: string;
    inputPerMillion: number;
    outputPerMillion: number;
  }>;
}

export interface UsageSummary {
  requests: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  samplesWithUsage: number;
  samplesMissingUsage: number;
  estimatedCost?: number;
  currency?: string;
  costTableVersion?: string;
  unpricedModels: string[];
}

export function summarizeUsage(samples: readonly EvaluationSample[], costTable?: CostTable): UsageSummary {
  const input = definedNumbers(samples.map((sample) => sample.execution.usage?.inputTokens));
  const output = definedNumbers(samples.map((sample) => sample.execution.usage?.outputTokens));
  const total = definedNumbers(samples.map((sample) => sample.execution.usage?.totalTokens));
  const samplesWithUsage = samples.filter((sample) => sample.execution.usage !== undefined).length;
  const priced = costTable === undefined ? undefined : estimatedCost(samples, costTable);
  return {
    requests: samples.reduce((sum, sample) => sum + (sample.turns && sample.turns.length > 0 ? sample.turns.length : 1), 0),
    ...(input === undefined ? {} : { inputTokens: input }),
    ...(output === undefined ? {} : { outputTokens: output }),
    ...(total === undefined ? {} : { totalTokens: total }),
    samplesWithUsage,
    samplesMissingUsage: samples.length - samplesWithUsage,
    ...(priced?.estimatedCost === undefined ? {} : { estimatedCost: priced.estimatedCost, currency: costTable?.currency, costTableVersion: costTable?.version }),
    unpricedModels: priced?.unpricedModels ?? [],
  };
}

/** Token budgets stay unavailable when any sample omitted usage, so a missing measurement cannot pass as zero. */
export function budgetTokenTotal(summary: UsageSummary, field: 'inputTokens' | 'outputTokens' | 'totalTokens'): number | undefined {
  if (summary.samplesMissingUsage > 0 || summary[field] === undefined) {
    return undefined;
  }
  return summary[field];
}

function definedNumbers(values: Array<number | undefined>): number | undefined {
  const present = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (present.length === 0) {
    return undefined;
  }
  return present.reduce((sum, value) => sum + value, 0);
}

function estimatedCost(samples: readonly EvaluationSample[], costTable: CostTable): { estimatedCost?: number; unpricedModels: string[] } {
  let cost = 0;
  const unpricedModels: string[] = [];
  let complete = samples.length > 0;
  for (const sample of samples) {
    const model = sample.execution.model?.deployment ?? sample.execution.model?.providerModel ?? sample.execution.model?.requested ?? 'unknown';
    const price = costTable.prices.find((item) => item.match === model);
    const usage = sample.execution.usage;
    if (!price || usage?.inputTokens === undefined || usage.outputTokens === undefined) {
      complete = false;
      unpricedModels.push(model);
      continue;
    }
    cost += (usage.inputTokens * price.inputPerMillion + usage.outputTokens * price.outputPerMillion) / 1_000_000;
  }
  return { ...(complete ? { estimatedCost: cost } : {}), unpricedModels };
}
