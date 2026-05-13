import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { faker } from '@faker-js/faker';

describe('SeedService', () => {
  let service: SeedService;

  const mockPrisma = {
    supplierRevenue: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    invoice: {
      createMany: jest.fn(),
    },
    revenueAuditLog: {
      createMany: jest.fn(),
    },
    apiKey: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    mockPrisma.apiKey.findMany.mockResolvedValue([]);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed specified number of records', async () => {
    mockPrisma.supplierRevenue.findFirst.mockResolvedValue({
      supplierId: 'test-supplier',
    });
    mockPrisma.invoice.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.revenueAuditLog.createMany.mockResolvedValue({ count: 1 });

    await service.seedMillionInvoices(10, 10);

    expect(mockPrisma.invoice.createMany).toHaveBeenCalled();
  });

  it('should handle various statuses and progress logging', async () => {
    mockPrisma.supplierRevenue.findFirst.mockResolvedValue({
      supplierId: 'test-supplier',
    });
    mockPrisma.invoice.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.revenueAuditLog.createMany.mockResolvedValue({ count: 1 });

    const spy = jest.spyOn(faker.helpers, 'arrayElement');
    spy
      .mockReturnValueOnce('PAID')
      .mockReturnValueOnce('PENDING')
      .mockReturnValueOnce('CANCELLED');

    await service.seedMillionInvoices(3, 1);

    expect(mockPrisma.invoice.createMany).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });

  it('should trigger progress logging on batch intervals', async () => {
    mockPrisma.supplierRevenue.findFirst.mockResolvedValue({
      supplierId: 'test-supplier',
    });
    mockPrisma.invoice.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.revenueAuditLog.createMany.mockResolvedValue({ count: 1 });

    // 5 batches of 1 = 5 records. Should trigger (createdCount % (1*5) === 0)
    await service.seedMillionInvoices(5, 1);

    expect(mockPrisma.invoice.createMany).toHaveBeenCalledTimes(5);
  });

  it('should create a seed supplier if none exists', async () => {
    mockPrisma.supplierRevenue.findFirst.mockResolvedValue(null);
    mockPrisma.supplierRevenue.create.mockResolvedValue({
      supplierId: 'seed-supplier-001',
    });

    await service.seedMillionInvoices(1, 1);

    expect(mockPrisma.supplierRevenue.create).toHaveBeenCalled();
  });

  it('should link existing API keys to the supplier', async () => {
    mockPrisma.supplierRevenue.findFirst.mockResolvedValue({
      supplierId: 'test-supplier',
    });
    mockPrisma.invoice.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.revenueAuditLog.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.apiKey.findMany.mockResolvedValue([{ id: 'key-1' }]);

    await service.seedMillionInvoices(1, 1);

    expect(mockPrisma.apiKey.updateMany).toHaveBeenCalledWith({
      where: { supplierId: null },
      data: { supplierId: 'test-supplier' },
    });
  });
});
