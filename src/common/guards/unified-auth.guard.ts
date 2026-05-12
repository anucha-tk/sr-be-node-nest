import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from 'nest-keycloak-connect';
import { RequestWithAuth } from '../interfaces/request.interface';

@Injectable()
export class UnifiedAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    // 1. If API Key authenticated in the previous guard, skip Keycloak check
    if (request.isApiKeyAuthenticated) {
      return true;
    }

    // 2. Otherwise, use the standard Keycloak AuthGuard
    return await super.canActivate(context);
  }
}
