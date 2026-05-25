/** Status of a team invitation. */
const enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Expired = 'expired',
}

const PENDING_VALUE = 'pending';
const ACCEPTED_VALUE = 'accepted';

/** Returns true when the status string represents Pending. */
export function isPendingStatus(status: string): boolean {
  return status.toLowerCase() === PENDING_VALUE;
}

/** Returns true when the status string represents Accepted. */
export function isAcceptedStatus(status: string): boolean {
  return status.toLowerCase() === ACCEPTED_VALUE;
}

export default InvitationStatus;
