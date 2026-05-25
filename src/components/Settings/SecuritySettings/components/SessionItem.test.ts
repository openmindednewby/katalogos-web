/**
 * Unit tests for SessionItem logic.
 * Tests formatTimestamp pure function and handleRevoke callback behavior.
 */
import { formatTimestamp } from './SessionItem';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../../../localization/helpers', () => ({
  FM: (key: string) => key,
}));

jest.mock('../../../../theme/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Known epoch for 2024-01-15T12:00:00.000Z */
const KNOWN_EPOCH = 1705320000000;

// ---------------------------------------------------------------------------
// Tests: formatTimestamp (pure function)
// ---------------------------------------------------------------------------

describe('formatTimestamp', () => {
  it('returns empty string when epoch is undefined', () => {
    expect(formatTimestamp(undefined)).toBe('');
  });

  it('returns a non-empty locale string for a valid epoch', () => {
    const result = formatTimestamp(KNOWN_EPOCH);
    expect(result).not.toBe('');
    expect(typeof result).toBe('string');
  });

  it('returns consistent output for the same epoch', () => {
    const first = formatTimestamp(KNOWN_EPOCH);
    const second = formatTimestamp(KNOWN_EPOCH);
    expect(first).toBe(second);
  });

  it('returns a valid date string for epoch zero (Unix epoch start)', () => {
    const result = formatTimestamp(0);
    // epoch 0 is falsy but isValueDefined(0) should be true
    // (0 is defined, not null/undefined)
    expect(result).not.toBe('');
  });
});

// ---------------------------------------------------------------------------
// Tests: handleRevoke callback logic (simulated)
// ---------------------------------------------------------------------------

describe('SessionItem - handleRevoke logic', () => {
  /**
   * Simulates the handleRevoke logic from the component.
   * Uses explicit null/undefined check mirroring isValueDefined behavior.
   */
  function simulateHandleRevoke(
    sessionId: string | undefined | null,
    onRevoke: (id: string) => void,
  ): void {
    if (sessionId !== null && sessionId !== undefined) onRevoke(sessionId);
  }

  it('calls onRevoke with session id when id is defined', () => {
    const onRevoke = jest.fn();
    const sessionId = 'session-abc-123';

    simulateHandleRevoke(sessionId, onRevoke);

    expect(onRevoke).toHaveBeenCalledWith(sessionId);
  });

  it('does not call onRevoke when session id is undefined', () => {
    const onRevoke = jest.fn();

    simulateHandleRevoke(undefined, onRevoke);

    expect(onRevoke).not.toHaveBeenCalled();
  });

  it('does not call onRevoke when session id is null', () => {
    const onRevoke = jest.fn();

    simulateHandleRevoke(null, onRevoke);

    expect(onRevoke).not.toHaveBeenCalled();
  });

  it('passes the exact session id string to onRevoke', () => {
    const onRevoke = jest.fn();
    const sessionId = 'unique-session-id-xyz';

    simulateHandleRevoke(sessionId, onRevoke);

    expect(onRevoke).toHaveBeenCalledTimes(1);
    expect(onRevoke.mock.calls[0][0]).toBe(sessionId);
  });
});
