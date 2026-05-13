import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(supplierId: string | null, query: InvoiceQueryDto) {
    const { limit, offset, sort } = query;
    const where = this.buildWhereClause(supplierId, query);

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
      items: items.map((item) => this.mapToDto(item)),
      total,
    };
  }

  async exportAll(
    supplierId: string | null,
    query: Omit<InvoiceQueryDto, 'limit' | 'offset'>,
  ) {
    const where = this.buildWhereClause(supplierId, query);
    const items = await this.prisma.invoice.findMany({
      where,
      orderBy: query.sort ? this.parseSort(query.sort) : { createdAt: 'desc' },
    });

    return items.map((item) => this.mapToDto(item));
  }

  private buildWhereClause(
    supplierId: string | null,
    query: Pick<InvoiceQueryDto, 'status' | 'startDate' | 'endDate'>,
  ): Prisma.InvoiceWhereInput {
    const { status, startDate, endDate } = query;
    return {
      ...(supplierId && { supplierId }),
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
  }

  private mapToDto(item: Prisma.InvoiceGetPayload<Record<string, never>>) {
    return {
      id: item.id,
      invoiceNumber: item.invoiceNumber,
      supplierId: item.supplierId,
      amount: item.amount.toNumber(),
      status: item.status,
      paidAt: item.paidAt?.toISOString() || null,
      createdAt: item.createdAt.toISOString(),
    };
  }

  private parseSort(sort: string): Prisma.InvoiceOrderByWithRelationInput {
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const field = direction === 'desc' ? sort.substring(1) : sort;
    return { [field]: direction };
  }
}
