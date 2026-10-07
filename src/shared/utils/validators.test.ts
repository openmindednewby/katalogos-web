import { isNotEmptyString, isValueDefined } from './validators';

describe('shared/utils/validators re-exports', () => {
  describe('isNotEmptyString', () => {
    it('should be exported and work correctly', () => {
      expect(isNotEmptyString('a')).toBe(true);
      expect(isNotEmptyString('  a  ')).toBe(true);
      expect(isNotEmptyString('')).toBe(false);
      expect(isNotEmptyString('   ')).toBe(false);
    });
  });

  describe('isValueDefined', () => {
    it('should be exported and work correctly', () => {
      expect(isValueDefined(undefined)).toBe(false);
      expect(isValueDefined(null)).toBe(false);
      expect(isValueDefined(0)).toBe(true);
      expect(isValueDefined('')).toBe(true);
    });
  });
});
