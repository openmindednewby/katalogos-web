/** Account deletion request statuses. */
const enum DeletionStatus {
  PendingConfirmation = 'PendingConfirmation',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export default DeletionStatus;
