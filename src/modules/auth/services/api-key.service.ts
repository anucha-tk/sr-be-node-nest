import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ApiKey } from '@prisma/client';
import { SecurityUtil } from '../../../common/utils/security.util';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async validateKey(apiKey: string): Promise<ApiKey> {
    // Note: Since we use salted hashes, we can't find by hash alone without knowing the salt.
    // However, if we want high performance, we might need a two-step process or a different indexing strategy.
    // For now, to keep it secure, we'll assume the key might have a prefix or we find by a different identifier.
    // BUT the current design stores keyHash as unique. This implies we need the salt to be part of the lookup or
    // we use a non-salted hash for lookup and salted for verification (riskier).
    // BETTER: Store an 'id' or 'keyId' prefix in the plain key: `id.plainKey`.

    const [id, plainKey] = apiKey.includes('.')
      ? apiKey.split('.')
      : [null, apiKey];

    if (!id) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'ERR_INVALID_API_KEY_FORMAT',
          message: 'Invalid API key format. Expected id.key',
        },
      });
    }

    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!keyRecord) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'ERR_INVALID_API_KEY',
          message: 'Invalid API key provided',
        },
      });
    }

    const hash = SecurityUtil.hashWithSalt(plainKey, keyRecord.salt ?? '');
    if (hash !== keyRecord.keyHash) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'ERR_INVALID_API_KEY',
          message: 'Invalid API key provided',
        },
      });
    }

    if (!keyRecord.isActive || keyRecord.revokedAt) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'ERR_API_KEY_INACTIVE',
          message: 'API key is deactivated or revoked',
        },
      });
    }

    return keyRecord;
  }

  async createKey(
    name: string,
    scopes: string[],
  ): Promise<ApiKey & { key: string }> {
    const existing = await this.prisma.apiKey.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'ERR_DUPLICATE_KEY_NAME',
          message: `API key with name "${name}" already exists`,
        },
      });
    }

    const plainKey = SecurityUtil.generatePlainKey();
    const salt = SecurityUtil.generateSalt();
    const keyHash = SecurityUtil.hashWithSalt(plainKey, salt);

    const keyRecord = await this.prisma.apiKey.create({
      data: {
        name,
        keyHash,
        salt,
        scopes,
        isActive: true,
      },
    });

    return {
      ...keyRecord,
      key: `${keyRecord.id}.${plainKey}`, // Return plain key with ID prefix
    };
  }

  async revokeKey(id: string): Promise<ApiKey> {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'ERR_KEY_NOT_FOUND',
          message: 'API key not found',
        },
      });
    }

    if (!key.isActive || key.revokedAt) {
      return key; // Already revoked
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }
}
