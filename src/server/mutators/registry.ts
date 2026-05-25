/**
 * Runtime registry for HTTP client implementations.
 *
 * This registry allows the app to register the real http client implementations
 * at startup, which the generated Orval hooks will then use at runtime.
 *
 * Usage in app entry point (e.g., App.tsx):
 * ```typescript
 * import { registerMutators } from './server/mutators/registry';
 * import { customInstance } from './server/httpClient';
 * import { identityInstance } from './server/httpClientIdentity';
 * import { questionerInstance } from './server/httpClientQuestioner';
 * import { contentInstance } from './server/httpClientContent';
 * import { notificationInstance } from './server/httpClientNotification';
 * import { paymentInstance } from './server/httpClientPayment';
 *
 * registerMutators({
 *   customInstance,
 *   identityInstance,
 *   questionerInstance,
 *   contentInstance,
 *   notificationInstance,
 *   paymentInstance,
 * });
 * ```
 */

export interface OrvalRequest<Req = unknown, Qry = unknown> {
  url: string;
  method?: string;
  data?: Req | FormData;
  params?: Qry;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export type OrvalMutator = <TResp = unknown, TReq = unknown, TQry = unknown>(
  opts: OrvalRequest<TReq, TQry>,
) => Promise<TResp>;

interface MutatorRegistry {
  customInstance?: OrvalMutator;
  identityInstance?: OrvalMutator;
  questionerInstance?: OrvalMutator;
  contentInstance?: OrvalMutator;
  notificationInstance?: OrvalMutator;
  paymentInstance?: OrvalMutator;
}

// Global registry - populated at app startup
const registry: MutatorRegistry = {};

/**
 * Register the real HTTP client implementations.
 * Call this once at app startup before any API hooks are used.
 */
export function registerMutators(mutators: Partial<MutatorRegistry>): void {
  if (mutators.customInstance) registry.customInstance = mutators.customInstance;
  if (mutators.identityInstance) registry.identityInstance = mutators.identityInstance;
  if (mutators.questionerInstance) registry.questionerInstance = mutators.questionerInstance;
  if (mutators.contentInstance) registry.contentInstance = mutators.contentInstance;
  if (mutators.notificationInstance) registry.notificationInstance = mutators.notificationInstance;
  if (mutators.paymentInstance) registry.paymentInstance = mutators.paymentInstance;
}

/**
 * Get a registered mutator by name.
 * @throws Error if the mutator has not been registered.
 */
export function getMutator(name: keyof MutatorRegistry): OrvalMutator {
  const mutator = registry[name];
  if (!mutator) 
    throw new Error(
      `HTTP client '${name}' not registered. Call registerMutators() at app startup.`,
    );
  
  return mutator;
}
