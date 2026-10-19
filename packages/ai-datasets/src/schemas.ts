import { ARTIFACT_TYPES } from '@klassijs/ai-core';
import { z } from 'zod';

const nonEmpty = z.string().min(1);
const score = z.number().min(0).max(1);
const envName = z
  .string()
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'must be an environment variable name, not a secret value');

const metadata = z.record(z.unknown()).optional();

export const aiContentPartSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }).strict(),
  z
    .object({
      type: z.literal('image'),
      uri: z.string().optional(),
      mediaType: z.string().optional(),
      dataRef: z.string().optional(),
    })
    .strict(),
]);

export const aiMessageSchema = z
  .object({
    role: z.enum(['system', 'developer', 'user', 'assistant', 'tool']),
    content: z.union([z.string(), z.array(aiContentPartSchema).min(1)]),
    name: z.string().optional(),
    toolCallId: z.string().optional(),
    metadata,
  })
  .strict();

export const evaluationTargetSchema = z
  .object({
    adapter: nonEmpty,
    profile: z.string().optional(),
    model: z.string().optional(),
    deployment: z.string().optional(),
    options: z.record(z.unknown()).optional(),
  })
  .strict();

export const executionPolicySchema = z
  .object({
    samples: z.number().int().min(1),
    concurrency: z.number().int().min(1),
    timeoutMs: z.number().int().positive(),
    retry: z
      .object({
        maxInfrastructureRetries: z.number().int().min(0),
        initialDelayMs: z.number().int().min(0),
        maxDelayMs: z.number().int().min(0),
        backoffMultiplier: z.number().positive(),
        jitter: z.boolean(),
      })
      .strict(),
    failFast: z.boolean(),
  })
  .strict();

export const evaluatorBindingSchema = z
  .object({
    id: nonEmpty,
    type: z.enum(['deterministic', 'model', 'human', 'platform']),
    threshold: score.optional(),
    judge: z
      .object({
        adapter: nonEmpty,
        profile: z.string().optional(),
      })
      .strict()
      .optional(),
    config: z.record(z.unknown()).optional(),
  })
  .strict();

export const qualityGateSchema = z
  .object({
    overall: z
      .object({
        minimumScore: score.optional(),
        minimumPassRate: score.optional(),
      })
      .strict()
      .optional(),
    evaluators: z
      .record(
        z
          .object({
            minimumScore: score.optional(),
            maximumScore: score.optional(),
            minimumPassRate: score.optional(),
          })
          .strict(),
      )
      .optional(),
    criticalCases: z.object({ minimumPassRate: score }).strict().optional(),
    security: z
      .object({
        maximumCriticalViolations: z.number().int().min(0),
        maximumHighViolations: z.number().int().min(0).optional(),
      })
      .strict()
      .optional(),
    performance: z.object({ p95LatencyMs: z.number().int().positive().optional() }).strict().optional(),
    budget: z
      .object({
        maximumTotalTokens: z.number().int().min(0).optional(),
        maximumInputTokens: z.number().int().min(0).optional(),
        maximumOutputTokens: z.number().int().min(0).optional(),
        maximumRequests: z.number().int().min(0).optional(),
        maximumEstimatedCost: z.number().min(0).optional(),
      })
      .strict()
      .optional(),
    stability: z
      .object({
        minimumPassRate: score.optional(),
        maximumScoreStdDev: z.number().min(0).optional(),
      })
      .strict()
      .optional(),
    infrastructure: z.object({ maximumErrorRate: score.optional() }).strict().optional(),
  })
  .strict();

export const evaluationExpectationsSchema = z
  .object({
    requiredFacts: z.array(z.string()).optional(),
    prohibitedClaims: z.array(z.string()).optional(),
    requiredSources: z.array(z.string()).optional(),
    forbiddenSources: z.array(z.string()).optional(),
    expectedSchema: z.record(z.unknown()).optional(),
    expectedTools: z.array(z.string()).optional(),
    forbiddenTools: z.array(z.string()).optional(),
  })
  .strict();

export const evaluationCaseSchema = z
  .object({
    id: nonEmpty,
    name: nonEmpty,
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    target: evaluationTargetSchema,
    input: z
      .object({
        messages: z.array(aiMessageSchema).min(1),
        variables: z.record(z.unknown()).optional(),
      })
      .strict(),
    expectations: evaluationExpectationsSchema.optional(),
    evaluators: z.array(evaluatorBindingSchema).min(1),
    conversation: z
      .object({
        turns: z
          .array(
            z
              .object({
                id: nonEmpty,
                messages: z.array(aiMessageSchema).min(1),
                evaluators: z.array(evaluatorBindingSchema).optional(),
              })
              .strict(),
          )
          .min(1),
      })
      .strict()
      .optional(),
    execution: executionPolicySchema.partial().optional(),
    artefact: z.object({ type: z.enum(ARTIFACT_TYPES) }).strict().optional(),
    metadata,
  })
  .strict();

export const evaluationSuiteSchema = z
  .object({
    id: nonEmpty,
    name: nonEmpty,
    version: nonEmpty,
    description: z.string().optional(),
    cases: z.array(evaluationCaseSchema).min(1),
    defaults: z
      .object({
        target: evaluationTargetSchema.partial().optional(),
        execution: executionPolicySchema.partial().optional(),
        evaluators: z.array(evaluatorBindingSchema).optional(),
      })
      .strict()
      .optional(),
    qualityGate: qualityGateSchema,
    costTable: z
      .object({
        version: nonEmpty,
        currency: nonEmpty,
        prices: z
          .array(
            z
              .object({
                match: nonEmpty,
                inputPerMillion: z.number().min(0),
                outputPerMillion: z.number().min(0),
              })
              .strict(),
          )
          .min(1),
      })
      .strict()
      .optional(),
    metadata,
  })
  .strict()
  .superRefine((suite, context) => {
    const seen = new Set<string>();
    suite.cases.forEach((evaluationCase, index) => {
      if (seen.has(evaluationCase.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cases', index, 'id'],
          message: `Duplicate case id "${evaluationCase.id}"`,
        });
      }
      seen.add(evaluationCase.id);
    });
  });

export const baselineCaseResultSchema = z
  .object({
    status: z.enum(['pass', 'fail', 'error', 'review']),
    score: score.optional(),
  })
  .strict();

export const baselineSchema = z
  .object({
    id: nonEmpty,
    name: nonEmpty,
    createdAt: z.string().datetime(),
    suiteId: nonEmpty,
    suiteVersion: nonEmpty,
    datasetHash: z.string().regex(/^[a-f0-9]{64}$/),
    sourceRunId: nonEmpty,
    metrics: z.record(z.number()),
    caseResults: z.record(baselineCaseResultSchema),
    metadata,
  })
  .strict();

export const adapterProfileSchema = z
  .object({
    endpointEnv: envName.optional(),
    deploymentEnv: envName.optional(),
    credential: z
      .object({
        type: z.enum(['api-key', 'default']),
        apiKeyEnv: envName.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const aiConfigurationSchema = z
  .object({
    ai: z
      .object({
        adapters: z.record(
          z
            .object({
              profiles: z.record(adapterProfileSchema),
            })
            .strict(),
        ),
        targets: z
          .record(
            z
              .object({
                adapter: nonEmpty,
                profile: z.string().optional(),
              })
              .strict(),
          )
          .optional(),
        judges: z
          .record(
            z
              .object({
                adapter: nonEmpty,
                profile: z.string().optional(),
              })
              .strict(),
          )
          .optional(),
      })
      .strict(),
  })
  .strict();
