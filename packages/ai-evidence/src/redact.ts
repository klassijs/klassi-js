export interface RedactionOptions {
  secrets?: string[];
  patterns?: RegExp[];
}

const SECRET_KEY = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|api[-_]?key|apikey|client[-_]?secret)$/i;
function redactString(value: string, options: RedactionOptions): string {
  let output = value.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]').replace(/\bsk-[A-Za-z0-9]{8,}\b/g, '[REDACTED]');
  for (const secret of options.secrets ?? []) {
    if (secret) {
      output = output.split(secret).join('[REDACTED]');
    }
  }
  for (const pattern of options.patterns ?? []) {
    output = output.replace(pattern, '[REDACTED]');
  }
  return output;
}

/** Redacts secrets before any evidence body is persisted. */
export function redactEvidence<T>(value: T, options: RedactionOptions = {}): T {
  return redactValue(value, options) as T;
}

function redactValue(value: unknown, options: RedactionOptions): unknown {
  if (typeof value === 'string') {
    return redactString(value, options);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, options));
  }
  if (value && typeof value === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (SECRET_KEY.test(key)) {
        redacted[key] = '[REDACTED]';
        continue;
      }
      redacted[key] = redactValue(entry, options);
    }
    return redacted;
  }
  return value;
}
