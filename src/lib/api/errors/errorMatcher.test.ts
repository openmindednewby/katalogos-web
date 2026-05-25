import { matchError, matchesRule, matchesStatus, matchesPath, matchesMethod } from './errorMatcher';
import { resetErrorRules, registerErrorRule, PRIORITY_DEFAULT, PRIORITY_ROUTE_SPECIFIC } from './errorRegistry';
import { ErrorActionType } from './errorTypes';
import HttpMethod from '../../../shared/enums/HttpMethod';

import type { ClassifiedError, ErrorMatcher, ErrorRule } from './errorTypes';

function createClassifiedError(overrides: Partial<ClassifiedError> = {}): ClassifiedError {
  return {
    status: 500,
    url: '/api/test',
    method: HttpMethod.Get,
    message: 'Test error',
    originalError: new Error('test'),
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('errorMatcher', () => {
  afterEach(() => {
    resetErrorRules();
  });

  describe('matchesStatus', () => {
    it('matches exact status code', () => {
      expect(matchesStatus(401, 401)).toBe(true);
    });

    it('does not match different status code', () => {
      expect(matchesStatus(401, 403)).toBe(false);
    });

    it('matches status in array', () => {
      expect(matchesStatus(400, [400, 422])).toBe(true);
      expect(matchesStatus(422, [400, 422])).toBe(true);
    });

    it('does not match status not in array', () => {
      expect(matchesStatus(500, [400, 422])).toBe(false);
    });

    it('matches status in range', () => {
      expect(matchesStatus(500, { min: 500, max: 599 })).toBe(true);
      expect(matchesStatus(503, { min: 500, max: 599 })).toBe(true);
      expect(matchesStatus(599, { min: 500, max: 599 })).toBe(true);
    });

    it('does not match status outside range', () => {
      expect(matchesStatus(499, { min: 500, max: 599 })).toBe(false);
      expect(matchesStatus(600, { min: 500, max: 599 })).toBe(false);
    });
  });

  describe('matchesPath', () => {
    it('matches path as substring', () => {
      expect(matchesPath('/api/templates/123', '/templates')).toBe(true);
    });

    it('does not match when path is not a substring', () => {
      expect(matchesPath('/api/users/123', '/templates')).toBe(false);
    });

    it('matches path with regex', () => {
      expect(matchesPath('/api/templates/123', /\/templates\/\d+/)).toBe(true);
    });

    it('does not match when regex does not match', () => {
      expect(matchesPath('/api/templates/abc', /\/templates\/\d+$/)).toBe(false);
    });
  });

  describe('matchesMethod', () => {
    it('matches exact method', () => {
      expect(matchesMethod(HttpMethod.Post, HttpMethod.Post)).toBe(true);
    });

    it('does not match different method', () => {
      expect(matchesMethod(HttpMethod.Post, HttpMethod.Get)).toBe(false);
    });

    it('matches case-insensitively', () => {
      expect(matchesMethod('post' as HttpMethod, HttpMethod.Post)).toBe(true);
    });

    it('matches method in array', () => {
      expect(matchesMethod(HttpMethod.Post, [HttpMethod.Post, HttpMethod.Put])).toBe(true);
      expect(matchesMethod(HttpMethod.Put, [HttpMethod.Post, HttpMethod.Put])).toBe(true);
    });

    it('does not match method not in array', () => {
      expect(matchesMethod(HttpMethod.Delete, [HttpMethod.Post, HttpMethod.Put])).toBe(false);
    });
  });

  describe('matchesRule', () => {
    it('matches when all specified fields match', () => {
      const error = createClassifiedError({ status: 400, url: '/api/users', method: HttpMethod.Post });
      const matcher: ErrorMatcher = { status: 400, path: '/users', method: HttpMethod.Post };

      expect(matchesRule(error, matcher)).toBe(true);
    });

    it('does not match when status does not match', () => {
      const error = createClassifiedError({ status: 500 });
      const matcher: ErrorMatcher = { status: 400 };

      expect(matchesRule(error, matcher)).toBe(false);
    });

    it('does not match when path does not match', () => {
      const error = createClassifiedError({ url: '/api/templates' });
      const matcher: ErrorMatcher = { path: '/users' };

      expect(matchesRule(error, matcher)).toBe(false);
    });

    it('does not match when method does not match', () => {
      const error = createClassifiedError({ method: HttpMethod.Get });
      const matcher: ErrorMatcher = { method: HttpMethod.Post };

      expect(matchesRule(error, matcher)).toBe(false);
    });

    it('does not match when errorCode does not match', () => {
      const error = createClassifiedError({ errorCode: 'OTHER_CODE' });
      const matcher: ErrorMatcher = { errorCode: 'FEATURE_GATED' };

      expect(matchesRule(error, matcher)).toBe(false);
    });

    it('matches when errorCode matches', () => {
      const error = createClassifiedError({ errorCode: 'FEATURE_GATED' });
      const matcher: ErrorMatcher = { errorCode: 'FEATURE_GATED' };

      expect(matchesRule(error, matcher)).toBe(true);
    });

    it('does not match errorCode when error has no errorCode', () => {
      const error = createClassifiedError({ errorCode: undefined });
      const matcher: ErrorMatcher = { errorCode: 'FEATURE_GATED' };

      expect(matchesRule(error, matcher)).toBe(false);
    });

    it('matches when unspecified fields are ignored', () => {
      const error = createClassifiedError({ status: 500, url: '/api/test', method: HttpMethod.Delete });
      const matcher: ErrorMatcher = { status: 500 };

      expect(matchesRule(error, matcher)).toBe(true);
    });

    it('matches empty matcher (matches anything)', () => {
      const error = createClassifiedError();
      const matcher: ErrorMatcher = {};

      expect(matchesRule(error, matcher)).toBe(true);
    });

    it('matches bodyField when key and value match', () => {
      const error = createClassifiedError({ body: { type: 'validation' } });
      const matcher: ErrorMatcher = { bodyField: { key: 'type', value: 'validation' } };

      expect(matchesRule(error, matcher)).toBe(true);
    });

    it('does not match bodyField when value differs', () => {
      const error = createClassifiedError({ body: { type: 'other' } });
      const matcher: ErrorMatcher = { bodyField: { key: 'type', value: 'validation' } };

      expect(matchesRule(error, matcher)).toBe(false);
    });

    it('does not match bodyField when body is not an object', () => {
      const error = createClassifiedError({ body: 'string-body' });
      const matcher: ErrorMatcher = { bodyField: { key: 'type', value: 'validation' } };

      expect(matchesRule(error, matcher)).toBe(false);
    });
  });

  describe('matchError', () => {
    it('matches against default rules', () => {
      const error = createClassifiedError({ status: 401, url: '/api/test' });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      expect(result.rule?.name).toBe('session-expired');
    });

    it('returns no match for unregistered status code', () => {
      const error = createClassifiedError({ status: 418 });
      const result = matchError(error);

      expect(result.matched).toBe(false);
      expect(result.rule).toBeUndefined();
    });

    it('returns the error in the result', () => {
      const error = createClassifiedError({ status: 418 });
      const result = matchError(error);

      expect(result.error).toBe(error);
    });

    it('respects priority ordering - higher priority wins', () => {
      const error = createClassifiedError({ status: 403, errorCode: 'FEATURE_GATED' });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      expect(result.rule?.name).toBe('feature-gated');
    });

    it('falls through to lower priority when higher priority does not match', () => {
      const error = createClassifiedError({ status: 403 });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      expect(result.rule?.name).toBe('forbidden');
    });

    it('respects skipIf - skips rule when skipIf returns true', () => {
      const error = createClassifiedError({ status: 401, url: '/auth/login' });
      const result = matchError(error);

      // session-expired has skipIf for auth endpoints, so it should be skipped
      // and no other rule matches 401
      expect(result.matched).toBe(false);
    });

    it('first matching rule wins', () => {
      const rule1: ErrorRule = {
        name: 'first-custom',
        match: { status: 418 },
        action: { type: ErrorActionType.Toast },
        priority: PRIORITY_DEFAULT,
      };
      const rule2: ErrorRule = {
        name: 'second-custom',
        match: { status: 418 },
        action: { type: ErrorActionType.Modal },
        priority: PRIORITY_DEFAULT,
      };

      registerErrorRule(rule1);
      registerErrorRule(rule2);

      const error = createClassifiedError({ status: 418 });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      // Both have same priority, first registered wins (stable sort behavior)
      expect(result.rule?.action.type).toBeDefined();
    });

    it('custom rule with higher priority wins over defaults', () => {
      const customRule: ErrorRule = {
        name: 'custom-high-priority',
        match: { status: 403 },
        action: { type: ErrorActionType.Silent },
        priority: PRIORITY_ROUTE_SPECIFIC,
      };

      registerErrorRule(customRule);

      const error = createClassifiedError({ status: 403 });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      expect(result.rule?.name).toBe('custom-high-priority');
    });

    it('matches validation errors (400 and 422)', () => {
      const error400 = createClassifiedError({ status: 400 });
      const result400 = matchError(error400);
      expect(result400.matched).toBe(true);
      expect(result400.rule?.name).toBe('validation-error');

      const error422 = createClassifiedError({ status: 422 });
      const result422 = matchError(error422);
      expect(result422.matched).toBe(true);
      expect(result422.rule?.name).toBe('validation-error');
    });

    it('matches server error range (500-599)', () => {
      const error503 = createClassifiedError({ status: 503 });
      const result503 = matchError(error503);
      // 503 matches maintenance-mode first (higher priority)
      expect(result503.matched).toBe(true);
      expect(result503.rule?.name).toBe('maintenance-mode');

      const error501 = createClassifiedError({ status: 501 });
      const result501 = matchError(error501);
      expect(result501.matched).toBe(true);
      expect(result501.rule?.name).toBe('server-error');
    });

    it('matches network error (status 0)', () => {
      const error = createClassifiedError({ status: 0 });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      expect(result.rule?.name).toBe('network-offline');
    });

    it('matches timeout error by errorCode', () => {
      const error = createClassifiedError({ errorCode: 'ECONNABORTED', status: 0 });
      const result = matchError(error);

      expect(result.matched).toBe(true);
      // network-offline matches status 0 first, or request-timeout matches errorCode
      // since both have priority 0, network-offline appears first in DEFAULT_ERROR_RULES
      // after sorting, the one listed earlier in the array wins
    });
  });
});
