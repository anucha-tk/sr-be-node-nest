---
story_id: "2.2"
story_key: "2-2-command-palette-search-api-fuzzy-multi-match"
epic_id: "2"
title: "Command Palette Search API (Fuzzy & Multi-match)"
status: "ready-for-dev"
last_updated: "2026-05-16"
---

# Story 2.2: Command Palette Search API (Fuzzy & Multi-match)

## User Story
**As a** User,
**I want to** search for data using a single query string across multiple entities with fuzzy matching support,
**So that** I can find information quickly even if I make typos or don't know the exact field name.

## Acceptance Criteria
- **GIVEN** data is indexed in the `showcase-search-v1` index
- **WHEN** I call `GET /api/v1/search?q={query}`
- **THEN** the system performs a `multi_match` search across fields: `invoiceNumber`, `description`, `name`, `supplierName`
- **AND** it uses `fuzziness: "AUTO"` for typo tolerance
- **AND** it returns results ranked by relevance score (`_score`)
- **AND** the response follows the standard envelope `{ success: true, data: [...], meta: { executionTimeMs: number, total: number } }`

## Technical Details
- **Controller**: Create `SearchController` in `src/modules/search/search.controller.ts`.
- **Route**: `GET /api/v1/search`.
- **Service**: Implement `search(query: string)` in `SearchService`.
- **Elasticsearch Query**:
  ```json
  {
    "query": {
      "multi_match": {
        "query": query,
        "fields": ["invoiceNumber^3", "name^3", "description", "supplierName"],
        "fuzziness": "AUTO",
        "prefix_length": 2
      }
    }
  }
  ```
- **Security**: Use `@Public()` for now as per demo requirements, or `@Authenticated()` if Keycloak is required (check `project-context.md`).
- **Validation**: Use `SearchQueryDto` with Zod validation.

## Implementation Guardrails
- Follow NestJS DDD patterns.
- Ensure 80% test coverage.
- Use `StandardResponse` interceptor for envelope.
- Use `executionTimeMs` in meta (handled by interceptor if exists, else manually).

## Definition of Done
- [ ] Controller implemented with versioning.
- [ ] Service search method implemented.
- [ ] Unit tests pass with >= 80% coverage.
- [ ] E2E tests pass.
- [ ] Manual verification via curl/Postman.
