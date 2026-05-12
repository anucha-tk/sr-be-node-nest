import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RevenueEventDto } from './dto/revenue-event.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processRevenue(dto: RevenueEventDto): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        try {
          // 1. Attempt to record the event for idempotency

          await tx.processedEvent.create({
            data: { id: dto.eventId },
          });

          // 2. Atomic balance update and get fresh state

          const updatedRevenue = await tx.supplierRevenue.upsert({
            where: { supplierId: dto.supplierId },
            update: {
              balance: { increment: dto.amount },
            },
            create: {
              supplierId: dto.supplierId,
              balance: dto.amount,
            },
          });

          // 3. Create immutable audit log using fresh state

          await tx.revenueAuditLog.create({
            data: {
              supplierId: dto.supplierId,
              invoiceId: dto.invoiceId,
              correlationId: dto.correlationId,
              amount: dto.amount,
              previousBalance: updatedRevenue.balance.minus(dto.amount),
              newBalance: updatedRevenue.balance,
            },
          });

          this.logger.log(
            `Processed revenue for supplier ${dto.supplierId}: +${dto.amount} (Balance: ${updatedRevenue.balance.minus(dto.amount).toString()} -> ${updatedRevenue.balance.toString()}) (Event: ${dto.eventId}, Correlation: ${dto.correlationId})`,
          );
        } catch (error: unknown) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            this.logger.warn(
              `Event ${dto.eventId} already processed. Skipping balance update.`,
            );
            return; // Exit transaction block
          }
          throw error;
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process revenue for event ${dto.eventId}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getSupplierBalance(supplierId: string): Promise<{
    balance: number;
    currency: string;
    metadata: { lastUpdated: string };
  }> {
    const revenue = await this.prisma.supplierRevenue.findUnique({
      where: { supplierId },
    });

    if (!revenue) {
      return {
        balance: 0,
        currency: 'USD', // Default currency
        metadata: {
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    return {
      balance: revenue.balance.toNumber(),
      currency: 'USD',
      metadata: {
        lastUpdated: revenue.updatedAt.toISOString(),
      },
    };
  }
}
