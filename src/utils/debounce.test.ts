/**
 * Tests for debounce and throttle utilities.
 */
import { debounce, throttle } from './debounce';

// Use fake timers for precise control
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('debounce', () => {
  it('should call the function after the wait period', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should only call once when invoked multiple times within wait period', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer on each call', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    jest.advanceTimersByTime(200);
    expect(mockFn).not.toHaveBeenCalled();

    debouncedFn(); // Reset the timer
    jest.advanceTimersByTime(200);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the function', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(300);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should use the last arguments when called multiple times', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    jest.advanceTimersByTime(300);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should use default wait time of 300ms', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn);

    debouncedFn();

    jest.advanceTimersByTime(299);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  it('should call immediately on first invocation', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should not call again within the wait period', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call with last args at the end of wait period when invoked during wait', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn('first');
    expect(mockFn).toHaveBeenCalledWith('first');

    throttledFn('second');
    throttledFn('third');

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('third');
  });

  it('should allow new calls after wait period expires', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should use default wait time of 300ms', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments correctly on immediate call', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn('arg1', 'arg2');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
