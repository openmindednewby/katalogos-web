import { enrichWithDevice } from './DeviceEnricher';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: '17.2' },
}));

describe('enrichWithDevice', () => {
  it('returns platform from Platform.OS', () => {
    const device = enrichWithDevice();

    expect(device.platform).toBe('ios');
  });

  it('returns version as string from Platform.Version', () => {
    const device = enrichWithDevice();

    expect(device.version).toBe('17.2');
  });

  it('returns an object with platform and version keys', () => {
    const device = enrichWithDevice();

    expect(device).toEqual({
      platform: 'ios',
      version: '17.2',
    });
  });
});
