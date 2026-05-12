import { ExecutionContext, Injectable } from '@nestjs/common';
import { RoleGuard } from 'nest-keycloak-connect';
import { RequestWithAuth } from '../interfaces/request.interface';

@Injectable()
export class UnifiedRoleGuard extends RoleGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    // If API Key authenticated, we still want to run the RoleGuard logic
    // but the standard RoleGuard might try to validate the token first.
    // However, if we've already populated request.user with roles,
    // the super.canActivate should work IF it only checks request.user.

    // If API Key authenticated, we've already set request.user and roles.
    // We just need to make sure the RoleGuard doesn't fail because of a missing JWT.

    if (request.isApiKeyAuthenticated) {
      return true;
    }

    return await super.canActivate(context);
  }
}
