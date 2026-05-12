import { Module } from '@nestjs/common';
import { RevenueController } from './revenue.controller';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [RevenueController],
})
export class RevenueModule {}
