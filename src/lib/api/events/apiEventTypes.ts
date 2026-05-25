/**
 * Re-export shim for @dloizides/api-client-base API event types.
 *
 * The runtime types are defined in the shared `@dloizides/api-client-base`
 * package. This file is kept for backward compatibility with existing
 * imports inside BaseClient.
 */
export type {
  ApiEvent,
  ApiEventType,
  MaintenanceModeEvent,
  ModalEvent,
  RedirectEvent,
  SessionExpiredEvent,
  ToastEvent,
} from '@dloizides/api-client-base';
