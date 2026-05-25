/**
 * Tests for menu error handling utilities.
 */
import { getErrorMessage, getHttpStatus, isDuplicateNameError } from './menuErrorUtils';

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(getErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong');
  });

  it('returns string directly', () => {
    expect(getErrorMessage('plain error')).toBe('plain error');
  });

  it('extracts message from object with message property', () => {
    expect(getErrorMessage({ message: 'object error' })).toBe('object error');
  });

  it('returns fallback for unknown error shape', () => {
    expect(getErrorMessage(42)).toBe('Error loading menus');
  });

  it('returns fallback for null', () => {
    expect(getErrorMessage(null)).toBe('Error loading menus');
  });
});

describe('getHttpStatus', () => {
  it('returns status from axios-like error', () => {
    expect(getHttpStatus({ response: { status: 409 } })).toBe(409);
  });

  it('returns undefined for plain Error', () => {
    expect(getHttpStatus(new Error('fail'))).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(getHttpStatus(null)).toBeUndefined();
  });

  it('returns undefined when response has no status', () => {
    expect(getHttpStatus({ response: {} })).toBeUndefined();
  });
});

describe('isDuplicateNameError', () => {
  it('returns true for 409 status', () => {
    expect(isDuplicateNameError({ response: { status: 409 } })).toBe(true);
  });

  it('returns false for 400 status', () => {
    expect(isDuplicateNameError({ response: { status: 400 } })).toBe(false);
  });

  it('returns false for plain Error', () => {
    expect(isDuplicateNameError(new Error('fail'))).toBe(false);
  });

  it('returns false for string error', () => {
    expect(isDuplicateNameError('error')).toBe(false);
  });
});
