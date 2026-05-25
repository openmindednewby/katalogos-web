import { Platform } from 'react-native';

/**
 * Builds the public menu URL for a given menu external ID.
 * On web, uses the current origin; on native, returns a relative path.
 */
export function buildPublicMenuUrl(externalId: string): string {
  const baseUrl = Platform.OS === 'web' ? window.location.origin : '';
  return `${baseUrl}/public/menu/${externalId}`;
}
