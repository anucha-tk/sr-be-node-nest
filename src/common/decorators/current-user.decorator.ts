/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KeycloakUser } from '../../modules/auth/interfaces/keycloak-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as KeycloakUser | undefined;
    if (!user) {
      return null;
    }

    return {
      ...user,
      sub: user.sub,
      preferred_username: user.preferred_username,
      roles: user.realm_access?.roles || [],
    };
  },
);
