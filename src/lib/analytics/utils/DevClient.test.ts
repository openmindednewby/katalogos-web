import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import { ANALYTICS_LOG_CONTEXT } from '../constants';
import { DevClient } from './DevClient';

import type { LoggingService } from '../../logging';

function createMockLogger(): jest.Mocked<LoggingService> {
  return { info: jest.fn() } as unknown as jest.Mocked<LoggingService>;
}

describe('DevClient', () => {
  it('logs track events to LoggingService', () => {
    const logger = createMockLogger();
    const client = new DevClient(logger);

    client.track(AnalyticsEventName.MenuCreated, { menuType: 'restaurant' });

    expect(logger.info).toHaveBeenCalledWith(
      ANALYTICS_LOG_CONTEXT,
      `track: ${AnalyticsEventName.MenuCreated}`,
      { menuType: 'restaurant' },
    );
  });

  it('logs identify calls', () => {
    const logger = createMockLogger();
    const client = new DevClient(logger);

    client.identify('user-123', { tenantId: 'tenant-1' });

    expect(logger.info).toHaveBeenCalledWith(
      ANALYTICS_LOG_CONTEXT,
      'identify: user-123',
      { tenantId: 'tenant-1' },
    );
  });

  it('logs page views', () => {
    const logger = createMockLogger();
    const client = new DevClient(logger);

    client.page('/menus');

    expect(logger.info).toHaveBeenCalledWith(
      ANALYTICS_LOG_CONTEXT,
      'page: /menus',
      undefined,
    );
  });

  it('logs reset calls', () => {
    const logger = createMockLogger();
    const client = new DevClient(logger);

    client.reset();

    expect(logger.info).toHaveBeenCalledWith(ANALYTICS_LOG_CONTEXT, 'reset');
  });
});
