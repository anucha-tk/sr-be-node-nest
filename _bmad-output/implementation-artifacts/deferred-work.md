# Deferred Work Log

## Deferred from: code review of 2-1-kafka-consumer-event-mapping (2026-05-12)
- **Missing fallback for DLQ emit failure**: If emitting to the Dead Letter Queue (DLQ) fails (e.g., Kafka is down), the event is lost with only a log entry. There's no secondary storage for failed DLQ attempts. [src/modules/revenue/revenue.controller.ts:40]

## Deferred from: code review of 3-2-api-rate-limiting (2026-05-12)
- **In-memory Throttler Storage**: The current implementation uses the default in-memory storage. For a system processing 1M+ records and large user bases, this will cause memory bloat and doesn't work across multiple instances. Migrate to `throttler-storage-redis` in Epic 4 or 5.

## Deferred from: 6-1-advanced-showcase-features (2026-05-13)
- **Live Idempotency Proof**: A button to simulate double payment and show skip in real-time.
- **Security Showcase**: A dedicated page to test rate limiting (429) and auth failure scenarios.
