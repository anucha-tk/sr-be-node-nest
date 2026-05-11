import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../../modules/auth/services/api-key.service';
import { Request } from 'express';
import { API_SCOPES_KEY } from '../decorators/api-scopes.decorator';
import { ApiKey } from '@prisma/client';

interface RequestWithAuth extends Request {
  apiKey?: ApiKey;
  user?: any;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    // Robust header extraction
    const rawApiKey =
      request.headers['x-api-key'] || request.headers['X-API-KEY'];
    const apiKey = Array.isArray(rawApiKey)
      ? rawApiKey[0]
      : (rawApiKey as string);

    if (!apiKey) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'ERR_MISSING_API_KEY',
          message: 'API key is required in x-api-key header',
        },
      });
    }

    const keyRecord = await this.apiKeyService.validateKey(apiKey);

    // AC3: Scope Authorization
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      API_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredScopes && requiredScopes.length > 0) {
      const hasScope = requiredScopes.every((scope) =>
        keyRecord.scopes.includes(scope),
      );
      if (!hasScope) {
        throw new ForbiddenException({
          success: false,
          error: {
            code: 'ERR_INSUFFICIENT_SCOPES',
            message: `Key lacks required scopes: ${requiredScopes.join(', ')}`,
          },
        });
      }
    }

    // Attach to request for downstream use
    request.apiKey = keyRecord;

    // RBAC Compatibility: Populate request.user so @Roles() works
    // We map scopes to roles for consistency with nest-keycloak-connect
    request.user = {
      sub: `apikey:${keyRecord.id}`,
      name: keyRecord.name,
      roles: keyRecord.scopes, // Map scopes to roles
      realm_access: { roles: keyRecord.scopes },
      resource_access: {},
    };

    return true;
  }
}
