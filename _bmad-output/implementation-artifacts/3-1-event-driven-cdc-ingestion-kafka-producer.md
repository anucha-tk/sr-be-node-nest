# Story 3.1: Event-Driven CDC Ingestion (Kafka Producer)

Status: done

## Story

As a Developer,
I want to implement Kafka Producers in NestJS to emit events on PostgreSQL data changes,
so that downstream services can react to data changes in near real-time.

## Acceptance Criteria

1. **Successful Database Mutation**: An invoice is updated to status `PAID` or a new payment is recorded in PostgreSQL.
2. **Transaction Integrity**: Event emission is triggered after the successful commit of the Prisma transaction.
3. **Kafka Event Payload**: The Kafka message uses topic `invoice.paid` and contains change details, correlationId, and a Trace ID for tracing.
4. **Error Resilience**: If Kafka is down, the database transaction is still safe, and failures are logged gracefully with trace contexts.

## Tasks / Subtasks

- [x] Implement invoice payment mutation in InvoiceService (AC: 1)
- [x] Connect Kafka Producer to emit `invoice.paid` events (AC: 2, 3)
- [x] Incorporate OpenTelemetry Trace ID propagation (AC: 3, 4)
- [x] Write unit/E2E tests for the producer (AC: 4)

### Review Findings

- [x] [Review][Patch] payInvoice Kafka Resilience [src/modules/invoice/invoice.service.ts:58]
