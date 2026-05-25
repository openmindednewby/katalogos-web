/**
 * Status of a menu translation.
 */
const enum TranslationStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
  Stale = 4,
}

export default TranslationStatus;
