import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

describe('InvoiceService', () => {
  let service: InvoiceService;

  const mockPrismaService = {
    invoice: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const supplierId = 'SUP-001';
    const mockInvoices = [
      {
        id: 'uuid-1',
        invoiceNumber: 'INV-001',
        supplierId,
        amount: new Prisma.Decimal(100.5),
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return paginated items and total', async () => {
      mockPrismaService.invoice.count.mockResolvedValue(1);
      mockPrismaService.invoice.findMany.mockResolvedValue(mockInvoices);

      const query = { limit: 10, offset: 0 };
      const result = await service.findAll(supplierId, query);

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].amount).toBe(100.5);
      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { supplierId },
          take: 10,
          skip: 0,
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.invoice.count.mockResolvedValue(0);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);

      const query = { status: InvoiceStatus.PENDING, limit: 10, offset: 0 };
      await service.findAll(supplierId, query);

      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { supplierId, status: InvoiceStatus.PENDING },
        }),
      );
    });

    it('should filter by date range', async () => {
      const startDate = '2026-01-01T00:00:00.000Z';
      const endDate = '2026-12-31T23:59:59.000Z';

      mockPrismaService.invoice.count.mockResolvedValue(0);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);

      const query = { startDate, endDate, limit: 10, offset: 0 };
      await service.findAll(supplierId, query);

      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            supplierId,
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
      );
    });
  });

  describe('exportAll', () => {
    const supplierId = 'SUP-001';
    const mockInvoices = [
      {
        id: 'uuid-1',
        invoiceNumber: 'INV-001',
        supplierId,
        amount: new Prisma.Decimal(100.5),
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all matching items without pagination', async () => {
      mockPrismaService.invoice.findMany.mockResolvedValue(mockInvoices);

      const query = { status: InvoiceStatus.PAID };
      const result = await service.exportAll(supplierId, query);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100.5);
      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { supplierId, status: InvoiceStatus.PAID },
        }),
      );
      expect(mockPrismaService.invoice.findMany).not.toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          take: expect.any(Number),
        }),
      );
    });
  });
});
