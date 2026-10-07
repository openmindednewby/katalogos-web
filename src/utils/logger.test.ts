import { logger as sharedLogger } from '@dloizides/logging-web';

import { logger } from './logger';

describe('logger (deprecated re-export shim)', () => {
  it('re-exports the shared @dloizides/logging-web logger', () => {
    expect(logger).toBe(sharedLogger);
  });

  it('exposes the debug/info/warn/error surface', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
