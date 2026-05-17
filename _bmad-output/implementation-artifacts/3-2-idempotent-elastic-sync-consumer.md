# Story 3.2: Idempotent Elastic Sync Consumer

Status: done

## Story

As a Developer,
I want to implement Kafka Consumers that perform idempotent upserts/deletes in Elasticsearch,
so that our search engine remains consistent with PostgreSQL without duplicate events causing corruption.

## Acceptance Criteria

1. **Kafka Event Consumption**: Consumes events from the `invoice.paid` topic successfully.
2. **Idempotency Guarantee**: Before processing, check the `ProcessedEvent` table to ensure the event has not been processed. If processed, discard/skip.
3. **Elasticsearch Sync**: Upsert the event details as an invoice document into Elasticsearch Showcase index (`showcase-search-v1`).
4. **Resiliency & DLQ**: Bad events are routed to a dead letter queue (DLQ) and do not crash the consumer.

## Tasks / Subtasks

- [x] Create search index mapping updates and indexing methods in SearchService (AC: 3)
- [x] Implement Kafka consumer in a new Sync module or search module (AC: 1)
- [x] Add ProcessedEvent table checking for idempotency (AC: 2)
- [x] Verify message sync and idempotency with tests (AC: 4)

### Review Findings

- [x] [Review][Patch] Idempotent Sync Order of Operations [src/modules/search/search.consumer.ts:48]
- [x] [Review][Patch] Avoid Zod Deprecation Warning [src/modules/search/search.consumer.ts:28]
