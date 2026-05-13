import { Module } from '@nestjs/common';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { SecurityShowcaseController } from './security-showcase.controller';

@Module({
  imports: [KafkaModule, PrismaModule],
  controllers: [RevenueController, SecurityShowcaseController],
  providers: [RevenueService],
  exports: [RevenueService],
})
export class RevenueModule {}
