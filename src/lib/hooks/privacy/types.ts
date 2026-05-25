/**
 * Types for privacy/GDPR hooks.
 */
import ConsentType from './enums/ConsentType';

import type DeletionStatus from './enums/DeletionStatus';
import type ExportStatus from './enums/ExportStatus';

/** A single consent record from the API. */
export interface ConsentRecord {
  consentType: ConsentType;
  isGranted: boolean;
}

/** Request body for updating consent. */
export interface UpdateConsentRequest {
  consentType: ConsentType;
  isGranted: boolean;
}

/** Data export request record. */
export interface DataExportRequest {
  requestId: string;
  status: ExportStatus;
  createdAt?: string;
}

/** Account deletion request record. */
export interface DeletionRequest {
  requestId: string;
  status: DeletionStatus;
  createdAt?: string;
  scheduledDeletionDate?: string;
}

/** Confirm deletion request body. */
export interface ConfirmDeletionRequest {
  confirmationToken: string;
}

/** Request deletion body. */
export interface RequestDeletionBody {
  reason?: string;
}

/** All consent types available for user toggling (excluding essential). */
export const TOGGLEABLE_CONSENT_TYPES = [
  ConsentType.Analytics,
  ConsentType.Marketing,
] as const;

/** All consent types including essential. */
export const ALL_CONSENT_TYPES = [
  ConsentType.Essential,
  ConsentType.Analytics,
  ConsentType.Marketing,
] as const;

/** Grace period in days before deletion is processed. */
export const DELETION_GRACE_PERIOD_DAYS = 30;
