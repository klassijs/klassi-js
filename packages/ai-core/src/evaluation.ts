import type { AdapterId, CaseId, EvaluatorId, SuiteId } from './identifiers.js';
import type { CostTable } from './usage.js';
import type { AIMessage } from './messages.js';
import type { ExecutionPolicy } from './policy.js';

export interface EvaluationTarget {
  adapter: AdapterId;
  profile?: string;
  model?: string;
  /** Generic deployment identifier. Core does not assign Azure-specific meaning. */
  deployment?: string;
  options?: Record<string, unknown>;
}

export interface EvaluationExpectations {
  requiredFacts?: string[];
  prohibitedClaims?: string[];
  requiredSources?: string[];
  forbiddenSources?: string[];
  expectedSchema?: Record<string, unknown>;
  expectedTools?: string[];
  forbiddenTools?: string[];
}

/** Binding shape follows the technical specification's evaluator example. */
export interface EvaluatorBinding {
  id: EvaluatorId;
  type: 'deterministic' | 'model' | 'human' | 'platform';
  threshold?: number;
  judge?: {
    adapter: AdapterId;
    profile?: string;
  };
  config?: Record<string, unknown>;
}

export interface ConversationTurn {
  id: string;
  messages: AIMessage[];
  evaluators?: EvaluatorBinding[];
}

export interface EvaluationCase {
  id: CaseId;
  name: string;
  description?: string;
  tags?: string[];
  target: EvaluationTarget;
  input: {
    messages: AIMessage[];
    variables?: Record<string, unknown>;
  };
  /** When set, each turn is executed in order and the assistant reply is carried forward. */
  conversation?: {
    turns: ConversationTurn[];
  };
  expectations?: EvaluationExpectations;
  evaluators: EvaluatorBinding[];
  execution?: Partial<ExecutionPolicy>;
  metadata?: Record<string, unknown>;
}

export interface QualityGate {
  overall?: {
    minimumScore?: number;
    minimumPassRate?: number;
  };
  evaluators?: Record<
    string,
    {
      minimumScore?: number;
      maximumScore?: number;
      minimumPassRate?: number;
    }
  >;
  criticalCases?: {
    minimumPassRate: number;
  };
  security?: {
    maximumCriticalViolations: number;
    maximumHighViolations?: number;
  };
  performance?: {
    p95LatencyMs?: number;
  };
  budget?: {
    maximumTotalTokens?: number;
    maximumInputTokens?: number;
    maximumOutputTokens?: number;
    maximumRequests?: number;
    maximumEstimatedCost?: number;
  };
  stability?: {
    minimumPassRate?: number;
    maximumScoreStdDev?: number;
  };
  infrastructure?: {
    maximumErrorRate?: number;
  };
}

export interface EvaluationSuite {
  id: SuiteId;
  name: string;
  version: string;
  description?: string;
  cases: EvaluationCase[];
  defaults?: {
    target?: Partial<EvaluationTarget>;
    execution?: Partial<ExecutionPolicy>;
    evaluators?: EvaluatorBinding[];
  };
  qualityGate: QualityGate;
  costTable?: CostTable;
  metadata?: Record<string, unknown>;
}
