import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedMillionInvoices(
    targetCount: number = 1000000,
    batchSize: number = 10000,
  ): Promise<void> {
    this.logger.log(
      `Starting seed of ${targetCount} invoices in batches of ${batchSize}...`,
    );

    // Ensure we have at least one supplier to link to
    let supplier = await this.prisma.supplierRevenue.findFirst();
    if (!supplier) {
      this.logger.log('No supplier found. Creating a default seed supplier...');
      supplier = await this.prisma.supplierRevenue.create({
        data: {
          supplierId: 'seed-supplier-001',
          balance: new Prisma.Decimal(0),
        },
      });
    }

    const supplierId = supplier.supplierId;
    let createdCount = 0;
    const startTime = Date.now();

    while (createdCount < targetCount) {
      const currentBatchSize = Math.min(batchSize, targetCount - createdCount);
      const invoices: Prisma.InvoiceCreateManyInput[] = [];
      const auditLogs: Prisma.RevenueAuditLogCreateManyInput[] = [];

      for (let i = 0; i < currentBatchSize; i++) {
        const amount = new Prisma.Decimal(
          faker.commerce.price({ min: 10, max: 5000 }),
        );
        const status = faker.helpers.arrayElement([
          'PAID',
          'PENDING',
          'CANCELLED',
        ]);
        const createdAt = faker.date.past({ years: 1 });
        const invoiceId = faker.string.uuid();

        invoices.push({
          id: invoiceId,
          invoiceNumber: `INV-${faker.string.alphanumeric(10).toUpperCase()}-${createdCount + i}`,
          supplierId,
          amount,
          status,
          createdAt,
          paidAt:
            status === 'PAID'
              ? faker.date.between({ from: createdAt, to: new Date() })
              : null,
        });

        // Add corresponding audit log for PAID invoices to simulate realistic history
        if (status === 'PAID') {
          auditLogs.push({
            supplierId,
            invoiceId,
            correlationId: faker.string.uuid(),
            amount,
            previousBalance: new Prisma.Decimal(0), // Simplified for seeding
            newBalance: amount,
            createdAt: faker.date.between({ from: createdAt, to: new Date() }),
          });
        }
      }

      await this.prisma.$transaction([
        this.prisma.invoice.createMany({ data: invoices }),
        this.prisma.revenueAuditLog.createMany({ data: auditLogs }),
      ]);

      createdCount += currentBatchSize;
      const progress = ((createdCount / targetCount) * 100).toFixed(1);
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = Math.round(createdCount / elapsed);

      if (
        createdCount % (batchSize * 5) === 0 ||
        createdCount === targetCount
      ) {
        this.logger.log(
          `Progress: ${progress}% (${createdCount}/${targetCount}) | Rate: ${rate} rec/s | Elapsed: ${elapsed.toFixed(1)}s`,
        );
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    this.logger.log(
      `Seeding complete! Total: ${createdCount} records in ${totalTime.toFixed(1)}s.`,
    );

    // Auto-link existing API keys to this supplier for convenience in dev
    const apiKeys = await this.prisma.apiKey.findMany({
      where: { supplierId: null },
    });
    if (apiKeys.length > 0) {
      this.logger.log(`Linking ${apiKeys.length} API keys to ${supplierId}...`);
      await this.prisma.apiKey.updateMany({
        where: { supplierId: null },
        data: { supplierId },
      });
    }
  }
}
