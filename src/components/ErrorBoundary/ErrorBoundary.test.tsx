/**
 * Unit tests for ErrorBoundary — the chunk-load auto-recovery path (UX Move 3).
 *
 * The high-value assertion: when a child throws a REAL `ChunkLoadError` (a stale
 * hashed chunk 404'd after a deploy — the P0-01 failure mode), the boundary must
 * auto-recover (one guarded reload) rather than dead-end on the error screen, and
 * must NOT loop once the one-shot guard is spent (it shows a manual Reload then).
 */
import React from 'react';

import { View } from 'react-native';

import { render } from '@testing-library/react-native';

import { ErrorBoundary } from './ErrorBoundary';

// Keep the REAL detection predicate so we genuinely force a ChunkLoadError, but
// make the reload side effects observable + safe (no jsdom navigation).
const mockAttemptChunkRecovery = jest.fn();
const mockReloadPage = jest.fn();
const mockClearFlag = jest.fn();
jest.mock('@dloizides/utils', () => {
  const actual = jest.requireActual('@dloizides/utils');
  return {
    __esModule: true,
    ...actual,
    attemptChunkRecovery: (): boolean => mockAttemptChunkRecovery(),
    reloadPage: (): void => mockReloadPage(),
    clearChunkRecoveryFlag: (): void => mockClearFlag(),
  };
});

jest.mock('../../lib/logging', () => ({
  loggingService: { fatal: jest.fn() },
}));
jest.mock('../../lib/monitoring', () => ({
  captureException: jest.fn(),
}));
jest.mock('../../localization/helpers', () => ({
  FM: (key: string): string => key,
}));

const RELOAD_TEST_ID = 'error-boundary-reload-button';
const RETRY_TEST_ID = 'error-boundary-retry-button';
const UPDATING_TEST_ID = 'error-boundary-updating';

const ChunkThrower = (): React.ReactElement => {
  throw Object.assign(new Error('Loading chunk _layout-abc123 failed'), {
    name: 'ChunkLoadError',
  });
};

const PlainThrower = (): React.ReactElement => {
  throw new Error('Cannot read properties of undefined (reading x)');
};

const Ok = (): React.ReactElement => <View testID="ok-child" />;

describe('ErrorBoundary chunk-load auto-recovery', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence the expected React error-boundary console noise.
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('auto-recovers (shows the updating state) when a chunk error is caught and the guard is fresh', () => {
    mockAttemptChunkRecovery.mockReturnValue(true);

    const { queryByTestId } = render(
      <ErrorBoundary>
        <ChunkThrower />
      </ErrorBoundary>,
    );

    expect(mockAttemptChunkRecovery).toHaveBeenCalledTimes(1);
    expect(queryByTestId(UPDATING_TEST_ID)).not.toBeNull();
    // Not the dead-end error screen.
    expect(queryByTestId(RETRY_TEST_ID)).toBeNull();
  });

  it('does NOT loop: when the guard is spent it shows a manual Reload (chunk error hides Try Again)', () => {
    mockAttemptChunkRecovery.mockReturnValue(false);

    const { queryByTestId } = render(
      <ErrorBoundary>
        <ChunkThrower />
      </ErrorBoundary>,
    );

    expect(mockAttemptChunkRecovery).toHaveBeenCalledTimes(1);
    expect(queryByTestId(UPDATING_TEST_ID)).toBeNull();
    expect(queryByTestId(RELOAD_TEST_ID)).not.toBeNull();
    // Try Again is useless for a stale chunk, so it is hidden.
    expect(queryByTestId(RETRY_TEST_ID)).toBeNull();
  });

  it('ordinary (non-chunk) errors skip auto-recovery and show both Reload and Try Again', () => {
    const { queryByTestId } = render(
      <ErrorBoundary>
        <PlainThrower />
      </ErrorBoundary>,
    );

    expect(mockAttemptChunkRecovery).not.toHaveBeenCalled();
    expect(queryByTestId(RELOAD_TEST_ID)).not.toBeNull();
    expect(queryByTestId(RETRY_TEST_ID)).not.toBeNull();
  });

  it('a clean mount releases the one-shot guard so a future deploy can auto-recover', () => {
    render(
      <ErrorBoundary>
        <Ok />
      </ErrorBoundary>,
    );

    expect(mockClearFlag).toHaveBeenCalledTimes(1);
    expect(mockAttemptChunkRecovery).not.toHaveBeenCalled();
  });
});
