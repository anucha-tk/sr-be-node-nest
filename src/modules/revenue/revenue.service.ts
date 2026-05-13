import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RevenueEventDto } from './dto/revenue-event.dto';
import { Prisma, RevenueAuditLog } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

export interface ProcessResult {
  status: 'processed' | 'skipped' | 'failed';
  message: string;
  auditLog?: RevenueAuditLog;
}

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async processRevenue(dto: RevenueEventDto): Promise<ProcessResult> {
    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient): Promise<ProcessResult> => {
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
          const auditLog = await tx.revenueAuditLog.create({
            data: {
              supplierId: dto.supplierId,
              invoiceId: dto.invoiceId,
              correlationId: dto.correlationId,
              amount: dto.amount,
              previousBalance: updatedRevenue.balance.minus(dto.amount),
              newBalance: updatedRevenue.balance,
            },
          });

          // 4. Notify via WebSockets
          this.notificationsGateway.notifyAuditLog(auditLog);
          this.notificationsGateway.notifyBalanceUpdate({
            supplierId: dto.supplierId,
            balance: updatedRevenue.balance.toNumber(),
            lastUpdated: auditLog.createdAt,
          });

          this.logger.log(
            `Processed revenue for supplier ${dto.supplierId}: +${dto.amount} (Balance: ${updatedRevenue.balance.minus(dto.amount).toString()} -> ${updatedRevenue.balance.toString()}) (Event: ${dto.eventId}, Correlation: ${dto.correlationId})`,
          );

          return {
            status: 'processed' as const,
            message: 'Revenue processed successfully',
            auditLog,
          };
        } catch (error: unknown) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            this.logger.warn(
              `Event ${dto.eventId} already processed. Skipping balance update.`,
            );
            return {
              status: 'skipped' as const,
              message: 'Event already processed (Idempotency skip)',
            };
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
      return {
        status: 'failed' as const,
        message: `Processing failed: ${message}`,
      };
    }
  }

  async getAuditLogs(supplierId: string | null, limit: number = 20) {
    return this.prisma.revenueAuditLog.findMany({
      where: supplierId ? { supplierId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
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
        currency: 'USD',
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
