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
            $queryRaw: jest.fn(),
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

  describe('getTrends', () => {
    it('should return trend data with comparison', async () => {
      const mockRawTrends = [
        { period: '2026-01', totalAmount: 1000 },
        { period: '2026-02', totalAmount: 1500 },
      ];

      // Mocking $queryRaw and aggregate
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockRawTrends);
      (prisma.invoice.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 2500 } }) // Current
        .mockResolvedValueOnce({ _sum: { amount: 800 } }); // Previous

      const result = await service.getTrends({ granularity: 'monthly' });

      expect(result.trends).toHaveLength(2);
      expect(result.trends[0]).toEqual({ label: '2026-01', value: 1000 });
      expect(result.comparison.growthPercentage).toBeGreaterThan(0);
      expect(result.comparison.previousValue).toBe(800);
    });

    it('should handle daily granularity', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.invoice.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 0 },
      });

      const result = await service.getTrends({ granularity: 'daily' });
      expect(result.trends).toEqual([]);
    });

    it('should handle yearly granularity (fallback branch)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.invoice.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 0 },
      });

      // 'yearly' will hit the else block in getTrends
      const result = await service.getTrends({
        granularity: 'yearly',
      });
      expect(result.trends).toEqual([]);
    });

    it('should handle zero growth (previousValue equals currentValue)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { period: '2026-01', totalAmount: 1000 },
      ]);
      (prisma.invoice.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 1000 } })
        .mockResolvedValueOnce({ _sum: { amount: 1000 } });

      const result = await service.getTrends({ granularity: 'monthly' });
      expect(result.comparison.growthPercentage).toBe(0);
    });

    it('should handle negative growth (previousValue > currentValue)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { period: '2026-01', totalAmount: 500 },
      ]);
      (prisma.invoice.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 500 } })
        .mockResolvedValueOnce({ _sum: { amount: 1000 } });

      const result = await service.getTrends({ granularity: 'monthly' });
      expect(result.comparison.growthPercentage).toBe(-50);
    });

    it('should handle null aggregate sums in getTrends', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.invoice.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await service.getTrends({ granularity: 'monthly' });
      expect(result.comparison.currentValue).toBe(0);
      expect(result.comparison.previousValue).toBe(0);
    });
  });
});
