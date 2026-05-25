/**
 * LogBox configuration - must be imported early to disable error overlays in production.
 *
 * LogBox is React Native's development error overlay. It has poor color contrast
 * (red/pink backgrounds with dark text) that fails WCAG accessibility audits.
 * This overlay should never appear in production or during Lighthouse testing.
 *
 * This file should be imported at the very top of the app entry point
 * before any other code that might throw errors.
 */
import { LogBox } from 'react-native';

// Disable LogBox in production to prevent accessibility-failing error overlays
// __DEV__ is a React Native global that's true in development, false in production
if (typeof __DEV__ !== 'undefined' && !__DEV__) 
  LogBox.ignoreAllLogs(true);

