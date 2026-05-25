import {
  getErrorRules,
  registerErrorRule,
  resetErrorRules,
  DEFAULT_ERROR_RULES,
  isAuthEndpoint,
  PRIORITY_ROUTE_SPECIFIC,
  PRIORITY_DEFAULT,
} from './errorRegistry';
import { ErrorActionType, ErrorSeverity } from './errorTypes';

import type { ErrorRule } from './errorTypes';

describe('errorRegistry', () => {
  afterEach(() => {
    resetErrorRules();
  });

  describe('getErrorRules', () => {
    it('returns default rules sorted by priority descending', () => {
      const rules = getErrorRules();
      expect(rules.length).toBeGreaterThan(0);

      for (let i = 1; i < rules.length; i++) {
        const prevPriority = rules[i - 1]?.priority ?? PRIORITY_DEFAULT;
        const currPriority = rules[i]?.priority ?? PRIORITY_DEFAULT;
        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
    });

    it('contains all default rules', () => {
      const rules = getErrorRules();
      expect(rules.length).toBe(DEFAULT_ERROR_RULES.length);

      const ruleNames = rules.map((r) => r.name);
      for (const defaultRule of DEFAULT_ERROR_RULES)
        expect(ruleNames).toContain(defaultRule.name);
    });
  });

  describe('registerErrorRule', () => {
    it('adds a new rule to the registry', () => {
      const customRule: ErrorRule = {
        name: 'custom-test-rule',
        match: { status: 418 },
        action: { type: ErrorActionType.Toast, severity: ErrorSeverity.Info },
        messageKey: 'errors.teapot',
        priority: PRIORITY_DEFAULT,
      };

      registerErrorRule(customRule);
      const rules = getErrorRules();

      const found = rules.find((r) => r.name === 'custom-test-rule');
      expect(found).toBeDefined();
      expect(rules.length).toBe(DEFAULT_ERROR_RULES.length + 1);
    });

    it('sorts custom rule by priority after registration', () => {
      const highPriorityRule: ErrorRule = {
        name: 'high-priority-rule',
        match: { status: 418 },
        action: { type: ErrorActionType.Toast },
        priority: PRIORITY_ROUTE_SPECIFIC,
      };

      registerErrorRule(highPriorityRule);
      const rules = getErrorRules();

      expect(rules[0]?.name).toBe('high-priority-rule');
    });

    it('handles duplicate rule names gracefully', () => {
      const rule1: ErrorRule = {
        name: 'duplicate-name',
        match: { status: 418 },
        action: { type: ErrorActionType.Toast },
        priority: PRIORITY_DEFAULT,
      };
      const rule2: ErrorRule = {
        name: 'duplicate-name',
        match: { status: 419 },
        action: { type: ErrorActionType.Modal },
        priority: PRIORITY_DEFAULT,
      };

      registerErrorRule(rule1);
      registerErrorRule(rule2);
      const rules = getErrorRules();

      const duplicates = rules.filter((r) => r.name === 'duplicate-name');
      expect(duplicates.length).toBe(2);
    });
  });

  describe('resetErrorRules', () => {
    it('restores the default rules after custom rules were added', () => {
      const customRule: ErrorRule = {
        name: 'temporary-rule',
        match: { status: 418 },
        action: { type: ErrorActionType.Toast },
      };

      registerErrorRule(customRule);
      expect(getErrorRules().length).toBe(DEFAULT_ERROR_RULES.length + 1);

      resetErrorRules();
      expect(getErrorRules().length).toBe(DEFAULT_ERROR_RULES.length);

      const found = getErrorRules().find((r) => r.name === 'temporary-rule');
      expect(found).toBeUndefined();
    });
  });

  describe('isAuthEndpoint', () => {
    it('returns true for login endpoint', () => {
      expect(isAuthEndpoint('/auth/login')).toBe(true);
    });

    it('returns true for refresh endpoint', () => {
      expect(isAuthEndpoint('/auth/refresh')).toBe(true);
    });

    it('returns true for verify-otp endpoint', () => {
      expect(isAuthEndpoint('/auth/verify-otp')).toBe(true);
    });

    it('returns true for openid-connect token endpoint', () => {
      expect(isAuthEndpoint('/protocol/openid-connect/token')).toBe(true);
    });

    it('returns true when auth pattern is part of a larger URL', () => {
      expect(isAuthEndpoint('https://api.example.com/auth/login')).toBe(true);
    });

    it('returns false for non-auth endpoints', () => {
      expect(isAuthEndpoint('/api/templates')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isAuthEndpoint('')).toBe(false);
    });
  });
});
