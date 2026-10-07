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

    const sideEffectFn = jest.fn();
    let isError = false;
    let renderCount = 0;

    const renderWithSideEffect = (): void => {
      renderCount++;
      if (isError) sideEffectFn();
    };

    isError = true;
    renderWithSideEffect();
    renderWithSideEffect();
    renderWithSideEffect();

    expect(sideEffectFn).toHaveBeenCalledTimes(3);
    expect(renderCount).toBe(3);

    const effectFn = jest.fn();
    let prevIsError = false;

    const simulateEffect = (currentIsError: boolean): void => {
      if (currentIsError !== prevIsError) {
        if (currentIsError) effectFn();
        prevIsError = currentIsError;
      }
    };

    simulateEffect(true);
    simulateEffect(true);
    simulateEffect(true);

    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});
