import { ADAPTER_CAPABILITY_KEYS, type AdapterCapabilities, type AIPlatformAdapter, type AdapterDescriptor } from './adapter.js';
import { AIEvaluationError } from './errors.js';
import type { AdapterId } from './identifiers.js';

export interface AdapterRegistry {
  register(adapter: AIPlatformAdapter): void;
  has(id: AdapterId): boolean;
  get(id: AdapterId): AIPlatformAdapter;
  list(): AdapterDescriptor[];
}

export function validateAdapterCapabilities(capabilities: AdapterCapabilities): void {
  for (const key of ADAPTER_CAPABILITY_KEYS) {
    if (typeof capabilities[key] !== 'boolean') {
      throw new AIEvaluationError('ADAPTER_CAPABILITY_ERROR', `Capability "${key}" must be a boolean`);
    }
  }
}

/**
 * Registry instance for tests and for application composition.
 * The public API does not require a process-wide singleton.
 */
export class InMemoryAdapterRegistry implements AdapterRegistry {
  private readonly adapters = new Map<AdapterId, AIPlatformAdapter>();

  register(adapter: AIPlatformAdapter): void {
    if (!adapter.id || !adapter.id.trim()) {
      throw new AIEvaluationError('CONFIG_ERROR', 'Adapter id is required');
    }
    if (this.adapters.has(adapter.id)) {
      throw new AIEvaluationError('CONFIG_ERROR', `Adapter "${adapter.id}" is already registered`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  has(id: AdapterId): boolean {
    return this.adapters.has(id);
  }

  get(id: AdapterId): AIPlatformAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new AIEvaluationError('ADAPTER_NOT_FOUND', `Adapter "${id}" is not registered`);
    }
    return adapter;
  }

  list(): AdapterDescriptor[] {
    return [...this.adapters.values()].map((adapter) => ({
      id: adapter.id,
      name: adapter.name,
      version: adapter.version,
    }));
  }

  async requireCapability(id: AdapterId, capability: keyof AdapterCapabilities): Promise<void> {
    const adapter = this.get(id);
    const capabilities = await adapter.capabilities();
    validateAdapterCapabilities(capabilities);
    if (!capabilities[capability]) {
      throw new AIEvaluationError(
        'ADAPTER_CAPABILITY_ERROR',
        `Adapter "${id}" does not support ${capability}`,
      );
    }
  }
}

export function createAdapterRegistry(): InMemoryAdapterRegistry {
  return new InMemoryAdapterRegistry();
}
