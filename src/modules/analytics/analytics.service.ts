import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { InvoiceStatus } from '@prisma/client';
import { TrendQueryDto } from './dto/trend-query.dto';
import { TrendResponseDto } from './dto/trend-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
