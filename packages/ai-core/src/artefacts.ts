export const ARTIFACT_TYPES = [
  'javascript',
  'typescript',
  'test',
  'json',
  'yaml',
  'openapi',
  'sql',
  'infrastructure',
  'documentation',
  'requirements',
  'architecture',
  'gherkin',
  'step-definition',
  'page-object',
  'test-case',
] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const ARTIFACT_ORIGINS = ['human', 'test-genie', 'ai', 'legacy-import', 'external-system', 'unknown'] as const;

export type ArtifactOrigin = (typeof ARTIFACT_ORIGINS)[number];

export interface ArtifactProvenance {
  origin: ArtifactOrigin;
  authorId?: string;
  sourceSystem?: string;
  sourceId?: string;
  generationId?: string;
  createdAt?: string;
  version?: string;
  sourceHash?: string;
}

export interface GeneratedArtifact {
  id: string;
  type: ArtifactType;
  content: string;
  path?: string;
  provenance?: ArtifactProvenance;
  hash?: string;
}

/** Network, filesystem, and secret inheritance stay off unless a later policy explicitly allows them. */
export interface ArtifactExecutionPolicy {
  timeoutMs: number;
  maxOutputBytes: number;
  allowNetwork: boolean;
  allowFilesystem: boolean;
  inheritSecrets: boolean;
}

export const DEFAULT_ARTIFACT_EXECUTION_POLICY: ArtifactExecutionPolicy = {
  timeoutMs: 2000,
  maxOutputBytes: 65_536,
  allowNetwork: false,
  allowFilesystem: false,
  inheritSecrets: false,
};

export interface SandboxRunRequest {
  code: string;
  test?: string;
}

export interface SandboxRunResult {
  ok: boolean;
  logs: string;
  message?: string;
  envKeys: string[];
}

export interface ArtifactExecutionSandbox {
  readonly id: string;
  readonly policy: ArtifactExecutionPolicy;
  run(request: SandboxRunRequest): Promise<SandboxRunResult>;
  dispose(): Promise<void>;
}

export interface ArtifactExtractor {
  readonly id: string;
  extract(text: string, expectedType?: ArtifactType): GeneratedArtifact[];
}

export interface ArtifactClassifier {
  readonly id: string;
  classify(content: string): ArtifactType | undefined;
}
