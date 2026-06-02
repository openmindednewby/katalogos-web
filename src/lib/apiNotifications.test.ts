import { HttpMethod } from '@dloizides/api-client-base';

import { getApiNotificationMessage, registerApiNotification } from './apiNotifications';

// Mock the localization helper
jest.mock('../localization/helpers', () => ({
  FM: jest.fn((id: string, p1?: string, _p2?: string) => {
    const messages: Record<string, string | undefined> = {
      'quizTemplates.messages.deleteInactiveSuccess': `Deleted ${p1} inactive templates`,
      'quizTemplates.messages.deleteInactiveNone': 'No inactive templates found',
      'quizTemplates.messages.deleteSuccess': 'Template deleted',
      'common.error': 'An error occurred',
    };
    return messages[id] ?? id;
  }),
}));

describe('API Notifications Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiNotificationMessage', () => {
    it('returns success message for DELETE inactive with count > 0', () => {
      const result = getApiNotificationMessage({
        path: '/questionerTemplates/delete/inactive',
        method: HttpMethod.Delete,
        isSuccess: true,
        responseData: { deletedCount: 5 },
      });

      expect(result).toEqual({
        message: 'Deleted 5 inactive templates',
        type: 'success',
      });
    });

    it('returns "no templates found" message for DELETE inactive with count = 0', () => {
      const result = getApiNotificationMessage({
        path: '/questionerTemplates/delete/inactive',
        method: HttpMethod.Delete,
        isSuccess: true,
        responseData: { deletedCount: 0 },
      });

      expect(result).toEqual({
        message: 'No inactive templates found',
        type: 'success',
      });
    });

    it('returns error message on failure', () => {
      const result = getApiNotificationMessage({
        path: '/questionerTemplates/delete/inactive',
        method: HttpMethod.Delete,
        isSuccess: false,
        errorMessage: 'Server error',
      });

      expect(result).toEqual({
        message: 'Server error',
        type: 'error',
      });
    });

    it('returns default error message when no error message provided', () => {
      const result = getApiNotificationMessage({
        path: '/questionerTemplates/delete/inactive',
        method: HttpMethod.Delete,
        isSuccess: false,
      });

      expect(result).toEqual({
        message: 'An error occurred',
        type: 'error',
      });
    });

    it('returns null for unmapped endpoints', () => {
      const result = getApiNotificationMessage({
        path: '/some/unmapped/endpoint',
        method: HttpMethod.Get,
        isSuccess: true,
      });

      expect(result).toBeNull();
    });

    it('returns null for unmapped method on mapped path', () => {
      const result = getApiNotificationMessage({
        path: '/questionerTemplates/delete/inactive',
        method: HttpMethod.Get,
        isSuccess: true,
      });

      expect(result).toBeNull();
    });
  });

  describe('registerApiNotification', () => {
    it('allows registering custom notification handlers', () => {
      const customHandler = jest.fn().mockReturnValue({
        message: 'Custom message',
        type: 'success' as const,
      });

      registerApiNotification({
        pathPattern: '/custom/endpoint',
        method: HttpMethod.Post,
        handler: customHandler,
      });

      const result = getApiNotificationMessage({
        path: '/custom/endpoint',
        method: HttpMethod.Post,
        isSuccess: true,
        responseData: { id: '123' },
      });

      expect(customHandler).toHaveBeenCalledWith({
        isSuccess: true,
        responseData: { id: '123' },
        errorMessage: undefined,
      });
      expect(result).toEqual({
        message: 'Custom message',
        type: 'success',
      });
    });

    it('supports path patterns with regex', () => {
      const handler = jest.fn().mockReturnValue({
        message: 'Deleted item',
        type: 'success' as const,
      });

      registerApiNotification({
        pathPattern: /^\/questionerTemplates\/[a-z0-9-]+$/i,
        method: HttpMethod.Delete,
        handler,
      });

      const result = getApiNotificationMessage({
        path: '/questionerTemplates/abc-123-def',
        method: HttpMethod.Delete,
        isSuccess: true,
      });

      expect(handler).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Deleted item',
        type: 'success',
      });
    });
  });
});
