/**
 * Privacy hooks barrel export.
 */
export { useGetConsent, useUpdateConsent } from './hooks/usePrivacyConsent';
export {
  useRequestDataExport,
  useExportStatus,
  useDownloadExport,
} from './hooks/useDataExport';
export {
  useRequestDeletion,
  useConfirmDeletion,
  useCancelDeletion,
} from './hooks/useAccountDeletion';

export { default as ConsentType } from './enums/ConsentType';
export { default as ExportStatus } from './enums/ExportStatus';
export { default as DeletionStatus } from './enums/DeletionStatus';

export type {
  ConsentRecord,
  DataExportRequest,
  DeletionRequest,
} from './types';

export {
  ALL_CONSENT_TYPES,
  TOGGLEABLE_CONSENT_TYPES,
  DELETION_GRACE_PERIOD_DAYS,
} from './types';
