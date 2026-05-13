import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { InvoiceStatus } from '@prisma/client';

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
}
