/** Subscription lifecycle status returned by the PaymentService API. */
const enum SubscriptionStatus {
  Trial = 'Trial',
  Active = 'Active',
  PastDue = 'PastDue',
  Canceled = 'Canceled',
  Expired = 'Expired',
  Suspended = 'Suspended',
}

export default SubscriptionStatus;
