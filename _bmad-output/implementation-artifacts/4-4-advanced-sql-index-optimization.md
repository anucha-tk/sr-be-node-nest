# Story 4.4: Advanced SQL & Index Optimization

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Senior Database Architect,
I want to implement advanced PostgreSQL performance techniques,
so that complex analytics remains performant at any scale.

## Acceptance Criteria

1. **Advanced Indexing:** Implement B-Tree indexes on search columns and optimized indexes for financial aggregations. [Source: epics.md#L353]
2. **Materialized Views:** Implement Materialized Views for slow aggregations if needed to meet the < 1s latency target. [Source: epics.md#L353]
3. **Query Optimization:** Confirm `EXPLAIN ANALYZE` results showing index-only scans or optimized execution paths for core endpoints. [Source: epics.md#L354]
4. **Data Freshness:** Provide `lastRefreshed` timestamp for any data sourced from Materialized Views. [Source: epics.md#L355]
5. **Performance:** Core analytics endpoints must maintain sub-second latency with 1,000,000+ records. [Source: NFR1, epics.md#L109]

## Tasks / Subtasks

- [ ] **Task 1: Indexing Strategy (AC: 1, 3)**
  - [ ] Review current indexes in `schema.prisma`.
  - [ ] Add composite indexes for complex filtering (e.g., `status`, `createdAt`, `supplierId`).
  - [ ] Add indexes for revenue calculations on `Invoice` table.
- [ ] **Task 2: Materialized Views Implementation (AC: 2, 4)**
  - [ ] Design `SupplierRevenueSummary` Materialized View.
  - [ ] Implement refresh mechanism for Materialized Views.
  - [ ] Update `AnalyticsService` to prefer Materialized Views for heavy aggregations.
- [ ] **Task 3: Validation & Optimization (AC: 3, 5)**
  - [ ] Run `EXPLAIN ANALYZE` on core analytics queries.
  - [ ] Verify sub-second performance on 1M+ records.
  - [ ] Document optimized plan paths.
- [ ] **Task 4: Final Quality Gate (AC: 1-5)**
  - [ ] Run `bun run check:full`.
  - [ ] Verify E2E tests for analytics still pass and are faster.

## Dev Notes

- **Prisma Limitations:** Prisma doesn't natively support Materialized Views well in `schema.prisma`. Will use raw SQL migrations for MVs.
- **Indexes:** Follow naming convention `idx_{tableName}_{columnName}`.
- **Performance:** Focus on `idx_Invoice_supplierId_status_createdAt` composite indexes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#L343-L356]
- [Source: _bmad-output/project-context.md#L27-L29, L83]
- [Source: prisma/schema.prisma]

## Dev Agent Record

### Agent Model Used

Gemini 3 Flash

### Debug Log References

- N/A

### Completion Notes List

- N/A

### File List

- [schema.prisma](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/prisma/schema.prisma)
- [analytics.service.ts](file:///Users/anucha-tk/App/anucha-tk/sr-be-node-nest/src/modules/analytics/analytics.service.ts)
