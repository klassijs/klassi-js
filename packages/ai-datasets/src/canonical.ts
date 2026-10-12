import { createHash } from 'node:crypto';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortValue(source[key]);
    }
    return sorted;
  }
  return value;
}

/** Stable JSON with sorted object keys. Key order in the source file does not change the result. */
export function canonicalizeDataset(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function hashDataset(value: unknown): string {
  return createHash('sha256').update(canonicalizeDataset(value)).digest('hex');
}
