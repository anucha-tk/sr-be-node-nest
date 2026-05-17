# Story 4.1: Elasticsearch Aggregation API (Stats & Metrics)

Status: done

## Story

As a Developer,
I want to implement an API that uses Elasticsearch aggregations for statistical calculations (Sum, Avg, Histogram),
So that users can get high-speed insights from millions of records.

## Acceptance Criteria

1. **High-Speed Aggregations**: The system calculates metrics (Sum, Avg, Count) using Elasticsearch aggregations in < 1,000ms.
2. **Time-Series Analysis**: The aggregation API supports Date Histogram to group results over time.
3. **Structured API Response**: Returns standardized response envelope containing the aggregation results and metadata (including `executionTimeMs`).
4. **OTel/Tracing Integration**: Includes correlation ID and distributed tracing headers.

## Tasks / Subtasks

- [x] Create DTOs for Search Analytics / Aggregations query and response
- [x] Implement Search Analytics aggregation logic in AnalyticsService using ElasticsearchService
- [x] Expose `/api/v1/analytics/search-stats` in AnalyticsController
- [x] Implement comprehensive unit tests for the search stats API with >= 80% coverage
