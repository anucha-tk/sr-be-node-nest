import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { Roles } from 'nest-keycloak-connect';
import { ApiKey } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiStandardResponse } from '../../../common/docs/api-response.decorator';
import {
  ApiKeyResponseDto,
  ApiKeyRevokeResponseDto,
} from '../dto/api-key-response.dto';

@ApiTags('Auth')
@Controller('v1/auth/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiStandardResponse(ApiKeyResponseDto)
  async create(
    @Body() createDto: CreateApiKeyDto,
  ): Promise<Partial<ApiKey> & { key: string }> {
    const result = await this.apiKeyService.createKey(
      createDto.name,
      createDto.scopes,
      createDto.supplierId,
    );

    // Explicitly exclude sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { keyHash: _k, salt: _s, ...metadata } = result;

    return metadata;
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiStandardResponse(ApiKeyRevokeResponseDto)
  async revoke(@Param('id') id: string): Promise<{ id: string }> {
    await this.apiKeyService.revokeKey(id);
    return { id };
  }
}
