# Story 4.3: Time-Series Trend Analysis

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Operations Admin,
I want to see revenue trends over time,
so that I can identify growth patterns and seasonal fluctuations.

## Acceptance Criteria

1. **Endpoint Access:** `GET /v1/analytics/trends` is accessible only to users with the `admin` role. [Source: epics.md#L338]
2. **Granularity Support:** The endpoint supports a `granularity` query parameter (e.g., `monthly`, `daily`). Default is `monthly`. [Source: epics.md#L339]
3. **Aggregated Data:** The system returns revenue totals grouped by the specified granularity. [Source: epics.md#L339]
4. **Trend Comparison:** The response includes comparison metrics with the previous period (e.g., Year-over-Year or Month-over-Month growth percentage). [Source: epics.md#L340]
5. **Visualization Optimization:** Data format is optimized for charting libraries like Chart.js or D3.js (e.g., array of objects with labels and values). [Source: epics.md#L341]
6. **Performance:** Query execution time must be `< 1,000ms` even with 1,000,000+ records. [Source: NFR1, epics.md#L109]
7. **Standard Envelope:** The response follows the `StandardEnvelope` structure, including `meta.executionTimeMs`. [Source: project-context.md#L42]

## Tasks / Subtasks

- [ ] **Task 1: Define DTOs & Validation (AC: 2, 5)**
  - [ ] Create `TrendQueryDto` with `granularity` validation (Zod).
  - [ ] Create `TrendResponseDto` and `TrendItemDto` for chart-ready data.
- [ ] **Task 2: Implement Trend Analytics Logic (AC: 3, 4, 6)**
  - [ ] Implement `AnalyticsService.getTrends()` using Prisma/SQL.
  - [ ] Use raw SQL or advanced Prisma `groupBy` for time-series aggregation (e.g., `DATE_TRUNC`).
  - [ ] Calculate MoM/YoY growth percentages.
  - [ ] Ensure sub-second performance (leverage `idx_Invoice_createdAt` and `idx_Invoice_status`).
- [ ] **Task 3: Controller & Security (AC: 1, 7)**
  - [ ] Implement `AnalyticsController.getTrends()` with `@Roles({ roles: ['admin'] })`.
  - [ ] Apply `ResponseEnvelopeInterceptor` for standard wrapping.
  - [ ] Add Scalar/OpenAPI annotations for documentation.
- [ ] **Task 4: Testing & Quality (AC: 1-7)**
  - [ ] Write unit tests for `AnalyticsService.getTrends()` with mocked time-series data.
  - [ ] Write E2E tests verifying granularity parameters and RBAC.
  - [ ] Verify performance on million-record dataset.
  - [ ] Run `bun run check:full`.

## Dev Notes

- **SQL Optimization:** For 1M+ records, `DATE_TRUNC` on `createdAt` is preferred. Ensure an index exists on `createdAt`.
- **Trend Calculation:** 
  - Current Period: Sum of revenue for specified granularity.
  - Previous Period: Sum of revenue for the same duration immediately preceding.
  - Growth %: `((current - previous) / previous) * 100`.
- **Chart.js Format:** `data: [{ label: 'Jan 2026', value: 5000 }, { label: 'Feb 2026', value: 7500 }]`.
- **RBAC:** Use `nest-keycloak-connect` decorators as established in previous modules.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#L329-L342]
- [Source: _bmad-output/project-context.md#L8-L10, L33-L38]
- [Source: src/modules/analytics/analytics.service.ts] (Review existing patterns from Story 4.2)

## Dev Agent Record

### Agent Model Used

Gemini 3 Flash

### Debug Log References

- N/A

### Completion Notes List

- N/A

### File List

- [analytics.controller.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/analytics.controller.ts)
- [analytics.service.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/analytics.service.ts)
- [trend-query.dto.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/dto/trend-query.dto.ts)
- [trend-response.dto.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/dto/trend-response.dto.ts)
- [analytics.service.spec.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/analytics.service.spec.ts)
- [analytics.controller.spec.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/analytics.controller.spec.ts)
- [analytics.e2e-spec.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/test/e2e/analytics.e2e-spec.ts)
