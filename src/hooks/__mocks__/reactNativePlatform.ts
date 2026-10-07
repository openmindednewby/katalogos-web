
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

export const Platform = {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Platform.OS is the React Native API
  get OS(): string {
    return currentOS;
  },
};

export const Linking = {
  openURL: jest.fn(),
};
