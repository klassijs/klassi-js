export interface JudgePrompt {
  id: string;
  version: string;
  instructions: string;
}

const PROMPT_VERSION = '1.0.0';

const RUBRICS: Record<string, string> = {
  relevance: 'Score how directly the answer addresses the user request.',
  completeness: 'Score whether the answer covers every part of the user request.',
  groundedness: 'Score whether the answer stays within the supplied source material.',
  'semantic-correctness': 'Score whether the answer means the same thing as the expected behaviour.',
  'instruction-adherence': 'Score whether the answer follows the instructions it was given.',
  'answer-quality': 'Score the clarity and usefulness of the answer.',
};

export const judgePrompts: JudgePrompt[] = Object.entries(RUBRICS).map(([id, instructions]) => ({
  id,
  version: PROMPT_VERSION,
  instructions: `${instructions} Return only a JSON object with a numeric score from 0 to 1 and a string reason.`,
}));

export function getJudgePrompt(id: string): JudgePrompt | undefined {
  return judgePrompts.find((prompt) => prompt.id === id);
}
