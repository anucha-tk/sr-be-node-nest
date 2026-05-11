import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public, Roles } from 'nest-keycloak-connect';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { KeycloakUser } from '../interfaces/keycloak-user.interface';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { ApiStandardResponse } from '../../../common/docs/api-response.decorator';
import {
  AuthTestResponseDto,
  MessageResponseDto,
} from '../dto/auth-test-response.dto';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

@ApiTags('Test')
@Controller('auth-test')
export class AuthTestController {
  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Public test endpoint' })
  @ApiStandardResponse(MessageResponseDto)
  getPublic() {
    return { message: 'This is a public endpoint' };
  }

  @Get('protected')
  @ApiSecurity('bearer')
  @ApiOperation({ summary: 'Protected test endpoint (JWT)' })
  @ApiStandardResponse(AuthTestResponseDto)
  getProtected(@CurrentUser() user: KeycloakUser) {
    return {
      message: 'This is a protected endpoint',
      user,
    };
  }

  @Get('admin-only')
  @ApiSecurity('bearer')
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Admin-only test endpoint' })
  @ApiStandardResponse(AuthTestResponseDto)
  getAdminOnly(@CurrentUser() user: KeycloakUser) {
    return {
      message: 'This is an admin-only endpoint',
      user,
    };
  }

  @Get('supplier-only')
  @ApiSecurity('bearer')
  @Roles({ roles: ['supplier'] })
  @ApiOperation({ summary: 'Supplier-only test endpoint' })
  @ApiStandardResponse(AuthTestResponseDto)
  getSupplierOnly(@CurrentUser() user: KeycloakUser) {
    return {
      message: 'This is a supplier-only endpoint',
      user,
    };
  }

  @Get('api-key-protected')
  @ApiSecurity('api-key')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'API Key protected test endpoint' })
  @ApiStandardResponse(MessageResponseDto)
  getApiKeyProtected() {
    return { message: 'This endpoint is protected by API Key' };
  }
}
