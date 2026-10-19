import type { ArtifactClassifier, ArtifactExtractor, ArtifactType, GeneratedArtifact } from '@klassijs/ai-core';
import { artefactHash } from './sandbox.js';

const FENCE = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;

const FENCE_TYPES: Record<string, ArtifactType> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
  feature: 'gherkin',
  gherkin: 'gherkin',
  openapi: 'openapi',
};

const extractors: ArtifactExtractor[] = [];
const classifiers: ArtifactClassifier[] = [];

export function registerArtifactExtractor(extractor: ArtifactExtractor): void {
  extractors.push(extractor);
}

export function registerArtifactClassifier(classifier: ArtifactClassifier): void {
  classifiers.push(classifier);
}

export function classifyArtefact(content: string): ArtifactType | undefined {
  for (const classifier of classifiers) {
    const type = classifier.classify(content);
    if (type) {
      return type;
    }
  }
  return defaultClassify(content);
}

export function extractArtefacts(text: string, expectedType?: ArtifactType): GeneratedArtifact[] {
  const custom = extractors.flatMap((extractor) => extractor.extract(text, expectedType));
  if (custom.length > 0) {
    return custom;
  }
  const found: GeneratedArtifact[] = [];
  for (const match of text.matchAll(FENCE)) {
    const type = FENCE_TYPES[match[1]?.toLowerCase() ?? ''] ?? expectedType ?? classifyArtefact(match[2] ?? '');
    if (!type) {
      continue;
    }
    if (expectedType && type !== expectedType) {
      continue;
    }
    const content = (match[2] ?? '').trim();
    found.push({ id: `artefact-${found.length + 1}`, type, content, hash: artefactHash(content) });
  }
  if (found.length === 0 && expectedType && text.trim().length > 0) {
    const content = text.trim();
    found.push({ id: 'artefact-1', type: expectedType, content, hash: artefactHash(content) });
  }
  return found;
}

function defaultClassify(content: string): ArtifactType | undefined {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  if (/^feature:/im.test(trimmed)) {
    return 'gherkin';
  }
  if (/\b(Given|When|Then)\s*\(/.test(trimmed)) {
    return 'step-definition';
  }
  if (/openapi:|swagger:/.test(trimmed)) {
    return 'openapi';
  }
  if (/\b(SELECT|INSERT|UPDATE|DELETE)\b/i.test(trimmed)) {
    return 'sql';
  }
  return undefined;
}
