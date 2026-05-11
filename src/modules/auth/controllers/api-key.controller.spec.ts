import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from '../services/api-key.service';

describe('ApiKeyController', () => {
  let controller: ApiKeyController;

  const mockApiKeyService = {
    createKey: jest.fn(),
    revokeKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyController],
      providers: [
        {
          provide: ApiKeyService,
          useValue: mockApiKeyService,
        },
      ],
    }).compile();

    controller = module.get<ApiKeyController>(ApiKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an API key and exclude sensitive fields', async () => {
      const mockResult = {
        id: '1',
        key: '1.plain-key',
        keyHash: 'secret',
        salt: 'secret',
      };
      mockApiKeyService.createKey.mockResolvedValue(mockResult);

      const result = await controller.create({ name: 'test', scopes: [] });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('key');
      expect(result.data).not.toHaveProperty('keyHash');
      expect(result.data).not.toHaveProperty('salt');
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      mockApiKeyService.revokeKey.mockResolvedValue({});

      const result = await controller.revoke('1');
      expect(result).toEqual({ success: true, data: { id: '1' } });
    });
  });
});
