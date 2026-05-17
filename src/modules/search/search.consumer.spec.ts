import { Test, TestingModule } from '@nestjs/testing';
import { SearchConsumer } from './search.consumer';
import { SearchService } from './search.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ActivityService } from '../notifications/activity.service';
import { KAFKA_TOPICS } from '../kafka/kafka.constants';
import { Prisma } from '@prisma/client';

describe('SearchConsumer', () => {
  let consumer: SearchConsumer;

  const mockSearchService = {
    indexInvoice: jest.fn(),
  };

  const mockPrismaService = {
    processedEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
    },
  };

  const mockActivityService = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchConsumer],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
      ],
    }).compile();

    consumer = module.get<SearchConsumer>(SearchConsumer);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('handleInvoicePaid', () => {
    const validEvent = {
      eventId: '2056f066-3cd3-4664-8ec7-556331cf408d',
      correlationId: '73de4baa-3c64-4ede-ac91-e828e6d0e5a3',
      invoiceId: 'inv-123',
      supplierId: 'SUP-001',
      amount: 120.5,
      currency: 'USD',
      status: 'PAID',
      paidAt: '2026-05-17T03:41:43.000Z',
      timestamp: '2026-05-17T03:41:43.000Z',
    };

    it('should process a valid payment event and index it in Elasticsearch', async () => {
      mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.processedEvent.create.mockResolvedValue({});
      mockPrismaService.invoice.findUnique.mockResolvedValue({
        id: 'inv-123',
        invoiceNumber: 'INV-12345',
        supplierId: 'SUP-001',
        amount: new Prisma.Decimal(120.5),
        status: 'PAID',
        createdAt: new Date(),
        paidAt: new Date(),
      });

      await consumer.handleInvoicePaid(validEvent);

      expect(mockPrismaService.processedEvent.findUnique).toHaveBeenCalledWith({
        where: { id: validEvent.eventId },
      });

      expect(mockPrismaService.processedEvent.create).toHaveBeenCalledWith({
        data: {
          id: validEvent.eventId,
        },
      });

      expect(mockSearchService.indexInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'inv-123',
          amount: 120.5,
        }),
      );

      expect(mockActivityService.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'KAFKA_CONSUMED',
        }),
      );
    });

    it('should index invoice using fallback data if invoice is not found in database', async () => {
      mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.processedEvent.create.mockResolvedValue({});
      mockPrismaService.invoice.findUnique.mockResolvedValue(null);

      await consumer.handleInvoicePaid(validEvent);

      expect(mockSearchService.indexInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'inv-123',
          amount: 120.5,
          status: 'PAID',
        }),
      );
    });

    it('should skip indexing if event has already been processed (Idempotency)', async () => {
      mockPrismaService.processedEvent.findUnique.mockResolvedValue({
        id: validEvent.eventId,
        eventType: KAFKA_TOPICS.INVOICE_PAID,
      });

      await consumer.handleInvoicePaid(validEvent);

      expect(mockPrismaService.processedEvent.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.processedEvent.create).not.toHaveBeenCalled();
      expect(mockSearchService.indexInvoice).not.toHaveBeenCalled();
      expect(mockActivityService.emit).not.toHaveBeenCalled();
    });

    it('should discard gracefully if Prisma throws P2002 duplicate key constraint during commit', async () => {
      mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.invoice.findUnique.mockResolvedValue(null);

      const dbError = new Error('Prisma error: P2002 Unique constraint failed');
      mockPrismaService.processedEvent.create.mockRejectedValueOnce(dbError);

      await consumer.handleInvoicePaid(validEvent);

      expect(mockSearchService.indexInvoice).toHaveBeenCalled();
      expect(mockPrismaService.processedEvent.create).toHaveBeenCalled();
      // Ensure SSE consumed pulse is NOT emitted because event processing failed/skipped
      expect(mockActivityService.emit).not.toHaveBeenCalled();
    });

    it('should throw error if database write fails with a general error', async () => {
      mockPrismaService.processedEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.invoice.findUnique.mockResolvedValue(null);

      const generalError = new Error('Database connection timeout');
      mockPrismaService.processedEvent.create.mockRejectedValueOnce(
        generalError,
      );

      await consumer.handleInvoicePaid(validEvent);

      expect(mockSearchService.indexInvoice).toHaveBeenCalled();
      expect(mockPrismaService.processedEvent.create).toHaveBeenCalled();
    });

    it('should log error and skip if payload format is invalid', async () => {
      const invalidEvent = { ...validEvent, currency: 'INVALID_CURRENCY' };

      await consumer.handleInvoicePaid(invalidEvent);

      expect(
        mockPrismaService.processedEvent.findUnique,
      ).not.toHaveBeenCalled();
      expect(mockSearchService.indexInvoice).not.toHaveBeenCalled();
    });
  });
});
