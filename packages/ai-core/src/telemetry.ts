export const TELEMETRY_EVENTS = [
  'run.started',
  'run.completed',
  'case.started',
  'case.completed',
  'sample.started',
  'sample.completed',
  'adapter.call',
  'evaluator.completed',
  'gate.completed',
] as const;

export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[number];

/** Correlation and outcome only. Prompt and response text are not telemetry fields. */
export interface TelemetryEvent {
  name: TelemetryEventName;
  runId: string;
  suiteId: string;
  caseId?: string;
  sampleId?: string;
  adapterId?: string;
  evaluatorId?: string;
  status?: string;
  latencyMs?: number;
  attempt?: number;
}

export interface TelemetrySink {
  emit(event: TelemetryEvent): void;
}

export const noopTelemetry: TelemetrySink = { emit() {} };

export interface TelemetrySpan {
  setAttribute(key: string, value: string | number | boolean): void;
  end(): void;
}

/** A caller may wrap an OpenTelemetry tracer. Klassi does not require that package. */
export interface TelemetryTracer {
  startSpan(name: string): TelemetrySpan;
}

const EVENT_NAMES = new Set<string>(TELEMETRY_EVENTS);

export function sanitizeTelemetry(input: object): TelemetryEvent | undefined {
  const record = input as Record<string, unknown>;
  if (typeof record.name !== 'string' || !EVENT_NAMES.has(record.name) || typeof record.runId !== 'string' || typeof record.suiteId !== 'string') {
    return undefined;
  }
  const event: TelemetryEvent = { name: record.name as TelemetryEventName, runId: record.runId, suiteId: record.suiteId };
  copyString(event, record, 'caseId');
  copyString(event, record, 'sampleId');
  copyString(event, record, 'adapterId');
  copyString(event, record, 'evaluatorId');
  copyString(event, record, 'status');
  copyNumber(event, record, 'latencyMs');
  copyNumber(event, record, 'attempt');
  return event;
}

export function emitTelemetry(sink: TelemetrySink | undefined, event: TelemetryEvent): void {
  const safe = sanitizeTelemetry(event);
  if (safe) {
    (sink ?? noopTelemetry).emit(safe);
  }
}

export function createTelemetryCollector(): { sink: TelemetrySink; events: TelemetryEvent[] } {
  const events: TelemetryEvent[] = [];
  return {
    events,
    sink: {
      emit(event) {
        const safe = sanitizeTelemetry(event);
        if (safe) {
          events.push(safe);
        }
      },
    },
  };
}

export function openTelemetrySink(tracer: TelemetryTracer): TelemetrySink {
  return {
    emit(event) {
      const safe = sanitizeTelemetry(event);
      if (!safe) {
        return;
      }
      const span = tracer.startSpan(safe.name);
      span.setAttribute('run.id', safe.runId);
      span.setAttribute('suite.id', safe.suiteId);
      setString(span, 'case.id', safe.caseId);
      setString(span, 'sample.id', safe.sampleId);
      setString(span, 'adapter.id', safe.adapterId);
      setString(span, 'evaluator.id', safe.evaluatorId);
      setString(span, 'status', safe.status);
      if (safe.latencyMs !== undefined) {
        span.setAttribute('latency.ms', safe.latencyMs);
      }
      if (safe.attempt !== undefined) {
        span.setAttribute('attempt', safe.attempt);
      }
      span.end();
    },
  };
}

function copyString(event: TelemetryEvent, record: Record<string, unknown>, key: 'caseId' | 'sampleId' | 'adapterId' | 'evaluatorId' | 'status'): void {
  if (typeof record[key] === 'string') {
    event[key] = record[key];
  }
}

function copyNumber(event: TelemetryEvent, record: Record<string, unknown>, key: 'latencyMs' | 'attempt'): void {
  if (typeof record[key] === 'number' && Number.isFinite(record[key])) {
    event[key] = record[key];
  }
}

function setString(span: TelemetrySpan, key: string, value: string | undefined): void {
  if (value !== undefined) {
    span.setAttribute(key, value);
  }
}
