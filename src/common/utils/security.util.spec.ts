import { SecurityUtil } from './security.util';

describe('SecurityUtil', () => {
  describe('hashWithSalt', () => {
    it('should hash a string with salt correctly', () => {
      const data = 'password123';
      const salt = 'randomSalt';
      const hash1 = SecurityUtil.hashWithSalt(data, salt);
      const hash2 = SecurityUtil.hashWithSalt(data, salt);

      expect(hash1).toBeDefined();
      expect(hash1).toHaveLength(64); // SHA-256 hex
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different salts', () => {
      const data = 'password123';
      const hash1 = SecurityUtil.hashWithSalt(data, 'salt1');
      const hash2 = SecurityUtil.hashWithSalt(data, 'salt2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateSalt', () => {
    it('should generate a salt of correct length', () => {
      const salt = SecurityUtil.generateSalt(16);
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it('should generate different salts', () => {
      const salt1 = SecurityUtil.generateSalt();
      const salt2 = SecurityUtil.generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('generatePlainKey', () => {
    it('should generate a key of correct length', () => {
      const key = SecurityUtil.generatePlainKey(32);
      expect(key).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate different keys', () => {
      const key1 = SecurityUtil.generatePlainKey();
      const key2 = SecurityUtil.generatePlainKey();
      expect(key1).not.toBe(key2);
    });
  });
});
