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

  beforeEach(() => {
    mockConfigService = {
      get: jest
        .fn()
        .mockReturnValue('postgresql://test:test@localhost:5432/test'),
    };
    service = new PrismaService(mockConfigService as ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    await service.onModuleInit();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((service as any).$connect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    await service.onModuleDestroy();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((service as any).$disconnect).toHaveBeenCalled();
  });
});
