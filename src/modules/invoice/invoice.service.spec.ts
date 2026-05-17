/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { ActivityService } from '../notifications/activity.service';
import { of } from 'rxjs';

describe('InvoiceService', () => {
  let service: InvoiceService;

  const mockPrismaService = {
    invoice: {
      count: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockKafkaClient = {
    emit: jest.fn().mockReturnValue(of({})),
  };

  const mockActivityService = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('payInvoice', () => {
    it('should upsert invoice, emit pulses, and publish Kafka event', async () => {
      const invoiceId = 'uuid-1';
      const supplierId = 'SUP-001';
      const amount = 100.5;

      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-12345',
        supplierId,
        amount: new Prisma.Decimal(amount),
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        createdAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: any) => Promise<any>) => {
          return await cb({
            invoice: {
              upsert: jest.fn().mockResolvedValue(mockInvoice),
            },
          });
        },
      );

      const result = await service.payInvoice(invoiceId, amount, supplierId);

      expect(result.id).toBe(invoiceId);
      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Check DB committed pulse
      expect(mockActivityService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DB_COMMIT',
          label: expect.stringContaining('DB committed'),
        }),
      );

      // Check Kafka emit
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        'invoice.paid',
        expect.objectContaining({
          invoiceId,
          supplierId,
          amount,
        }),
      );

      // Check Kafka produced pulse
      expect(mockActivityService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'KAFKA_PRODUCED',
          label: expect.stringContaining('Kafka produced'),
        }),
      );
    });

    it('should log an error and succeed even if Kafka emission fails', async () => {
      const invoiceId = 'uuid-2';
      const supplierId = 'SUP-002';
      const amount = 50.0;

      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-67890',
        supplierId,
        amount: new Prisma.Decimal(amount),
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        createdAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(
        async (cb: (tx: any) => Promise<any>) => {
          return await cb({
            invoice: {
              upsert: jest.fn().mockResolvedValue(mockInvoice),
            },
          });
        },
      );

      // Mock Kafka client to throw an error
      const mockError = new Error('Kafka broker connection lost');
      mockKafkaClient.emit.mockImplementationOnce(() => {
        throw mockError;
      });

      const result = await service.payInvoice(invoiceId, amount, supplierId);

      expect(result.id).toBe(invoiceId);
      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Ensure DB commit pulse is still sent
      expect(mockActivityService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DB_COMMIT',
        }),
      );

      // Ensure Kafka Produced Pulse is NOT sent due to error
      expect(mockActivityService.emit).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'KAFKA_PRODUCED',
        }),
      );
    });
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

    it('should handle sorting (ascending)', async () => {
      mockPrismaService.invoice.count.mockResolvedValue(0);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);

      const query = { sort: 'amount', limit: 10, offset: 0 };
      await service.findAll(supplierId, query);

      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { amount: 'asc' },
        }),
      );
    });

    it('should handle sorting (descending)', async () => {
      mockPrismaService.invoice.count.mockResolvedValue(0);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);

      const query = { sort: '-amount', limit: 10, offset: 0 };
      await service.findAll(supplierId, query);

      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { amount: 'desc' },
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
    });
  });
});
