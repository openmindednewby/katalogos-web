 

import HttpMethod from '../../../shared/enums/HttpMethod';

import type { ClassifiedError, ErrorRule } from './errorTypes';

// Use const enum values inline since they're erased at compile time
const ACTION_TYPE_TOAST = 'toast';
const ACTION_TYPE_MODAL = 'modal';
const ACTION_TYPE_REDIRECT = 'redirect';
const ACTION_TYPE_SILENT = 'silent';
const ACTION_TYPE_RETRY = 'retry';
const ACTION_TYPE_CUSTOM = 'custom';

const SEVERITY_ERROR = 'error';
const SEVERITY_WARNING = 'warning';

function createClassifiedError(overrides: Partial<ClassifiedError> = {}): ClassifiedError {
  return {
    status: 500,
    url: '/api/test',
    method: HttpMethod.Get,
    message: 'Server error occurred',
    originalError: new Error('test'),
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('errorActions', () => {
  const mockEmit = jest.fn();
  const mockReportToMonitoring = jest.fn();
  const mockI18nT = jest.fn();
  const mockLoggerWarn = jest.fn();
  const mockLoggerError = jest.fn();
  const mockLoggerInfo = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    mockEmit.mockClear();
    mockReportToMonitoring.mockClear();
    mockI18nT.mockClear();
    mockLoggerWarn.mockClear();
    mockLoggerError.mockClear();
    mockLoggerInfo.mockClear();

    jest.doMock('../events/apiEventBus', () => ({
      apiEventBus: { emit: mockEmit },
    }));
    jest.doMock('./errorReporter', () => ({
      reportToMonitoring: mockReportToMonitoring,
    }));
    jest.doMock('../../../localization/i18n', () => ({
      __esModule: true,
      default: { t: mockI18nT },
    }));
    jest.doMock('../../../utils/logger', () => ({
      logger: {
        warn: mockLoggerWarn,
        error: mockLoggerError,
        info: mockLoggerInfo,
        debug: jest.fn(),
      },
    }));
    jest.doMock('../../../utils/is', () => ({
      isValueDefined: (v: unknown) => v !== null && v !== undefined,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function loadModule(): {
    executeErrorAction: (rule: ErrorRule, error: ClassifiedError) => void;
    resolveMessage: (rule: ErrorRule, error: ClassifiedError) => string;
    registerCustomHandler: (name: string, handler: (error: ClassifiedError) => void) => void;
    unregisterCustomHandler: (name: string) => void;
  } {
    return require('./errorActions');
  }

  describe('executeErrorAction', () => {
    it('emits toast event for toast action type', () => {
      mockI18nT.mockReturnValue('Translated message');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-toast',
        match: { status: 500 },
        action: { type: ACTION_TYPE_TOAST as never, severity: SEVERITY_ERROR as never },
        messageKey: 'errors.serverError',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'toast',
        severity: SEVERITY_ERROR,
        message: 'Translated message',
      });
    });

    it('emits modal event for modal action type', () => {
      mockI18nT.mockReturnValue('Modal message');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-modal',
        match: { status: 503 },
        action: {
          type: ACTION_TYPE_MODAL as never,
          severity: SEVERITY_WARNING as never,
          modalComponent: 'MaintenanceModal',
        },
        messageKey: 'errors.maintenance',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'modal',
        modalComponent: 'MaintenanceModal',
        message: 'Modal message',
        severity: SEVERITY_WARNING,
      });
    });

    it('uses default modal component when not specified', () => {
      mockI18nT.mockReturnValue('Default modal');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-modal-default',
        match: { status: 500 },
        action: { type: ACTION_TYPE_MODAL as never },
        messageKey: 'errors.test',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).toHaveBeenCalledWith(
        expect.objectContaining({ modalComponent: 'ErrorModal' })
      );
    });

    it('emits redirect event for redirect action type', () => {
      mockI18nT.mockReturnValue('Session expired');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-redirect',
        match: { status: 401 },
        action: { type: ACTION_TYPE_REDIRECT as never, target: '/(auth)/login' },
        messageKey: 'errors.sessionExpired',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).toHaveBeenCalledWith({
        type: 'redirect',
        target: '/(auth)/login',
        message: 'Session expired',
      });
    });

    it('uses default redirect target when not specified', () => {
      mockI18nT.mockReturnValue('Redirecting');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-redirect-default',
        match: { status: 401 },
        action: { type: ACTION_TYPE_REDIRECT as never },
        messageKey: 'errors.test',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).toHaveBeenCalledWith(
        expect.objectContaining({ target: '/login' })
      );
    });

    it('does not emit event for silent action type', () => {
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-silent',
        match: { status: 404 },
        action: { type: ACTION_TYPE_SILENT as never },
        messageKey: 'errors.notFound',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).not.toHaveBeenCalled();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'errorActions',
        expect.stringContaining('Silent error: test-silent'),
        expect.any(Object)
      );
    });

    it('does nothing for retry action type', () => {
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-retry',
        match: { status: 500 },
        action: { type: ACTION_TYPE_RETRY as never },
      };

      executeErrorAction(rule, error);

      expect(mockEmit).not.toHaveBeenCalled();
    });

    it('calls reportToMonitoring when reportToMonitoring is true', () => {
      mockI18nT.mockReturnValue('Server error');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-report',
        match: { status: 500 },
        action: {
          type: ACTION_TYPE_TOAST as never,
          severity: SEVERITY_ERROR as never,
          reportToMonitoring: true,
        },
        messageKey: 'errors.serverError',
      };

      executeErrorAction(rule, error);

      expect(mockReportToMonitoring).toHaveBeenCalledWith(error);
    });

    it('does not call reportToMonitoring when not specified', () => {
      mockI18nT.mockReturnValue('Warning');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-no-report',
        match: { status: 400 },
        action: { type: ACTION_TYPE_TOAST as never, severity: SEVERITY_WARNING as never },
        messageKey: 'errors.validation',
      };

      executeErrorAction(rule, error);

      expect(mockReportToMonitoring).not.toHaveBeenCalled();
    });

    it('uses default severity when severity is not specified', () => {
      mockI18nT.mockReturnValue('Test');
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-default-severity',
        match: { status: 500 },
        action: { type: ACTION_TYPE_TOAST as never },
        messageKey: 'errors.test',
      };

      executeErrorAction(rule, error);

      expect(mockEmit).toHaveBeenCalledWith(
        expect.objectContaining({ severity: SEVERITY_ERROR })
      );
    });
  });

  describe('resolveMessage', () => {
    it('returns i18n translated message when messageKey resolves', () => {
      mockI18nT.mockReturnValue('Translated error message');
      const { resolveMessage } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test',
        match: {},
        action: { type: ACTION_TYPE_TOAST as never },
        messageKey: 'errors.test',
      };

      const message = resolveMessage(rule, error);

      expect(message).toBe('Translated error message');
    });

    it('returns fallbackMessage when i18n key returns the key itself', () => {
      mockI18nT.mockReturnValue('errors.test');
      const { resolveMessage } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test',
        match: {},
        action: { type: ACTION_TYPE_TOAST as never },
        messageKey: 'errors.test',
        fallbackMessage: 'Something went wrong',
      };

      const message = resolveMessage(rule, error);

      expect(message).toBe('Something went wrong');
    });

    it('returns fallbackMessage when i18n key returns empty string', () => {
      mockI18nT.mockReturnValue('');
      const { resolveMessage } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test',
        match: {},
        action: { type: ACTION_TYPE_TOAST as never },
        messageKey: 'errors.test',
        fallbackMessage: 'Fallback message',
      };

      const message = resolveMessage(rule, error);

      expect(message).toBe('Fallback message');
    });

    it('returns error.message when no messageKey and no fallbackMessage', () => {
      const { resolveMessage } = loadModule();
      const error = createClassifiedError({ message: 'Original error message' });
      const rule: ErrorRule = {
        name: 'test',
        match: {},
        action: { type: ACTION_TYPE_TOAST as never },
      };

      const message = resolveMessage(rule, error);

      expect(message).toBe('Original error message');
    });

    it('returns generic message when error.message is empty', () => {
      const { resolveMessage } = loadModule();
      const error = createClassifiedError({ message: '' });
      const rule: ErrorRule = {
        name: 'test',
        match: {},
        action: { type: ACTION_TYPE_TOAST as never },
      };

      const message = resolveMessage(rule, error);

      expect(message).toBe('An error occurred');
    });
  });

  describe('custom handlers', () => {
    it('executes registered custom handler', () => {
      const { executeErrorAction, registerCustomHandler } = loadModule();
      const mockHandler = jest.fn();
      registerCustomHandler('my-handler', mockHandler);

      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-custom',
        match: {},
        action: { type: ACTION_TYPE_CUSTOM as never, handler: 'my-handler' },
      };

      executeErrorAction(rule, error);

      expect(mockHandler).toHaveBeenCalledWith(error);
    });

    it('logs warning when custom handler name is missing', () => {
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-no-handler',
        match: {},
        action: { type: ACTION_TYPE_CUSTOM as never },
      };

      executeErrorAction(rule, error);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'errorActions',
        'Custom action missing handler name'
      );
    });

    it('logs warning when custom handler is not found', () => {
      const { executeErrorAction } = loadModule();
      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-not-found',
        match: {},
        action: { type: ACTION_TYPE_CUSTOM as never, handler: 'nonexistent' },
      };

      executeErrorAction(rule, error);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'errorActions',
        expect.stringContaining('Custom handler not found: nonexistent')
      );
    });

    it('catches and logs errors thrown by custom handlers', () => {
      const { executeErrorAction, registerCustomHandler } = loadModule();
      registerCustomHandler('throwing-handler', () => {
        throw new Error('handler error');
      });

      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-throwing',
        match: {},
        action: { type: ACTION_TYPE_CUSTOM as never, handler: 'throwing-handler' },
      };

      expect(() => executeErrorAction(rule, error)).not.toThrow();
      expect(mockLoggerError).toHaveBeenCalledWith(
        'errorActions',
        expect.stringContaining('Custom handler "throwing-handler" threw'),
        expect.any(Error)
      );
    });

    it('unregisters custom handler', () => {
      const { executeErrorAction, registerCustomHandler, unregisterCustomHandler } = loadModule();
      const mockHandler = jest.fn();
      registerCustomHandler('removable', mockHandler);
      unregisterCustomHandler('removable');

      const error = createClassifiedError();
      const rule: ErrorRule = {
        name: 'test-unregistered',
        match: {},
        action: { type: ACTION_TYPE_CUSTOM as never, handler: 'removable' },
      };

      executeErrorAction(rule, error);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'errorActions',
        expect.stringContaining('Custom handler not found: removable')
      );
    });
  });
});
