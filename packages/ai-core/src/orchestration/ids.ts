import { randomBytes } from 'node:crypto';
import type { CaseId, RunId, SampleId } from '../identifiers.js';

/** Time-sortable identifier. It does not contain prompts or credentials. */
export function createRunId(now = Date.now()): RunId {
  const time = now.toString(16).padStart(12, '0');
  const entropy = randomBytes(8).toString('hex');
  return `${time}${entropy}`;
}

export function createSampleId(runId: RunId, caseId: CaseId, sampleIndex: number): SampleId {
  return `${runId}:${caseId}:${sampleIndex}`;
}
