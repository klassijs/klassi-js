export type AIMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';

export interface AITextPart {
  type: 'text';
  text: string;
}

export interface AIImagePart {
  type: 'image';
  uri?: string;
  mediaType?: string;
  dataRef?: string;
}

export type AIContentPart = AITextPart | AIImagePart;

export interface AIMessage {
  role: AIMessageRole;
  content: string | AIContentPart[];
  name?: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}
