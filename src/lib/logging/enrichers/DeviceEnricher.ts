import { Platform } from 'react-native';

import type { LogEntryDevice } from '../types';

/** Enriches a log entry with device platform and version information. */
export function enrichWithDevice(): LogEntryDevice {
  return {
    platform: Platform.OS,
    version: String(Platform.Version),
  };
}
