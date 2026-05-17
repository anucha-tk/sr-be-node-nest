import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;
  let elasticsearchService: ElasticsearchService;

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
        {
          provide: ElasticsearchService,
          useValue: {
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    elasticsearchService =
      module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return aggregated summary data', async () => {
      const mockPaidAggregate = { _sum: { amount: 1000 } };
      const mockPendingAggregate = { _sum: { amount: 500 } };
      const mockGroupBy = [{ supplierId: 's1' }, { supplierId: 's2' }];

      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]); // Empty view
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
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]); // Empty view
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
        {
          period: '2026-01',
          total_amount: 1000,
          last_refreshed: new Date('2026-05-13T09:00:00.000Z'),
        },
        {
          period: '2026-02',
          total_amount: 1500,
          last_refreshed: new Date('2026-05-13T09:00:00.000Z'),
        },
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
      expect(result.lastRefreshed).toBe('2026-05-13T09:00:00.000Z');
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
        { period: '2026-01', total_amount: 1000, last_refreshed: new Date() },
      ]);
      (prisma.invoice.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 1000 } })
        .mockResolvedValueOnce({ _sum: { amount: 1000 } });

      const result = await service.getTrends({ granularity: 'monthly' });
      expect(result.comparison.growthPercentage).toBe(0);
    });

    it('should handle negative growth (previousValue > currentValue)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { period: '2026-01', total_amount: 500, last_refreshed: new Date() },
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

  describe('getSearchStats', () => {
    it('should aggregate statistics, facets and trends from Elasticsearch', async () => {
      const mockEsResponse = {
        aggregations: {
          stats: { count: 5, sum: 1500, avg: 300, min: 100, max: 500 },
          by_status: {
            buckets: [{ key: 'PAID', doc_count: 5 }],
          },
          by_supplier: {
            buckets: [{ key: 'Supplier Alpha', doc_count: 5 }],
          },
          trends: {
            buckets: [
              {
                key_as_string: '2026-05-17',
                doc_count: 5,
                total_amount: { value: 1500 },
              },
            ],
          },
        },
      };

      (elasticsearchService.search as jest.Mock).mockResolvedValueOnce(
        mockEsResponse,
      );

      const result = await service.getSearchStats({
        q: 'Supplier',
        status: 'PAID',
        supplierName: 'Supplier Alpha',
        granularity: 'daily',
      });

      expect(result.stats).toEqual({
        count: 5,
        sum: 1500,
        avg: 300,
        min: 100,
        max: 500,
      });
      expect(result.facets.status).toEqual([{ key: 'PAID', docCount: 5 }]);
      expect(result.facets.supplierName).toEqual([
        { key: 'Supplier Alpha', docCount: 5 },
      ]);
      expect(result.trends).toEqual([
        { period: '2026-05-17', count: 5, amount: 1500 },
      ]);

      expect(elasticsearchService.search).toHaveBeenCalled();
    });

    it('should handle weekly, monthly, and yearly granularities', async () => {
      const mockEsResponse = { aggregations: {} };
      (elasticsearchService.search as jest.Mock).mockResolvedValue(
        mockEsResponse,
      );

      await service.getSearchStats({ granularity: 'weekly' });
      await service.getSearchStats({ granularity: 'monthly' });
      await service.getSearchStats({ granularity: 'yearly' });

      expect(elasticsearchService.search).toHaveBeenCalledTimes(3);
    });

    it('should gracefully handle empty or undefined aggregations in response', async () => {
      (elasticsearchService.search as jest.Mock).mockResolvedValueOnce({});

      const result = await service.getSearchStats({ granularity: 'monthly' });
      expect(result.stats).toEqual({
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
      });
      expect(result.facets.status).toEqual([]);
      expect(result.trends).toEqual([]);
    });

    it('should gracefully fallback when Elasticsearch search throws an error', async () => {
      (elasticsearchService.search as jest.Mock).mockRejectedValueOnce(
        new Error('ES Down'),
      );

      const result = await service.getSearchStats({ granularity: 'monthly' });
      expect(result.stats).toEqual({
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
      });
      expect(result.facets.status).toEqual([]);
      expect(result.trends).toEqual([]);
    });
  });
});
