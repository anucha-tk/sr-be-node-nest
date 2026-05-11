import { DateUtil } from './date.util';

describe('DateUtil', () => {
  describe('nowIso', () => {
    it('should return a valid ISO string', () => {
      const iso = DateUtil.nowIso();
      expect(new Date(iso).toISOString()).toBe(iso);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      const base = new Date('2024-01-01T00:00:00Z');
      const result = DateUtil.addDays(base, 10);
      expect(result.toISOString()).toBe('2024-01-11T00:00:00.000Z');
    });

    it('should subtract days if negative', () => {
      const base = new Date('2024-01-11T00:00:00Z');
      const result = DateUtil.addDays(base, -10);
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const past = new Date(Date.now() - 1000);
      expect(DateUtil.isPast(past)).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date(Date.now() + 100000);
      expect(DateUtil.isPast(future)).toBe(false);
    });
  });
});
