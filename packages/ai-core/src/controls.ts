export const CONTROL_FRAMEWORKS = ['nist-ai-rmf', 'nist-genai-profile', 'owasp-genai'] as const;

export type ControlFramework = (typeof CONTROL_FRAMEWORKS)[number];

export interface ControlReference {
  framework: ControlFramework;
  id: string;
  name: string;
}

/** A mapping records which published controls a result can support. It does not certify compliance. */
export interface ControlMapping {
  evaluatorId: string;
  alignment: 'evidence';
  statement: string;
  controls: ControlReference[];
}

export const CONTROL_ALIGNMENT_STATEMENT = 'Control mappings record evidence alignment. They are not a certification of compliance.';
