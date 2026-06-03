import React from 'react';

import { renderHook, type RenderHookResult } from '@testing-library/react-native';

import { useFeatureFlag, useFeatureFlagValue } from './useFeatureFlag';
import { AnalyticsContext } from '../components/AnalyticsProvider';

import type { AnalyticsClient, FeatureFlagValue } from '../types';

function createMockClient(
  getFeatureFlagImpl?: (key: string) => FeatureFlagValue,
): AnalyticsClient {
  return {
    track: jest.fn(),
    identify: jest.fn(),
    page: jest.fn(),
    reset: jest.fn(),
    getFeatureFlag: getFeatureFlagImpl,
  };
}

function renderWithClient<T>(
  client: AnalyticsClient,
  hook: () => T,
): RenderHookResult<T, unknown> {
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>
  );
  return renderHook(hook, { wrapper });
}

describe('useFeatureFlag', () => {
  it('returns false when client has no getFeatureFlag method', () => {
    const client: AnalyticsClient = {
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
      reset: jest.fn(),
    };
    const { result } = renderWithClient(client, () => useFeatureFlag('test-flag'));

    expect(result.current).toBe(false);
  });

  it('returns true when the flag is enabled', () => {
    const client = createMockClient(() => true);
    const { result } = renderWithClient(client, () => useFeatureFlag('beta-feature'));

    expect(result.current).toBe(true);
  });

  it('returns false when the flag is disabled', () => {
    const client = createMockClient(() => false);
    const { result } = renderWithClient(client, () => useFeatureFlag('beta-feature'));

    expect(result.current).toBe(false);
  });

  it('returns false when the flag returns a string variant', () => {
    const client = createMockClient(() => 'variant-a');
    const { result } = renderWithClient(client, () => useFeatureFlag('multivariate-flag'));

    expect(result.current).toBe(false);
  });

  it('returns false when the flag returns undefined', () => {
    const client = createMockClient(() => undefined);
    const { result } = renderWithClient(client, () => useFeatureFlag('unknown-flag'));

    expect(result.current).toBe(false);
  });
});

describe('useFeatureFlagValue', () => {
  it('returns undefined when client has no getFeatureFlag method', () => {
    const client: AnalyticsClient = {
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
      reset: jest.fn(),
    };
    const { result } = renderWithClient(client, () => useFeatureFlagValue('test-flag'));

    expect(result.current).toBeUndefined();
  });

  it('returns true for an enabled boolean flag', () => {
    const client = createMockClient(() => true);
    const { result } = renderWithClient(client, () => useFeatureFlagValue('beta-feature'));

    expect(result.current).toBe(true);
  });

  it('returns false for a disabled boolean flag', () => {
    const client = createMockClient(() => false);
    const { result } = renderWithClient(client, () => useFeatureFlagValue('beta-feature'));

    expect(result.current).toBe(false);
  });

  it('returns the string variant for a multivariate flag', () => {
    const client = createMockClient(() => 'variant-b');
    const { result } = renderWithClient(client, () => useFeatureFlagValue('button-color'));

    expect(result.current).toBe('variant-b');
  });

  it('returns undefined when the flag is not found', () => {
    const client = createMockClient(() => undefined);
    const { result } = renderWithClient(client, () => useFeatureFlagValue('missing-flag'));

    expect(result.current).toBeUndefined();
  });
});
