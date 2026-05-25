/**
 * Tests verifying re-exports from @dloizides/utils work correctly.
 * Full implementation tests are in the @dloizides/utils package.
 */
import {
  isValueDefined,
  isNotEmptyArray,
  isNotEmptyString,
  isNullOrUndefined,
  isEmptyArray,
  isEmptyString,
} from './is';

describe('is.ts re-exports', () => {
  describe('isValueDefined', () => {
    it('should be exported and work correctly', () => {
      expect(isValueDefined(null)).toBe(false);
      expect(isValueDefined(undefined)).toBe(false);
      expect(isValueDefined(0)).toBe(true);
      expect(isValueDefined('')).toBe(true);
    });
  });

  describe('isNotEmptyArray', () => {
    it('should be exported and work correctly', () => {
      expect(isNotEmptyArray(null)).toBe(false);
      expect(isNotEmptyArray([])).toBe(false);
      expect(isNotEmptyArray([1])).toBe(true);
    });
  });

  describe('isNotEmptyString', () => {
    it('should be exported and work correctly', () => {
      expect(isNotEmptyString('')).toBe(false);
      expect(isNotEmptyString('  ')).toBe(false);
      expect(isNotEmptyString('hello')).toBe(true);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should be exported and work correctly', () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
      expect(isNullOrUndefined(0)).toBe(false);
    });
  });

  describe('isEmptyArray', () => {
    it('should be exported and work correctly', () => {
      expect(isEmptyArray([])).toBe(true);
      expect(isEmptyArray([1])).toBe(false);
    });
  });

  describe('isEmptyString', () => {
    it('should be exported and work correctly', () => {
      expect(isEmptyString('')).toBe(true);
      expect(isEmptyString('  ')).toBe(true);
      expect(isEmptyString('hello')).toBe(false);
    });
  });
});
