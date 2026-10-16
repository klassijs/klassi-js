export interface DatasetValidationIssue {
  path: string;
  message: string;
}

/** Thrown before a suite is executed when a dataset or configuration file is invalid. */
export class DatasetValidationError extends Error {
  readonly issues: DatasetValidationIssue[];

  constructor(issues: DatasetValidationIssue[]) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    super(detail || 'Dataset validation failed');
    this.name = 'DatasetValidationError';
    this.issues = issues;
  }
}
