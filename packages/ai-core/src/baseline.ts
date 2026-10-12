import type { BaselineId, CaseId, RunId, SuiteId } from './identifiers.js';

export interface BaselineCaseResult {
  status: 'pass' | 'fail' | 'error' | 'review';
  score?: number;
}

export interface Baseline {
  id: BaselineId;
  name: string;
  createdAt: string;
  suiteId: SuiteId;
  suiteVersion: string;
  datasetHash: string;
  sourceRunId: RunId;
  metrics: Record<string, number>;
  caseResults: Record<CaseId, BaselineCaseResult>;
  metadata?: Record<string, unknown>;
}
