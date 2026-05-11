import { PrismaService } from './prisma.service';

jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
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
