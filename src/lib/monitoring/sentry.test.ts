const mockInit = jest.fn();
const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();
const mockSetUser = jest.fn();

interface SentryModule {
  initSentry: () => void;
  captureException: (error: unknown, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level?: string) => void;
  setSentryUser: (userId: string, tenantId?: string) => void;
  clearSentryUser: () => void;
}

beforeEach(() => {
  jest.clearAllMocks();
});

function loadModule(dsn: string): SentryModule {
  jest.resetModules();

  jest.doMock('@sentry/react', () => ({
    init: mockInit,
    captureException: mockCaptureException,
    captureMessage: mockCaptureMessage,
    setUser: mockSetUser,
  }));

  jest.doMock('../../config/environment', () => ({
    __esModule: true,
    default: {
      SENTRY_DSN: dsn,
      SENTRY_ENVIRONMENT: 'test',
      SENTRY_TRACES_SAMPLE_RATE: 0,
    },
  }));

   
  return require('./sentry') as SentryModule;
}

const VALID_DSN = 'https://abc@o0.ingest.sentry.io/0';
const EMPTY_DSN = '';

describe('sentry wrapper (enabled)', () => {
  it('initSentry calls Sentry.init when DSN is non-empty', () => {
    const mod = loadModule(VALID_DSN);
    mod.initSentry();

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: VALID_DSN,
        environment: 'test',
        sendDefaultPii: false,
      }),
    );
  });

  it('captureException forwards error and context to Sentry', () => {
    const mod = loadModule(VALID_DSN);
    const err = new Error('boom');
    const extra = { url: '/api/test', status: 500 };
    mod.captureException(err, { extra });

    expect(mockCaptureException).toHaveBeenCalledWith(err, {
      extra,
      tags: undefined,
    });
  });

  it('captureMessage forwards message and level to Sentry', () => {
    const mod = loadModule(VALID_DSN);
    mod.captureMessage('test message', 'warning');
    expect(mockCaptureMessage).toHaveBeenCalledWith('test message', 'warning');
  });

  it('setSentryUser calls Sentry.setUser with userId and tenantId', () => {
    const mod = loadModule(VALID_DSN);
    mod.setSentryUser('user-guid', 'tenant-guid');
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-guid', tenantId: 'tenant-guid' });
  });

  it('setSentryUser omits tenantId when not provided', () => {
    const mod = loadModule(VALID_DSN);
    mod.setSentryUser('user-guid');
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-guid' });
  });

  it('clearSentryUser calls Sentry.setUser(null)', () => {
    const mod = loadModule(VALID_DSN);
    mod.clearSentryUser();
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});

describe('sentry wrapper (disabled)', () => {
  it('initSentry does NOT call Sentry.init when DSN is empty', () => {
    const mod = loadModule(EMPTY_DSN);
    mod.initSentry();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('captureException is a no-op when DSN is empty', () => {
    const mod = loadModule(EMPTY_DSN);
    mod.captureException(new Error('nope'));
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('setSentryUser is a no-op when DSN is empty', () => {
    const mod = loadModule(EMPTY_DSN);
    mod.setSentryUser('user-guid', 'tenant-guid');
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it('clearSentryUser is a no-op when DSN is empty', () => {
    const mod = loadModule(EMPTY_DSN);
    mod.clearSentryUser();
    expect(mockSetUser).not.toHaveBeenCalled();
  });
});
