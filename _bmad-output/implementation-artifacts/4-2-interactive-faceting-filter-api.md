# Story 4.2: Interactive Faceting & Filter API

Status: done

## Story

As a Developer,
I want to implement an API for dynamic faceting that allows users to drill down into search results,
So that users can find specific subsets of data intuitively.

## Acceptance Criteria

1. **Dynamic Facets**: Exposes list of status and supplierName facets dynamically matched to the active search query.
2. **Contextual Updates**: Applying filters (e.g. status or supplierName) updates both matching transactions and the corresponding facet counts.
3. **Structured API Response**: Standardized JSON envelope contains available facets.
4. **OTel/Tracing**: Distributed tracing headers are fully passed.

## Tasks / Subtasks

- [x] Expose `status` and `supplierName` query filters in `SearchStatsQueryDto`
- [x] Configure bool filter/query matching in AnalyticsService `getSearchStats` logic
- [x] Return dynamic facets (docCount and key per facet bucket) matched to the query context
- [x] Expand unit tests to verify faceting logic and query parameter mapping
