/** Verification status for a custom domain. */
const enum CustomDomainStatus {
  PendingVerification = 0,
  Active = 1,
  Failed = 2,
  Revoked = 3,
}

export default CustomDomainStatus;
