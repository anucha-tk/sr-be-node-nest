import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(supplierId: string, query: InvoiceQueryDto) {
    const { status, startDate, endDate, limit, offset, sort } = query;

    const where: Prisma.InvoiceWhereInput = {
      supplierId,
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: sort ? this.parseSort(sort) : { createdAt: 'desc' },
      }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        amount: item.amount.toNumber(),
        paidAt: item.paidAt?.toISOString() || null,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  private parseSort(sort: string): Prisma.InvoiceOrderByWithRelationInput {
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const field = direction === 'desc' ? sort.substring(1) : sort;
    return { [field]: direction };
  }
}
