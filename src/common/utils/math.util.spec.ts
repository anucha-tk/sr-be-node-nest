import { MathUtil } from './math.util';

describe('MathUtil', () => {
  describe('randomInt', () => {
    it('should generate a number within range', () => {
      const val = MathUtil.randomInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    });
  });

  describe('round', () => {
    it('should round correctly', () => {
      expect(MathUtil.round(1.2345, 2)).toBe(1.23);
      expect(MathUtil.round(1.235, 2)).toBe(1.24);
    });
  });

  describe('percentage', () => {
    it('should calculate percentage correctly', () => {
      expect(MathUtil.percentage(50, 200)).toBe(25);
    });

    it('should handle zero total', () => {
      expect(MathUtil.percentage(50, 0)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp value correctly', () => {
      expect(MathUtil.clamp(15, 0, 10)).toBe(10);
      expect(MathUtil.clamp(-5, 0, 10)).toBe(0);
      expect(MathUtil.clamp(5, 0, 10)).toBe(5);
    });
  });
});
