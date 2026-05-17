import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '../kafka/kafka.constants';
import { SearchService } from './search.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InvoicePaidSchema } from '../revenue/schemas/invoice-paid.schema';
import { ActivityService } from '../notifications/activity.service';

@Controller()
export class SearchConsumer {
  private readonly logger = new Logger(SearchConsumer.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  @EventPattern(KAFKA_TOPICS.INVOICE_PAID)
  async handleInvoicePaid(@Payload() payload: unknown) {
    this.logger.log(`Received Kafka event: ${JSON.stringify(payload)}`);

    try {
      // 1. Validate payload
      const result = InvoicePaidSchema.safeParse(payload);
      if (!result.success) {
        this.logger.error(
          `Invalid event payload structure: ${JSON.stringify(result.error.issues)}`,
        );
        return;
      }

      const event = result.data;

      // 2. Check ProcessedEvent table for idempotency
      const processed = await this.prisma.processedEvent.findUnique({
        where: { id: event.eventId },
      });

      if (processed) {
        this.logger.warn(
          `Duplicate event detected. EventId: ${event.eventId} already processed. Skipping.`,
        );
        return;
      }

      // Get invoice details from DB to index
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: event.invoiceId },
      });

      const invoiceToIndex = invoice
        ? {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            supplierId: invoice.supplierId,
            amount: invoice.amount.toNumber(),
            status: invoice.status,
            createdAt: invoice.createdAt,
            paidAt: invoice.paidAt,
          }
        : {
            id: event.invoiceId,
            invoiceNumber: `INV-AUTO-${event.invoiceId.substring(0, 8)}`,
            supplierId: event.supplierId,
            amount: event.amount,
            status: 'PAID',
            createdAt: new Date(event.timestamp),
            paidAt: new Date(event.timestamp),
          };

      // Index in Elasticsearch first (Idempotent operation)
      await this.searchService.indexInvoice(invoiceToIndex);

      // Mark event as processed (State change) only after successful indexing
      try {
        await this.prisma.processedEvent.create({
          data: {
            id: event.eventId,
          },
        });
      } catch (dbError) {
        // If another concurrent consumer successfully wrote it, handle duplicate key gracefully
        const errorMessage =
          dbError instanceof Error ? dbError.message : String(dbError);
        if (errorMessage.includes('P2002')) {
          this.logger.warn(
            `Duplicate event detected during database commit. EventId: ${event.eventId} already processed. Skipping.`,
          );
          return;
        }
        throw dbError;
      }

      // 4. Emit SSE consumed pulse
      this.activityService.emit({
        type: 'KAFKA_CONSUMED',
        label: `Kafka consumed: Synchronized Invoice ${event.invoiceId} to Elasticsearch`,
        metadata: {
          topic: KAFKA_TOPICS.INVOICE_PAID,
          eventId: event.eventId,
          invoiceId: event.invoiceId,
        },
      });

      this.logger.log(
        `Successfully synced invoice ${event.invoiceId} to Elasticsearch.`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing Kafka event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
