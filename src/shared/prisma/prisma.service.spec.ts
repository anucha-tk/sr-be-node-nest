import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    public options: unknown;
    constructor(options?: unknown) {
      this.options = options;
    }
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  let service: PrismaService;
  let mockConfigService: Partial<ConfigService>;

  // Helper for accessing private/protected members for testing
  const getInternal = (s: PrismaService) =>
    s as unknown as {
      $connect: jest.Mock;
      $disconnect: jest.Mock;
      pool: { end: jest.Mock };
    };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if DATABASE_URL is missing', () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    };
    expect(() => new PrismaService(mockConfigService as ConfigService)).toThrow(
      'DATABASE_URL is not defined',
    );
  });

  it('should connect on module init', async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('postgresql://test@localhost:5432/test'),
    };
    service = new PrismaService(mockConfigService as ConfigService);
    await service.onModuleInit();
    expect(getInternal(service).$connect).toHaveBeenCalled();
  });

  it('should throw if connection fails', async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('postgresql://test@localhost:5432/test'),
    };
    service = new PrismaService(mockConfigService as ConfigService);
    getInternal(service).$connect.mockRejectedValue(
      new Error('Connection failed'),
    );
    await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
  });

  it('should disconnect and end pool on module destroy', async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('postgresql://test@localhost:5432/test'),
    };
    service = new PrismaService(mockConfigService as ConfigService);
    const poolEndSpy = jest
      .spyOn(getInternal(service).pool, 'end')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(getInternal(service).$disconnect).toHaveBeenCalled();
    expect(poolEndSpy).toHaveBeenCalled();
  });
});
