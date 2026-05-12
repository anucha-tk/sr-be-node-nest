import { ExecutionContext } from '@nestjs/common';
import { UnifiedAuthGuard } from './unified-auth.guard';

describe('UnifiedAuthGuard', () => {
  let guard: UnifiedAuthGuard;

  beforeEach(() => {
    // @ts-expect-error - testing constructor
    guard = new UnifiedAuthGuard();
    // We need to mock super.canActivate if we don't return early
    jest
      .spyOn(Object.getPrototypeOf(UnifiedAuthGuard.prototype), 'canActivate')
      .mockResolvedValue(true);
  });

  it('should return true if API Key is authenticated', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ isApiKeyAuthenticated: true }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should call super.canActivate if API Key is not authenticated', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ isApiKeyAuthenticated: false }),
      }),
    } as unknown as ExecutionContext;

    const superSpy = jest
      .spyOn(Object.getPrototypeOf(UnifiedAuthGuard.prototype), 'canActivate')
      .mockResolvedValue(true);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(superSpy).toHaveBeenCalledWith(context);
  });
});
