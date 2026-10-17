export function redactText(value: string, secrets: readonly string[]): string {
  let output = value.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]');
  output = output.replace(/\bsk-[A-Za-z0-9]{8,}\b/g, '[REDACTED]');
  for (const secret of secrets) {
    if (secret) {
      output = output.split(secret).join('[REDACTED]');
    }
  }
  return output;
}

export function redactValue(value: unknown, secrets: readonly string[]): unknown {
  if (typeof value === 'string') {
    return redactText(value, secrets);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, secrets));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item, secrets)]));
  }
  return value;
}
