import { NestFactory } from '@nestjs/core';
import { SeedModule } from './modules/seed/seed.module';
import { SeedService } from './modules/seed/seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedBootstrap');
  const app = await NestFactory.createApplicationContext(SeedModule);

  const seedService = app.get(SeedService);
  const targetCount = parseInt(process.env.SEED_COUNT || '1000000', 10);
  const batchSize = parseInt(process.env.SEED_BATCH_SIZE || '10000', 10);

  try {
    await seedService.seedMillionInvoices(targetCount, batchSize);
    logger.log('Seeding process finished successfully.');
  } catch (error) {
    logger.error('Seeding process failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

void bootstrap();
