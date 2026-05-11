import * as crypto from 'crypto';

export class SecurityUtil {
  /**
   * Hashes a string with a provided salt using SHA-256
   */
  static hashWithSalt(data: string, salt: string): string {
    return crypto
      .createHash('sha256')
      .update(data + salt)
      .digest('hex');
  }

  /**
   * Generates a random salt
   */
  static generateSalt(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generates a random plain text API key
   */
  static generatePlainKey(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
