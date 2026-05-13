import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    guard = new CustomThrottlerGuard({} as any, {} as any, {} as any);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should use API key as tracker if present', async () => {
      const req = {
        headers: { 'x-api-key': 'test-key' },
      };

      // @ts-expect-error - accessing protected method for testing
      const tracker = await guard.getTracker(req);
      expect(tracker).toBe('api-key:test-key');
    });

    it('should use user ID as tracker if JWT is present', async () => {
      const req = {
        user: { sub: 'user-123' },
        headers: {},
      };

      // @ts-expect-error - accessing protected method for testing
      const tracker = await guard.getTracker(req);
      expect(tracker).toBe('user:user-123');
    });

    it('should use IP as tracker if no auth info', async () => {
      const req = {
        ip: '127.0.0.1',
        headers: {},
      };

      // @ts-expect-error - accessing protected method for testing
      const tracker = await guard.getTracker(req);
      expect(tracker).toBe('ip:127.0.0.1');
    });
  });
});
