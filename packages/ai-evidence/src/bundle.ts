import type { AdapterId, CaseId, EvaluatorId, RunId, SampleId, SuiteId } from '@klassijs/ai-core';

export interface RunManifest {
  runId: RunId;
  suiteId: SuiteId;
  startedAt: string;
  datasetHash?: string;
}

export interface SuiteEvidence {
  suiteId: SuiteId;
  name: string;
  version: string;
}

export interface CaseEvidence {
  caseId: CaseId;
  name: string;
  targetAdapter: AdapterId;
}

export interface SampleEvidence {
  sampleId: SampleId;
  caseId: CaseId;
  requestPath: string;
  responsePath: string;
  executionPath: string;
}

export interface EvaluatorEvidence {
  sampleId: SampleId;
  evaluatorId: EvaluatorId;
  path: string;
}

export interface EvidenceArtifact {
  path: string;
  sha256: string;
}

export interface EvidenceHashManifest {
  algorithm: 'sha256';
  artifacts: EvidenceArtifact[];
}

export interface EvidenceBundle {
  run: RunManifest;
  suites: SuiteEvidence[];
  cases: CaseEvidence[];
  samples: SampleEvidence[];
  evaluations: EvaluatorEvidence[];
  artifacts: EvidenceArtifact[];
  hashes: EvidenceHashManifest;
}

export interface EvidenceSampleInput {
  sampleId: SampleId;
  caseId: CaseId;
  request: unknown;
  response: unknown;
  execution: unknown;
  evaluators?: Array<{ evaluatorId: EvaluatorId; result: unknown }>;
}

export interface EvidenceRunInput {
  run: RunManifest;
  suite: SuiteEvidence;
  cases: CaseEvidence[];
  samples: EvidenceSampleInput[];
  secrets?: string[];
  patterns?: RegExp[];
}
