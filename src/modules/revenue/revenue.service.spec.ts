import { Test, TestingModule } from '@nestjs/testing';
import { RevenueService } from './revenue.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RevenueEventDto } from './dto/revenue-event.dto';
import { Prisma } from '@prisma/client';

describe('RevenueService', () => {
  let service: RevenueService;
  let prisma: PrismaService;

  const mockRevenueEvent: RevenueEventDto = {
    eventId: 'evt-123',
    invoiceId: 'inv-456',
    supplierId: 'sup-789',
    amount: 1000.5,
    currency: 'USD',
    correlationId: 'corr-001',
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            processedEvent: {
              create: jest.fn(),
            },
            supplierRevenue: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
            },
            revenueAuditLog: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process revenue, update balance, and create audit log', async () => {
    const previousBalance = new Prisma.Decimal(500);
    const expectedNewBalance = previousBalance.add(mockRevenueEvent.amount);

    (prisma.supplierRevenue.findUnique as jest.Mock).mockResolvedValue({
      supplierId: mockRevenueEvent.supplierId,
      balance: previousBalance,
    });

    const transactionMock = jest.fn(async (callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return await callback(prisma);
    });
    (prisma.$transaction as jest.Mock).mockImplementation(transactionMock);

    await service.processRevenue(mockRevenueEvent);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.$transaction).toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.processedEvent.create).toHaveBeenCalledWith({
      data: { id: mockRevenueEvent.eventId },
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.supplierRevenue.upsert).toHaveBeenCalledWith({
      where: { supplierId: mockRevenueEvent.supplierId },
      update: {
        balance: { increment: mockRevenueEvent.amount },
      },
      create: {
        supplierId: mockRevenueEvent.supplierId,
        balance: mockRevenueEvent.amount,
      },
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.revenueAuditLog.create).toHaveBeenCalledWith({
      data: {
        supplierId: mockRevenueEvent.supplierId,
        invoiceId: mockRevenueEvent.invoiceId,
        correlationId: mockRevenueEvent.correlationId,
        amount: mockRevenueEvent.amount,
        previousBalance: previousBalance,
        newBalance: expectedNewBalance,
      },
    });
  });

  it('should create audit log with zero previous balance if supplier does not exist', async () => {
    (prisma.supplierRevenue.findUnique as jest.Mock).mockResolvedValue(null);

    const transactionMock = jest.fn(async (callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return await callback(prisma);
    });
    (prisma.$transaction as jest.Mock).mockImplementation(transactionMock);

    await service.processRevenue(mockRevenueEvent);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.revenueAuditLog.create).toHaveBeenCalledWith({
      data: {
        supplierId: mockRevenueEvent.supplierId,
        invoiceId: mockRevenueEvent.invoiceId,
        correlationId: mockRevenueEvent.correlationId,
        amount: mockRevenueEvent.amount,
        previousBalance: new Prisma.Decimal(0),
        newBalance: new Prisma.Decimal(mockRevenueEvent.amount),
      },
    });
  });

  it('should skip processing if event is already processed', async () => {
    const transactionMock = jest.fn(async (callback) => {
      // Simulate P2002 Unique constraint violation
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.8.0',
        },
      );

      (prisma.processedEvent.create as jest.Mock).mockRejectedValue(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return await callback(prisma);
    });
    (prisma.$transaction as jest.Mock).mockImplementation(transactionMock);

    await service.processRevenue(mockRevenueEvent);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.supplierRevenue.upsert).not.toHaveBeenCalled();
  });
});
