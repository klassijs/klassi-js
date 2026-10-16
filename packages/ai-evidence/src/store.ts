import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { EvidenceWriter } from '@klassijs/ai-core';
import type { EvidenceArtifact, EvidenceBundle, EvidenceRunInput, EvidenceSampleInput } from './bundle.js';
import { canonicalizeEvidence, hashEvidence } from './canonical.js';
import { redactEvidence, type RedactionOptions } from './redact.js';

export function evidenceRunDirectory(rootDir: string, runId: string): string {
  return path.join(rootDir, '.klassi', 'ai', 'runs', pathSegment(runId));
}

function pathSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, '_');
}

async function writeJson(filePath: string, body: unknown): Promise<EvidenceArtifact> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const canonical = canonicalizeEvidence(body);
  await writeFile(filePath, `${canonical}\n`, 'utf8');
  return { path: filePath, sha256: hashEvidence(body) };
}

export class FileEvidenceStore {
  constructor(private readonly rootDir: string) {}

  async save(input: EvidenceRunInput): Promise<EvidenceBundle> {
    const redaction: RedactionOptions = { secrets: input.secrets, patterns: input.patterns };
    const runDir = evidenceRunDirectory(this.rootDir, input.run.runId);
    const artifacts: EvidenceArtifact[] = [];
    const samples: EvidenceBundle['samples'] = [];
    const evaluations: EvidenceBundle['evaluations'] = [];

    artifacts.push(await writeJson(path.join(runDir, 'run.json'), redactEvidence(input.run, redaction)));
    artifacts.push(await writeJson(path.join(runDir, 'suite.json'), redactEvidence(input.suite, redaction)));

    for (const evaluationCase of input.cases) {
      const caseDir = path.join(runDir, 'cases', pathSegment(evaluationCase.caseId));
      artifacts.push(await writeJson(path.join(caseDir, 'case.json'), redactEvidence(evaluationCase, redaction)));
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
    const sampleDir = path.join(
      evidenceRunDirectory(this.rootDir, runId),
      'cases',
      pathSegment(sample.caseId),
      'samples',
      pathSegment(sample.sampleId),
    );
    return {
      async write(artifact) {
        const filePath = path.join(sampleDir, `${pathSegment(artifact.name)}.json`);
        await writeJson(filePath, redactEvidence(artifact.body, redaction));
        return filePath;
      },
    };
  }

  private async writeSample(runDir: string, sample: EvidenceSampleInput, redaction: RedactionOptions) {
    const sampleDir = path.join(runDir, 'cases', pathSegment(sample.caseId), 'samples', pathSegment(sample.sampleId));
    const requestPath = path.join(sampleDir, 'request.json');
    const responsePath = path.join(sampleDir, 'response.json');
    const executionPath = path.join(sampleDir, 'execution.json');
    const artifacts = [
      await writeJson(requestPath, redactEvidence(sample.request, redaction)),
      await writeJson(responsePath, redactEvidence(sample.response, redaction)),
      await writeJson(executionPath, redactEvidence(sample.execution, redaction)),
    ];
    const evaluations = [];
    for (const evaluator of sample.evaluators ?? []) {
      const evaluatorPath = path.join(sampleDir, 'evaluators', `${pathSegment(evaluator.evaluatorId)}.json`);
      artifacts.push(await writeJson(evaluatorPath, redactEvidence(evaluator.result, redaction)));
      evaluations.push({ sampleId: sample.sampleId, evaluatorId: evaluator.evaluatorId, path: evaluatorPath });
    }
    return {
      artifacts,
      evaluations,
      sample: { sampleId: sample.sampleId, caseId: sample.caseId, requestPath, responsePath, executionPath },
    };
  }
}
