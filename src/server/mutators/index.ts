/** Orval mutators index — re-exports from `@dloizides/orval-preset`. */

export { registerMutators, getMutator } from '@dloizides/orval-preset';
export type { OrvalRequest, OrvalMutator } from '@dloizides/orval-preset';

export { customInstance } from './onlineMenuMutator';
export { identityInstance } from './identityMutator';
export { questionerInstance } from './questionerMutator';
export { contentInstance } from './contentMutator';
export { notificationInstance } from './notificationMutator';
export { paymentInstance } from './paymentMutator';
