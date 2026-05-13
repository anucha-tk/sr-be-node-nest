import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../../modules/auth/services/api-key.service';
import { API_SCOPES_KEY } from '../decorators/api-scopes.decorator';
import { RequestWithAuth } from '../interfaces/request.interface';

interface KeycloakRoles {
  roles: string[];
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
      return true; // Proceed to other guards (like Keycloak)
    }

    const keyRecord = await this.apiKeyService.validateKey(apiKey);

    // AC3: Scope Authorization (Support both custom scopes and Keycloak roles)
    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(API_SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const keycloakRoles = this.reflector.getAllAndOverride<KeycloakRoles>(
      'roles', // This is the key used by nest-keycloak-connect
      [context.getHandler(), context.getClass()],
    );
    const requiredRoles = keycloakRoles?.roles || [];

    const allRequired = [...new Set([...requiredScopes, ...requiredRoles])];

    if (allRequired.length > 0) {
      const hasPermission = allRequired.every((scope) =>
        keyRecord.scopes.includes(scope),
      );
      if (!hasPermission) {
        throw new ForbiddenException({
          success: false,
          error: {
            code: 'ERR_INSUFFICIENT_PERMISSIONS',
            message: `Key lacks required permissions: ${allRequired.join(', ')}`,
          },
        });
      }
    }

    // Attach to request for downstream use
    request.apiKey = keyRecord;
    request.isApiKeyAuthenticated = true;

    // RBAC Compatibility: Populate request.user so @Roles() works
    // We map scopes to roles for consistency with nest-keycloak-connect
    request.user = {
      // Priority: Associated supplierId > API key identity
      sub: keyRecord.supplierId || `apikey:${keyRecord.id}`,
      name: keyRecord.name,
      roles: keyRecord.scopes, // Map scopes to roles
      realm_access: { roles: keyRecord.scopes },
      resource_access: {},
    };

    return true;
  }
}
