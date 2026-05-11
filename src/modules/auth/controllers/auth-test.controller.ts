import { Controller, Get } from '@nestjs/common';
import { Public, Roles } from 'nest-keycloak-connect';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { KeycloakUser } from '../interfaces/keycloak-user.interface';

@Controller('auth-test')
export class AuthTestController {
  @Get('public')
  @Public()
  getPublic() {
    return { message: 'This is a public endpoint' };
  }

  @Get('protected')
  getProtected(@CurrentUser() user: KeycloakUser) {
    return {
      message: 'This is a protected endpoint',
      user,
    };
  }

  @Get('admin-only')
  @Roles({ roles: ['admin'] })
  getAdminOnly(@CurrentUser() user: KeycloakUser) {
    return {
      message: 'This is an admin-only endpoint',
      user,
    };
  }

  @Get('supplier-only')
  @Roles({ roles: ['supplier'] })
  getSupplierOnly(@CurrentUser() user: KeycloakUser) {
    return {
      message: 'This is a supplier-only endpoint',
      user,
    };
  }
}
