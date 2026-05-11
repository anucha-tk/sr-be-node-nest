import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { Roles } from 'nest-keycloak-connect';
import { ApiKey } from '@prisma/client';

@Controller('v1/auth/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @Roles({ roles: ['admin'] })
  async create(
    @Body() createDto: CreateApiKeyDto,
  ): Promise<{ success: boolean; data: Partial<ApiKey> & { key: string } }> {
    const result = await this.apiKeyService.createKey(
      createDto.name,
      createDto.scopes,
    );

    // Explicitly exclude sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { keyHash: _k, salt: _s, ...metadata } = result;

    return {
      success: true,
      data: metadata,
    };
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  async revoke(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: { id: string } }> {
    await this.apiKeyService.revokeKey(id);
    return {
      success: true,
      data: { id },
    };
  }
}
