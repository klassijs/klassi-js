import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AIEvaluationError, type EvidenceWriter } from '@klassijs/ai-core';
import type { EvidenceArtifact, EvidenceBundle, EvidenceRunInput, EvidenceSampleInput } from './bundle.js';
import { canonicalizeEvidence, hashEvidence } from './canonical.js';
import { redactEvidence, type RedactionOptions } from './redact.js';

/** One mebibyte of canonical JSON per artifact. Larger bodies are refused before they are written. */
export const DEFAULT_MAX_EVIDENCE_BYTES = 1_048_576;

export function evidenceRunDirectory(rootDir: string, runId: string): string {
  return path.join(rootDir, '.klassi', 'ai', 'runs', pathSegment(runId));
}

function pathSegment(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9._-]+/g, '_');
  if (cleaned.length === 0 || cleaned === '.' || cleaned === '..') {
    return '_';
  }
  return cleaned;
}

function inside(root: string, ...parts: string[]): string {
  const base = path.resolve(root);
  const target = path.resolve(base, ...parts);
  const relative = path.relative(base, target);
  if (relative === '' || path.isAbsolute(relative) || relative.split(path.sep).includes('..')) {
    throw new AIEvaluationError('EVIDENCE_ERROR', 'Evidence path escapes the run directory');
  }
  return target;
}

export class FileEvidenceStore {
  constructor(
    private readonly rootDir: string,
    private readonly maxBytes: number = DEFAULT_MAX_EVIDENCE_BYTES,
  ) {}

  private async writeJson(filePath: string, body: unknown): Promise<EvidenceArtifact> {
    const canonical = canonicalizeEvidence(body);
    if (Buffer.byteLength(canonical) > this.maxBytes) {
      throw new AIEvaluationError('EVIDENCE_ERROR', `Evidence artifact exceeds ${this.maxBytes} bytes`);
    }
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${canonical}\n`, 'utf8');
    return { path: filePath, sha256: hashEvidence(body) };
  }

  async save(input: EvidenceRunInput): Promise<EvidenceBundle> {
    const redaction: RedactionOptions = { secrets: input.secrets, patterns: input.patterns };
    const runDir = evidenceRunDirectory(this.rootDir, input.run.runId);
    const artifacts: EvidenceArtifact[] = [];
    const samples: EvidenceBundle['samples'] = [];
    const evaluations: EvidenceBundle['evaluations'] = [];

    artifacts.push(await this.writeJson(inside(runDir, 'run.json'), redactEvidence(input.run, redaction)));
    artifacts.push(await this.writeJson(inside(runDir, 'suite.json'), redactEvidence(input.suite, redaction)));

    for (const evaluationCase of input.cases) {
      artifacts.push(await this.writeJson(inside(runDir, 'cases', pathSegment(evaluationCase.caseId), 'case.json'), redactEvidence(evaluationCase, redaction)));
    }

    for (const sample of input.samples) {
      const recorded = await this.writeSample(runDir, sample, redaction);
      samples.push(recorded.sample);
      evaluations.push(...recorded.evaluations);
      artifacts.push(...recorded.artifacts);
    }

    const hashes = { algorithm: 'sha256' as const, artifacts: artifacts.map((artifact) => ({ path: path.relative(runDir, artifact.path), sha256: artifact.sha256 })) };
    const manifestPath = path.join(runDir, 'manifest.sha256');
    const manifestBody = hashes.artifacts.map((artifact) => `${artifact.sha256}  ${artifact.path}`).join('\n');
    await writeFile(manifestPath, `${manifestBody}\n`, 'utf8');

    return {
      run: input.run,
      suites: [input.suite],
      cases: input.cases,
      samples,
      evaluations,
      artifacts,
      hashes,
    };
  }

  writer(runId: string, sample: Pick<EvidenceSampleInput, 'sampleId' | 'caseId'>, redaction: RedactionOptions = {}): EvidenceWriter {
    const sampleDir = inside(evidenceRunDirectory(this.rootDir, runId), 'cases', pathSegment(sample.caseId), 'samples', pathSegment(sample.sampleId));
    return {
      write: async (artifact) => {
        const filePath = inside(sampleDir, `${pathSegment(artifact.name)}.json`);
        await this.writeJson(filePath, redactEvidence(artifact.body, redaction));
        return filePath;
      },
    };
  }

  private async writeSample(runDir: string, sample: EvidenceSampleInput, redaction: RedactionOptions) {
    const sampleDir = inside(runDir, 'cases', pathSegment(sample.caseId), 'samples', pathSegment(sample.sampleId));
    const requestPath = inside(sampleDir, 'request.json');
    const responsePath = inside(sampleDir, 'response.json');
    const executionPath = inside(sampleDir, 'execution.json');
    const artifacts = [
      await this.writeJson(requestPath, redactEvidence(sample.request, redaction)),
      await this.writeJson(responsePath, redactEvidence(sample.response, redaction)),
      await this.writeJson(executionPath, redactEvidence(sample.execution, redaction)),
    ];
    const evaluations = [];
    for (const evaluator of sample.evaluators ?? []) {
      const evaluatorPath = inside(sampleDir, 'evaluators', `${pathSegment(evaluator.evaluatorId)}.json`);
      artifacts.push(await this.writeJson(evaluatorPath, redactEvidence(evaluator.result, redaction)));
      evaluations.push({ sampleId: sample.sampleId, evaluatorId: evaluator.evaluatorId, path: evaluatorPath });
    }
    return {
      artifacts,
      evaluations,
      sample: { sampleId: sample.sampleId, caseId: sample.caseId, requestPath, responsePath, executionPath },
    };
  }
}
