import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return aggregated summary data', async () => {
      const mockPaidAggregate = { _sum: { amount: 1000 } };
      const mockPendingAggregate = { _sum: { amount: 500 } };
      const mockGroupBy = [{ supplierId: 's1' }, { supplierId: 's2' }];

      (prisma.invoice.aggregate as jest.Mock)
        .mockResolvedValueOnce(mockPaidAggregate)
        .mockResolvedValueOnce(mockPendingAggregate);
      (prisma.invoice.groupBy as jest.Mock).mockResolvedValueOnce(mockGroupBy);

      const result = await service.getSummary();

      expect(result).toEqual({
        totalRevenue: 1000,
        totalPending: 500,
        supplierCount: 2,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.invoice.aggregate).toHaveBeenCalledTimes(2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.invoice.groupBy).toHaveBeenCalledWith({
        by: ['supplierId'],
      });
    });

    it('should handle null sums by returning 0', async () => {
      (prisma.invoice.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: null },
      });
      (prisma.invoice.groupBy as jest.Mock).mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result).toEqual({
        totalRevenue: 0,
        totalPending: 0,
        supplierCount: 0,
      });
    });
  });
});
