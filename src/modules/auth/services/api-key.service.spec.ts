import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SecurityUtil } from '../../../common/utils/security.util';
import { ApiKey } from '@prisma/client';

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  const mockPrisma = {
    apiKey: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateKey', () => {
    it('should return record for valid key', async () => {
      const plainKey = 'valid-key';
      const salt = 'salt';
      const keyHash = SecurityUtil.hashWithSalt(plainKey, salt);
      const mockRecord = {
        id: '1',
        keyHash,
        salt,
        isActive: true,
        revokedAt: null,
      } as ApiKey;
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockRecord);

      const result = await service.validateKey(`1.${plainKey}`);
      expect(result).toEqual(mockRecord);
    });

    it('should throw UnauthorizedException for invalid format', async () => {
      await expect(service.validateKey('invalidformat')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid key', async () => {
      const mockRecord = {
        id: '1',
        keyHash: 'hash',
        salt: 'salt',
        isActive: true,
      };
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockRecord);

      await expect(service.validateKey('1.wrong-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: '1',
        isActive: false,
      });

      await expect(service.validateKey('1.key')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createKey', () => {
    it('should create and return a new key with ID prefix', async () => {
      const mockRecord = { id: '1', name: 'test', scopes: ['revenue:read'] };
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);
      mockPrisma.apiKey.create.mockResolvedValue(mockRecord);

      const result = await service.createKey('test', ['revenue:read']);
      expect(result).toMatchObject(mockRecord);
      expect(result.key).toContain('1.');
    });

    it('should throw ConflictException for duplicate name', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.createKey('test', [])).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('revokeKey', () => {
    it('should deactivate a key', async () => {
      const mockRecord = { id: '1', isActive: true, revokedAt: null } as ApiKey;
      mockPrisma.apiKey.findUnique.mockResolvedValue(mockRecord);
      mockPrisma.apiKey.update.mockResolvedValue({
        ...mockRecord,
        isActive: false,
      });

      const result = await service.revokeKey('1');
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if key missing', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      await expect(service.revokeKey('999')).rejects.toThrow(NotFoundException);
    });
  });
});
