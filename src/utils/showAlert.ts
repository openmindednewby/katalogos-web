import { Alert, Platform } from 'react-native';

/**
 * Show a user-facing alert in a way that Playwright can reliably observe on web.
 *
 * On web, Playwright listens for native browser dialogs (window.alert/confirm/prompt).
 * React Native's Alert API does not always trigger those dialogs under react-native-web.
 */
export function showAlert(message: string, title = 'Error'): void {
  const isWebPlatform = Platform.OS === 'web';
  const hasNativeAlert = typeof window !== 'undefined' && typeof window.alert === 'function';
  const shouldUseNativeAlert = isWebPlatform && hasNativeAlert;
  if (shouldUseNativeAlert) {
    // Playwright expects a native browser dialog.
    // eslint-disable-next-line no-alert
    window.alert(message);
    return;
  }

  Alert.alert(title, message);
}

