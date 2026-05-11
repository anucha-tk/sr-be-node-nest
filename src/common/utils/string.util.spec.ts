import { StringUtil } from './string.util';

describe('StringUtil', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(StringUtil.capitalize('test')).toBe('Test');
    });

    it('should return empty string for null/empty', () => {
      expect(StringUtil.capitalize('')).toBe('');
    });
  });

  describe('isEmail', () => {
    it('should return true for valid email', () => {
      expect(StringUtil.isEmail('test@example.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(StringUtil.isEmail('test')).toBe(false);
      expect(StringUtil.isEmail('')).toBe(false);
    });
  });

  describe('truncate', () => {
    it('should truncate long string', () => {
      expect(StringUtil.truncate('hello world', 5)).toBe('hello...');
    });

    it('should not truncate short string', () => {
      expect(StringUtil.truncate('hello', 10)).toBe('hello');
    });

    it('should handle empty input', () => {
      expect(StringUtil.truncate('', 5)).toBe('');
    });
  });
});
