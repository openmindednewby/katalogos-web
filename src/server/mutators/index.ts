/**
 * Orval mutators index — re-exports from `@dloizides/orval-preset`.
 *
 * The shared package owns the registry + the six mutators. This local index is
 * kept for backward compatibility with existing in-app imports (e.g. the
 * `registerMutators` call at app startup).
 */

// Registry - call registerMutators() at app startup
export { registerMutators, getMutator } from '@dloizides/orval-preset';
export type { OrvalRequest, OrvalMutator } from '@dloizides/orval-preset';

// Mutators - used by Orval-generated hooks
export { customInstance } from './onlineMenuMutator';
export { identityInstance } from './identityMutator';
export { questionerInstance } from './questionerMutator';
export { contentInstance } from './contentMutator';
export { notificationInstance } from './notificationMutator';
export { paymentInstance } from './paymentMutator';
