import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { InvoiceStatus } from '@prisma/client';
import { TrendQueryDto } from './dto/trend-query.dto';
import { TrendResponseDto } from './dto/trend-response.dto';
import {
  SearchStatsQueryDto,
  SearchStatsResponseDto,
} from './dto/search-stats.dto';
import { SEARCH_INDEX_NAME } from '../search/definitions/search.index';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async getSummary(): Promise<AdminSummaryDto & { lastRefreshed?: string }> {
    const [summary] = await this.prisma.$queryRaw<
      Array<{
        total_revenue: number;
        total_pending: number;
        supplier_count: number;
        last_refreshed: Date;
      }>
    >`SELECT * FROM "mv_admin_revenue_summary" LIMIT 1`;

    if (summary) {
      return {
        totalRevenue: Number(summary.total_revenue || 0),
        totalPending: Number(summary.total_pending || 0),
        supplierCount: Number(summary.supplier_count || 0),
        lastRefreshed: summary.last_refreshed.toISOString(),
      };
    }

    // Fallback to real-time if view is empty
    const [paidResult, pendingResult, suppliers] = await Promise.all([
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: InvoiceStatus.PAID },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: InvoiceStatus.PENDING },
      }),
      this.prisma.invoice.groupBy({
        by: ['supplierId'],
      }),
    ]);

    return {
      totalRevenue: Number(paidResult._sum.amount || 0),
      totalPending: Number(pendingResult._sum.amount || 0),
      supplierCount: suppliers.length,
    };
  }

  async getTrends(
    query: TrendQueryDto,
  ): Promise<TrendResponseDto & { lastRefreshed?: string }> {
    const { granularity } = query;
    let trendData: Array<{ period: string; totalAmount: number }> = [];
    let lastRefreshed: string | undefined;

    if (granularity === 'monthly') {
      const viewData = await this.prisma.$queryRaw<
        Array<{ period: string; total_amount: number; last_refreshed: Date }>
      >`SELECT period, total_amount, last_refreshed FROM "mv_revenue_trends_monthly" ORDER BY period ASC LIMIT 12`;

      if (viewData.length > 0) {
        trendData = viewData.map((d) => ({
          period: d.period,
          totalAmount: d.total_amount,
        }));
        lastRefreshed = viewData[0].last_refreshed.toISOString();
      }
    }

    if (trendData.length === 0) {
      // Fallback to optimized raw SQL query
      trendData =
        (await this.prisma.$queryRaw<
          Array<{ period: string; totalAmount: number }>
        >`
        SELECT 
          TO_CHAR(DATE_TRUNC(${granularity}, "createdAt"), 'YYYY-MM-DD') as period,
          SUM(amount) as "totalAmount"
        FROM "invoices"
        WHERE status = ${InvoiceStatus.PAID}
        GROUP BY period
        ORDER BY period ASC
        LIMIT 12
      `) || [];
    }

    // 2. Get Comparison Data
    const now = new Date();
    let startDateCurrent: Date;
    let startDatePrevious: Date;

    if (granularity === 'monthly') {
      startDateCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      startDatePrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (granularity === 'daily') {
      startDateCurrent = new Date(now.setHours(0, 0, 0, 0));
      startDatePrevious = new Date(
        new Date(startDateCurrent).setDate(startDateCurrent.getDate() - 1),
      );
    } else {
      // Fallback for others
      startDateCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      startDatePrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    const [currentResult, previousResult] = await Promise.all([
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: InvoiceStatus.PAID,
          createdAt: { gte: startDateCurrent },
        },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: InvoiceStatus.PAID,
          createdAt: {
            gte: startDatePrevious,
            lt: startDateCurrent,
          },
        },
      }),
    ]);

    const currentValue = Number(currentResult._sum.amount || 0);
    const previousValue = Number(previousResult._sum.amount || 0);
    const growthPercentage =
      previousValue === 0
        ? 100
        : ((currentValue - previousValue) / previousValue) * 100;

    return {
      trends: trendData.map((item) => ({
        label: item.period,
        value: Number(item.totalAmount),
      })),
      comparison: {
        currentValue,
        previousValue,
        growthPercentage,
      },
      lastRefreshed,
    };
  }

  async getSearchStats(
    query: SearchStatsQueryDto,
  ): Promise<SearchStatsResponseDto> {
    const must: Record<string, unknown>[] = [];
    if (query.q) {
      must.push({
        multi_match: {
          query: query.q,
          fields: ['invoiceNumber^3', 'name^3', 'description', 'supplierName'],
          fuzziness: 'AUTO',
          prefix_length: 2,
        },
      });
    }

    const filter: Record<string, unknown>[] = [];
    if (query.status) {
      filter.push({ term: { 'status.keyword': query.status } });
    }
    if (query.supplierName) {
      filter.push({ term: { 'supplierName.keyword': query.supplierName } });
    }

    const esQuery = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter: filter.length > 0 ? filter : undefined,
      },
    };

    let calendarInterval: 'day' | 'week' | 'month' | 'year' = 'month';
    if (query.granularity === 'daily') {
      calendarInterval = 'day';
    } else if (query.granularity === 'weekly') {
      calendarInterval = 'week';
    } else if (query.granularity === 'monthly') {
      calendarInterval = 'month';
    } else if (query.granularity === 'yearly') {
      calendarInterval = 'year';
    }

    const aggs = {
      stats: {
        stats: { field: 'amount' },
      },
      by_status: {
        terms: { field: 'status.keyword', size: 10 },
      },
      by_supplier: {
        terms: { field: 'supplierName.keyword', size: 10 },
      },
      trends: {
        date_histogram: {
          field: 'createdAt',
          calendar_interval: calendarInterval,
          format: 'yyyy-MM-dd',
          min_doc_count: 0,
        },
        aggs: {
          total_amount: {
            sum: { field: 'amount' },
          },
        },
      },
    };

    try {
      const result = await this.elasticsearchService.search({
        index: SEARCH_INDEX_NAME,
        size: 0,
        query: esQuery,
        aggs,
      });

      interface EsStatsAgg {
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
      }
      interface EsBucket {
        key: string | number;
        doc_count: number;
        total_amount?: { value: number };
        key_as_string?: string;
      }

      const aggregations = result.aggregations as
        | Record<string, unknown>
        | undefined;

      const statsAgg = (aggregations?.stats as EsStatsAgg) || {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
      };
      const statusBuckets =
        (aggregations?.by_status as { buckets: EsBucket[] })?.buckets || [];
      const supplierBuckets =
        (aggregations?.by_supplier as { buckets: EsBucket[] })?.buckets || [];
      const trendBuckets =
        (aggregations?.trends as { buckets: EsBucket[] })?.buckets || [];

      return {
        stats: {
          count: Number(statsAgg.count || 0),
          sum: Number(statsAgg.sum || 0),
          avg: Number(statsAgg.avg || 0),
          min: Number(statsAgg.min || 0),
          max: Number(statsAgg.max || 0),
        },
        facets: {
          status: statusBuckets.map((b) => ({
            key: String(b.key),
            docCount: Number(b.doc_count),
          })),
          supplierName: supplierBuckets.map((b) => ({
            key: String(b.key),
            docCount: Number(b.doc_count),
          })),
        },
        trends: trendBuckets.map((b) => ({
          period: String(b.key_as_string || b.key),
          count: Number(b.doc_count || 0),
          amount: Number(b.total_amount?.value || 0),
        })),
      };
    } catch {
      return {
        stats: { count: 0, sum: 0, avg: 0, min: 0, max: 0 },
        facets: { status: [], supplierName: [] },
        trends: [],
      };
    }
  }
}
