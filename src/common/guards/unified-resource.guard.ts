import { ExecutionContext, Injectable } from '@nestjs/common';
import { ResourceGuard } from 'nest-keycloak-connect';
import { RequestWithAuth } from '../interfaces/request.interface';

@Injectable()
export class UnifiedResourceGuard extends ResourceGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    if (request.isApiKeyAuthenticated) {
      return true; // Skip resource guard for API Key for now, or implement similar logic
    }

    return await super.canActivate(context);
  }
}
