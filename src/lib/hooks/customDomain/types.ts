import type CustomDomainStatus from './enums/CustomDomainStatus';

/** DTO returned by the custom domain API. */
export interface CustomDomainDto {
  externalId: string;
  domainName: string;
  ownershipToken: string;
  status: CustomDomainStatus;
  verifiedAt: string | null;
  lastVerificationAttempt: string | null;
  lastVerificationError: string | null;
  cnameTarget: string;
}

/** Return type of the useCustomDomain hook. */
export interface UseCustomDomainReturn {
  domain: CustomDomainDto | null;
  isLoading: boolean;
  error: string | null;
  addDomain: (domainName: string) => Promise<void>;
  removeDomain: () => Promise<void>;
  requestVerification: () => Promise<void>;
}
