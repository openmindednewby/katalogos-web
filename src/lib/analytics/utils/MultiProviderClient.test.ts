import { MultiProviderClient } from './MultiProviderClient';
import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';

import type { LoggingService } from '../../logging';
import type { AnalyticsClient } from '../types';

function createMockProvider(): jest.Mocked<AnalyticsClient> {
  return { track: jest.fn(), identify: jest.fn(), page: jest.fn(), reset: jest.fn() };
}

function createMockLogger(): jest.Mocked<LoggingService> {
  return { warn: jest.fn() } as unknown as jest.Mocked<LoggingService>;
}

describe('MultiProviderClient', () => {
  it('fans out track calls to all providers', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    client.track(AnalyticsEventName.MenuCreated, { type: 'bar' });

    expect(p1.track).toHaveBeenCalledWith(AnalyticsEventName.MenuCreated, { type: 'bar' });
    expect(p2.track).toHaveBeenCalledWith(AnalyticsEventName.MenuCreated, { type: 'bar' });
  });

  it('fans out identify calls to all providers', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    client.identify('user-1', { tenantId: 't-1' });

    expect(p1.identify).toHaveBeenCalledWith('user-1', { tenantId: 't-1' });
    expect(p2.identify).toHaveBeenCalledWith('user-1', { tenantId: 't-1' });
  });

  it('fans out page calls to all providers', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    client.page('/dashboard');

    expect(p1.page).toHaveBeenCalledWith('/dashboard', undefined);
    expect(p2.page).toHaveBeenCalledWith('/dashboard', undefined);
  });

  it('fans out reset calls to all providers', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    client.reset();

    expect(p1.reset).toHaveBeenCalled();
    expect(p2.reset).toHaveBeenCalled();
  });

  it('continues to next provider when one throws', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    p1.track.mockImplementation(() => {
      throw new Error('provider-1 failed');
    });
    const logger = createMockLogger();
    const client = new MultiProviderClient([p1, p2], logger);

    client.track(AnalyticsEventName.PageViewed);

    expect(p2.track).toHaveBeenCalledWith(AnalyticsEventName.PageViewed, undefined);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('logs provider errors without throwing', () => {
    const p1 = createMockProvider();
    p1.identify.mockImplementation(() => {
      throw new Error('oops');
    });
    const logger = createMockLogger();
    const client = new MultiProviderClient([p1], logger);

    expect(() => client.identify('user-1')).not.toThrow();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('getFeatureFlag returns the first defined result from providers', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    p1.getFeatureFlag = jest.fn().mockReturnValue(undefined);
    p2.getFeatureFlag = jest.fn().mockReturnValue(true);
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    const result = client.getFeatureFlag('beta-feature');

    expect(result).toBe(true);
    expect(p1.getFeatureFlag).toHaveBeenCalledWith('beta-feature');
    expect(p2.getFeatureFlag).toHaveBeenCalledWith('beta-feature');
  });

  it('getFeatureFlag returns undefined when no provider has the flag', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    p1.getFeatureFlag = jest.fn().mockReturnValue(undefined);
    p2.getFeatureFlag = jest.fn().mockReturnValue(undefined);
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    const result = client.getFeatureFlag('unknown-flag');

    expect(result).toBeUndefined();
  });

  it('getFeatureFlag skips providers without the method', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    p2.getFeatureFlag = jest.fn().mockReturnValue('variant-a');
    const client = new MultiProviderClient([p1, p2], createMockLogger());

    const result = client.getFeatureFlag('multivariate-flag');

    expect(result).toBe('variant-a');
  });

  it('getFeatureFlag continues when a provider throws', () => {
    const p1 = createMockProvider();
    const p2 = createMockProvider();
    p1.getFeatureFlag = jest.fn().mockImplementation(() => {
      throw new Error('provider-1 failed');
    });
    p2.getFeatureFlag = jest.fn().mockReturnValue(true);
    const logger = createMockLogger();
    const client = new MultiProviderClient([p1, p2], logger);

    const result = client.getFeatureFlag('beta-feature');

    expect(result).toBe(true);
    expect(logger.warn).toHaveBeenCalled();
  });
});
