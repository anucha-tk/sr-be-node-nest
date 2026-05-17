import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { Prisma } from '@prisma/client';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '../kafka/kafka.constants';
import { ActivityService } from '../notifications/activity.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly activityService: ActivityService,
  ) {}

  async payInvoice(invoiceId: string, amount: number, supplierId: string) {
    // 1. Database Transaction
    const invoice = await this.prisma.$transaction(async (tx) => {
      return await tx.invoice.upsert({
        where: { id: invoiceId },
        update: { status: 'PAID', paidAt: new Date() },
        create: {
          id: invoiceId,
          invoiceNumber: `INV-${Date.now()}`,
          supplierId,
          amount: new Prisma.Decimal(amount),
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    });

    // 2. Emit DB Commit Pulse
    this.activityService.emit({
      type: 'DB_COMMIT',
      label: `DB committed: Update Invoice ${invoice.id} to PAID`,
      metadata: { invoiceId: invoice.id, supplierId: invoice.supplierId },
    });

    // 3. Emit Event to Kafka
    const correlationId = crypto.randomUUID();
    const eventId = crypto.randomUUID();
    const payload = {
      eventId,
      correlationId,
      invoiceId: invoice.id,
      supplierId: invoice.supplierId,
      amount: invoice.amount.toNumber(),
      currency: 'USD',
      status: 'PAID',
      paidAt: invoice.paidAt!.toISOString(),
      timestamp: new Date().toISOString(),
    };

    try {
      await firstValueFrom(
        this.kafkaClient.emit(KAFKA_TOPICS.INVOICE_PAID, payload),
      );

      // 4. Emit Kafka Produced Pulse
      this.activityService.emit({
        type: 'KAFKA_PRODUCED',
        label: `Kafka produced: invoice.paid for ${invoice.id}`,
        metadata: {
          topic: KAFKA_TOPICS.INVOICE_PAID,
          eventId,
          correlationId,
        },
      });
    } catch (kafkaError) {
      this.logger.error(
        `Failed to emit invoice.paid event to Kafka for invoice ${invoice.id}: ${kafkaError instanceof Error ? kafkaError.message : String(kafkaError)}`,
      );
    }

    return this.mapToDto(invoice);
  }

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
