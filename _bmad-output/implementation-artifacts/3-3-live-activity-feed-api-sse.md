# Story 3.3: Live Activity Feed API (SSE)

Status: done

## Story

As a Developer,
I want to implement a Server-Sent Events (SSE) endpoint to stream live activity updates,
so that the frontend can receive real-time notifications without polling.

## Acceptance Criteria

1. **Active SSE Connection**: Client can establish a persistent EventSource connection to `/api/v1/activity/stream`.
2. **Real-time Streaming**: When a system event (Kafka Produced, Kafka Consumed, DB Commit) occurs, it is streamed immediately to all connected clients.
3. **Filtering Support**: The SSE endpoint supports filtering by event type (e.g. `KAFKA_PRODUCED`, `KAFKA_CONSUMED`, `DB_COMMIT`) via a query parameter.
4. **OTel Integration**: Streams include Trace IDs for debugging and end-to-end tracing.

## Tasks / Subtasks

- [x] Create ActivityService to manage reactive subjects and stream event pipelines (AC: 2)
- [x] Create ActivityController exposing the `/api/v1/activity/stream` SSE endpoint (AC: 1, 3)
- [x] Wire up system components to broadcast to ActivityService (AC: 2, 4)
- [x] Implement unit and integration tests (AC: 4)
