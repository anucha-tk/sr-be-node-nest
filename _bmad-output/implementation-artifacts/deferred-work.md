# Deferred Work Log

## Deferred from: code review of 2-1-kafka-consumer-event-mapping (2026-05-12)
- **Missing fallback for DLQ emit failure**: If emitting to the Dead Letter Queue (DLQ) fails (e.g., Kafka is down), the event is lost with only a log entry. There's no secondary storage for failed DLQ attempts. [src/modules/revenue/revenue.controller.ts:40]
