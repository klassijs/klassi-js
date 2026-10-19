import vm from 'node:vm';

const FORBIDDEN = [
  { pattern: /\beval\s*\(/, message: 'eval is forbidden' },
  { pattern: /\bnew\s+Function\s*\(/, message: 'Function constructor is forbidden' },
  { pattern: /\bchild_process\b/, message: 'child_process is forbidden' },
  { pattern: /\brequire\s*\(\s*['"]fs['"]\s*\)/, message: 'filesystem access is forbidden' },
  { pattern: /\brequire\s*\(\s*['"]node:fs['"]\s*\)/, message: 'filesystem access is forbidden' },
  { pattern: /\brequire\s*\(\s*['"]net['"]\s*\)/, message: 'network access is forbidden' },
  { pattern: /\brequire\s*\(\s*['"]http['"]\s*\)/, message: 'network access is forbidden' },
  { pattern: /\bfetch\s*\(/, message: 'network access is forbidden' },
  { pattern: /\bprocess\.env\b/, message: 'reading process environment is forbidden' },
  { pattern: /wdio\.conf|@wdio\/cli|@wdio\/runner/, message: 'WebdriverIO runner usage is forbidden' },
];

export interface StaticFinding {
  code: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  deterministic: boolean;
}

export function forbiddenFindings(content: string): StaticFinding[] {
  return FORBIDDEN.filter((rule) => rule.pattern.test(content)).map((rule) => ({
    code: 'forbidden-api',
    severity: 'high' as const,
    message: rule.message,
    deterministic: true as const,
  }));
}

export function javascriptSyntax(content: string): StaticFinding[] {
  try {
    vm.compileFunction(content);
    return [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [{ code: 'syntax', severity: 'high', message, deterministic: true }];
  }
}

/** Static checks aligned with the repository rule that generated code must not reach the network, filesystem, or eval. */
export function repositoryLint(content: string): StaticFinding[] {
  const findings = [...javascriptSyntax(content), ...forbiddenFindings(content)];
  if (/\bdebugger\b/.test(content)) {
    findings.push({ code: 'lint', severity: 'medium', message: 'debugger is not allowed', deterministic: true });
  }
  return findings;
}
