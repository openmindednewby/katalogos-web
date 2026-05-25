/**
 * Orval mutators index.
 *
 * These mutators are used by Orval-generated hooks. They have no Expo
 * dependencies at the module level, allowing Orval to load them during
 * code generation in Node.js. At runtime, they retrieve the real HTTP
 * client implementations from the registry.
 */

// Registry - call registerMutators() at app startup
export { registerMutators, getMutator } from './registry';
export type { OrvalRequest, OrvalMutator } from './registry';

// Mutators - used by Orval-generated hooks
export { customInstance } from './onlineMenuMutator';
export { identityInstance } from './identityMutator';
export { questionerInstance } from './questionerMutator';
export { contentInstance } from './contentMutator';
export { notificationInstance } from './notificationMutator';
export { paymentInstance } from './paymentMutator';
