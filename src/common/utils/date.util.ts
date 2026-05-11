export class DateUtil {
  /**
   * Returns current timestamp in ISO format
   */
  static nowIso(): string {
    return new Date().toISOString();
  }

  /**
   * Adds days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Checks if a date is in the past
   */
  static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }
}
