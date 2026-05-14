import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { ObservabilityController } from './observability.controller';

@Module({
  controllers: [ObservabilityController],
  providers: [
    makeCounterProvider({
      name: 'kafka_events_processed_total',
      help: 'Total number of Kafka events processed',
      labelNames: ['type', 'status'],
    }),
    makeGaugeProvider({
      name: 'active_socket_connections',
      help: 'Number of active WebSocket connections',
    }),
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests received',
      labelNames: ['method', 'path', 'status'],
    }),
  ],
  exports: [
    makeCounterProvider({
      name: 'kafka_events_processed_total',
      help: 'Total number of Kafka events processed',
      labelNames: ['type', 'status'],
    }),
    makeGaugeProvider({
      name: 'active_socket_connections',
      help: 'Number of active WebSocket connections',
    }),
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests received',
      labelNames: ['method', 'path', 'status'],
    }),
  ],
})
export class ObservabilityModule {}
