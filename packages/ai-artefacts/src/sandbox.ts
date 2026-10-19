import { createHash, randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';
import {
  AIEvaluationError,
  DEFAULT_ARTIFACT_EXECUTION_POLICY,
  type ArtifactExecutionPolicy,
  type ArtifactExecutionSandbox,
  type SandboxRunRequest,
  type SandboxRunResult,
} from '@klassijs/ai-core';

export function artefactHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function assertSandboxPolicy(policy: ArtifactExecutionPolicy): void {
  if (policy.allowNetwork) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Sandbox network access is denied');
  }
  if (policy.allowFilesystem) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Sandbox filesystem access is denied');
  }
  if (policy.inheritSecrets) {
    throw new AIEvaluationError('CONFIG_ERROR', 'Sandbox secret inheritance is denied');
  }
}

export function createArtifactSandbox(policy: ArtifactExecutionPolicy = DEFAULT_ARTIFACT_EXECUTION_POLICY): ArtifactExecutionSandbox {
  assertSandboxPolicy(policy);
  let disposed = false;
  const sandbox: ArtifactExecutionSandbox = {
    id: `sandbox-${randomUUID()}`,
    policy,
    async run(request: SandboxRunRequest): Promise<SandboxRunResult> {
      if (disposed) {
        throw new AIEvaluationError('INTERNAL_ERROR', 'Sandbox has been disposed');
      }
      return runIsolated(request, policy);
    },
    async dispose() {
      disposed = true;
    },
  };
  return sandbox;
}

async function runIsolated(request: SandboxRunRequest, policy: ArtifactExecutionPolicy): Promise<SandboxRunResult> {
  const worker = new Worker(new URL('./sandbox-worker.js', import.meta.url), {
    workerData: {
      code: request.code,
      test: request.test ?? '',
      timeoutMs: policy.timeoutMs,
      maxOutputBytes: policy.maxOutputBytes,
    },
    env: { PATH: '/usr/bin' },
    resourceLimits: { maxOldGenerationSizeMb: 32, stackSizeMb: 4 },
  });
  try {
    const result = await new Promise<SandboxRunResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        void worker.terminate();
        resolve({ ok: false, logs: '', message: 'Sandbox timed out', envKeys: [] });
      }, policy.timeoutMs + 500);
      worker.once('message', (message: SandboxRunResult) => {
        clearTimeout(timer);
        resolve(message);
      });
      worker.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
    return { ...result, logs: result.logs.slice(0, policy.maxOutputBytes) };
  } finally {
    await worker.terminate();
  }
}
