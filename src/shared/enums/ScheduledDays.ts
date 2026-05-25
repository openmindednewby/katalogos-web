/**
 * Flags enum representing days of the week for menu scheduling.
 * Mirrors the backend ScheduledDays enum with bitwise flag values.
 */

/* eslint-disable no-magic-numbers */
const enum ScheduledDays {
  None = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 4,
  Thursday = 8,
  Friday = 16,
  Saturday = 32,
  Sunday = 64,
  Weekdays = 1 | 2 | 4 | 8 | 16,
  Weekends = 32 | 64,
  EveryDay = 1 | 2 | 4 | 8 | 16 | 32 | 64,
}
/* eslint-enable no-magic-numbers */

export default ScheduledDays;
