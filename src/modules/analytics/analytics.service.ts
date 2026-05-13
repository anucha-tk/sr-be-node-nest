import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { InvoiceStatus } from '@prisma/client';
import { TrendQueryDto } from './dto/trend-query.dto';
import { TrendResponseDto } from './dto/trend-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<AdminSummaryDto> {
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

  async getTrends(query: TrendQueryDto): Promise<TrendResponseDto> {
    const { granularity } = query;

    const trendData =
      (await this.prisma.$queryRaw<
        Array<{ period: string; totalAmount: number }>
      >`
      SELECT 
        TO_CHAR(DATE_TRUNC(${granularity}, "createdAt"), 'YYYY-MM-DD') as period,
        SUM(amount) as "totalAmount"
      FROM "Invoice"
      WHERE status = ${InvoiceStatus.PAID}
      GROUP BY period
      ORDER BY period ASC
      LIMIT 12
    `) || [];

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
    };
  }
}
