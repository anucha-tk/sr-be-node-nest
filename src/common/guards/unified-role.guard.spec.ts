import { ExecutionContext } from '@nestjs/common';
import { UnifiedRoleGuard } from './unified-role.guard';

describe('UnifiedRoleGuard', () => {
  let guard: UnifiedRoleGuard;

  beforeEach(() => {
    // @ts-expect-error - testing constructor
    guard = new UnifiedRoleGuard();
    jest
      .spyOn(Object.getPrototypeOf(UnifiedRoleGuard.prototype), 'canActivate')
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
      .spyOn(Object.getPrototypeOf(UnifiedRoleGuard.prototype), 'canActivate')
      .mockResolvedValue(true);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(superSpy).toHaveBeenCalledWith(context);
  });
});
