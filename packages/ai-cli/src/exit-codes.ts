/** Stable CLI exit codes from the technical specification. */
export const EXIT_CODES = {
  passed: 0,
  qualityGateFailed: 1,
  configurationError: 2,
  executionFailure: 3,
  evaluatorFailure: 4,
  reportingFailure: 5,
  internalError: 6,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
