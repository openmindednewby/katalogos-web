const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockSetUser = jest.fn();
const mockLoadSentryAdapter = jest.fn();

interface SentryModule {
  initSentry: () => void;
  captureException: (error: unknown, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level?: string) => void;
  setSentryUser: (userId: string, tenantId?: string) => void;
  clearSentryUser: () => void;
}

/**
 * The Sentry SDK is now loaded via the lazy `sentryLoader` seam (UX Move 6),
 * so every wrapper call resolves asynchronously. Flush the pending microtasks
 * of the resolved-mock promise chain.
 */
async function flush(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

function loadModule(dsn: string): SentryModule {
  jest.resetModules();

  jest.doMock('./sentryLoader', () => ({
    loadSentryAdapter: mockLoadSentryAdapter,
  }));

  jest.doMock('../../../config/environment', () => ({
    __esModule: true,
    default: {
      SENTRY_DSN: dsn,
      SENTRY_ENVIRONMENT: 'test',
      SENTRY_TRACES_SAMPLE_RATE: 0,
    },
  }));


  return require('./sentry') as SentryModule;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadSentryAdapter.mockResolvedValue({
    captureException: mockCaptureException,
    captureMessage: mockCaptureMessage,
    setUser: mockSetUser,
  });
});

const VALID_DSN = 'https://abc@o0.ingest.sentry.io/0';
const EMPTY_DSN = '';

describe('sentry wrapper (enabled)', () => {
  it('initSentry loads and initialises the SDK when DSN is non-empty', async () => {
    const mod = loadModule(VALID_DSN);
    mod.initSentry();
    await flush();

    expect(mockLoadSentryAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: VALID_DSN,
        environment: 'test',
        sendDefaultPii: false,
      }),
    );
  });

  it('captureException forwards error and context to Sentry', async () => {
    const mod = loadModule(VALID_DSN);
    const err = new Error('boom');
    const extra = { url: '/api/test', status: 500 };
    mod.captureException(err, { extra });
    await flush();

    expect(mockCaptureException).toHaveBeenCalledWith(err, {
      extra,
      tags: undefined,
    });
  });

  it('captureMessage forwards message and level to Sentry', async () => {
    const mod = loadModule(VALID_DSN);
    mod.captureMessage('test message', 'warning');
    await flush();
    expect(mockCaptureMessage).toHaveBeenCalledWith('test message', 'warning');
  });

  it('setSentryUser calls Sentry.setUser with userId and tenantId', async () => {
    const mod = loadModule(VALID_DSN);
    mod.setSentryUser('user-guid', 'tenant-guid');
    await flush();
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-guid', tenantId: 'tenant-guid' });
  });

  it('setSentryUser omits tenantId when not provided', async () => {
    const mod = loadModule(VALID_DSN);
    mod.setSentryUser('user-guid');
    await flush();
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-guid' });
  });

  it('clearSentryUser calls Sentry.setUser(null)', async () => {
    const mod = loadModule(VALID_DSN);
    mod.clearSentryUser();
    await flush();
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});

describe('sentry wrapper (disabled)', () => {
  it('initSentry does NOT load the SDK when DSN is empty', async () => {
    const mod = loadModule(EMPTY_DSN);
    mod.initSentry();
    await flush();
    expect(mockLoadSentryAdapter).not.toHaveBeenCalled();
  });

  it('captureException is a no-op when DSN is empty', async () => {
    const mod = loadModule(EMPTY_DSN);
    mod.captureException(new Error('nope'));
    await flush();
    expect(mockLoadSentryAdapter).not.toHaveBeenCalled();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('setSentryUser is a no-op when DSN is empty', async () => {
    const mod = loadModule(EMPTY_DSN);
    mod.setSentryUser('user-guid', 'tenant-guid');
    await flush();
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it('clearSentryUser is a no-op when DSN is empty', async () => {
    const mod = loadModule(EMPTY_DSN);
    mod.clearSentryUser();
    await flush();
    expect(mockSetUser).not.toHaveBeenCalled();
  });
});
