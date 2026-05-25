/**
 * Re-export shim for @dloizides/api-client-base event bus.
 *
 * The runtime implementation lives in the shared
 * `@dloizides/api-client-base` package. This file is kept for backward
 * compatibility with existing imports inside BaseClient.
 */
export { ApiEventBus, apiEventBus } from '@dloizides/api-client-base';
export type { ApiEventListener } from '@dloizides/api-client-base';
