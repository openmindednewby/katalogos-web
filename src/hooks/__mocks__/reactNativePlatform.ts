/**
 * Mock for React Native Platform module.
 * This file exists to work around ESLint naming convention rules
 * that disallow the uppercase 'OS' property name.
 */

let currentOS = 'web';

export function setPlatformOS(os: string): void {
  currentOS = os;
}

export function getPlatformOS(): string {
  return currentOS;
}

export function resetPlatformOS(): void {
  currentOS = 'web';
}

// Create platform object with OS getter
export const Platform = {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Platform.OS is the React Native API
  get OS(): string {
    return currentOS;
  },
};

export const Linking = {
  openURL: jest.fn(),
};
