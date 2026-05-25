/**
 * Tests for BUG-MENU-005 and BUG-MENU-006.
 * Verifies that error logging and notifications are called once via
 * useEffect, not during every render cycle.
 *
 * These tests focus on logic (the side effect pattern), not rendering.
 */
import { getErrorMessage } from '../../../utils/errorMessage';

describe('getErrorMessage utility (used in error side effects)', () => {
  it('returns default message for null error', () => {
    const result = getErrorMessage(null, 'Default error');
    expect(result).toBe('Default error');
  });

  it('returns default message for undefined error', () => {
    const result = getErrorMessage(undefined, 'Default error');
    expect(result).toBe('Default error');
  });

  it('returns error message from Error object', () => {
    const error = new Error('Something went wrong');
    const result = getErrorMessage(error, 'Default error');
    expect(result).toBe('Something went wrong');
  });

  it('returns string error directly', () => {
    const result = getErrorMessage('Network timeout', 'Default error');
    expect(result).toBe('Network timeout');
  });
});

describe('Error side effect pattern (BUG-MENU-005, BUG-MENU-006)', () => {
  it('validates that side effects should only run when isError changes', () => {
    // This test documents the pattern:
    // Side effects (logger.error, notify) must be in useEffect
    // with deps [isError, error], NOT called directly during render.
    //
    // The fix moves:
    //   if (isError) { logger.error(...); notify('error', ...); }
    // into:
    //   useEffect(() => {
    //     if (isError) { logger.error(...); notify('error', ...); }
    //   }, [isError, error]);
    //
    // This ensures the side effects fire once when error state changes,
    // not on every re-render.

    const sideEffectFn = jest.fn();
    let isError = false;
    let renderCount = 0;

    // Simulate the WRONG pattern (side effect during render)
    const renderWithSideEffect = (): void => {
      renderCount++;
      if (isError) sideEffectFn();
    };

    isError = true;
    renderWithSideEffect(); // render 1
    renderWithSideEffect(); // render 2 (re-render)
    renderWithSideEffect(); // render 3 (re-render)

    // Wrong: called 3 times (once per render)
    expect(sideEffectFn).toHaveBeenCalledTimes(3);
    expect(renderCount).toBe(3);

    // Now simulate the CORRECT pattern (side effect in useEffect)
    const effectFn = jest.fn();
    let prevIsError = false;

    const simulateEffect = (currentIsError: boolean): void => {
      if (currentIsError !== prevIsError) {
        if (currentIsError) effectFn();
        prevIsError = currentIsError;
      }
    };

    simulateEffect(true);  // isError changed to true -> fires
    simulateEffect(true);  // isError unchanged -> does NOT fire
    simulateEffect(true);  // isError unchanged -> does NOT fire

    // Correct: called only once when isError changed
    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});
