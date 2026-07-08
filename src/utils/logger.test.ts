import { logger as sharedLogger } from '@dloizides/logging-web';

import { logger } from './logger';

// `./logger` is a deprecated re-export SHIM over `@dloizides/logging-web`
// (see logger.ts) — it no longer wraps the local `loggingService`. The old
// delegation tests here asserted that dead implementation and failed after the
// refactor to the shared package. The shim's only contract now is that it
// re-exports the shared logger unchanged; the logging behaviour itself is owned
// and tested by `@dloizides/logging-web`.
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
