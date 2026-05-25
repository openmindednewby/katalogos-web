/** Platform-aware utilities for keyboard shortcut display. */
import { Platform } from 'react-native';

const IS_MAC = Platform.OS === 'web' && typeof navigator !== 'undefined'
  && navigator.platform.toUpperCase().includes('MAC');

/** Returns the platform-appropriate modifier label. */
export function getModifierLabel(): string {
  return IS_MAC ? 'Cmd' : 'Ctrl';
}

/** Returns whether the current platform uses the Meta key (Mac). */
export function isMacPlatform(): boolean {
  return IS_MAC;
}
