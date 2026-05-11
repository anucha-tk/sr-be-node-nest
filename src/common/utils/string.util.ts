export class StringUtil {
  /**
   * Capitalizes the first letter of a string
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Checks if a string is a valid email (simple check)
   */
  static isEmail(str: string): boolean {
    if (!str) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Truncates a string with ellipsis
   */
  static truncate(str: string, length: number): string {
    if (!str || str.length <= length) return str || '';
    return str.slice(0, length) + '...';
  }
}
