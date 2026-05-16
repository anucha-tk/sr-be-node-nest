# Story 2.1: Elasticsearch Mapping & Edge N-gram Analyzer

Status: done

## Story

As a Developer,
I want to configure manual mapping and Edge N-gram analyzers in Elasticsearch,
So that the autocomplete is fast, accurate, and handles partial matches correctly.

## Acceptance Criteria

1. **Index Configuration**: Elasticsearch index is created with a custom `edge_ngram` analyzer for partial string matching.
2. **Manual Mapping**: Explicit mapping is defined for core entities (Invoices, Suppliers) to ensure optimized search performance and relevance.
3. **Partial Matching**: The system correctly matches partial queries (e.g., "Inv" matches "Invoice") using the Edge N-gram analyzer.
4. **Multi-Entity Support**: The mapping supports searching across multiple entity types (Invoices, Suppliers, ApiKeys) within a unified search context.
5. **Standard Response**: The index creation/update process provides clear feedback and follows project standards.

## Tasks / Subtasks

- [ ] **Infrastructure Integration** (AC: 1)
  - [ ] Initialize `SearchModule` in `src/modules/search`.
  - [ ] Configure `ElasticsearchModule` using `@nestjs/elasticsearch`.
- [ ] **Analyzer & Settings Definition** (AC: 1, 3)
  - [ ] Define `edge_ngram` tokenizer/filter in index settings.
  - [ ] Create a custom `autocomplete` analyzer using the `edge_ngram` filter.
- [ ] **Manual Mapping Implementation** (AC: 2, 4)
  - [ ] Define explicit mapping for `Invoice` (e.g., `invoiceNumber`, `description`, `supplierName`).
  - [ ] Define explicit mapping for `Supplier` (e.g., `name`, `code`).
  - [ ] Use `keyword` type for IDs and status fields; `text` with `autocomplete` analyzer for searchable fields.
- [ ] **Index Management Service** (AC: 5)
  - [ ] Create `SearchService` to handle index creation and mapping updates.
  - [ ] Implement a startup check or an admin endpoint to ensure the index and mapping are correctly applied.
- [ ] **Verification & Testing**
  - [ ] Write unit tests for `SearchService` to verify settings and mapping objects.
  - [ ] Write integration tests (E2E) to verify that the `_analyze` API returns expected tokens for partial matches.

## Dev Notes

- **Elasticsearch Version**: 8.17.3 [Source: architecture.md].
- **Index Naming**: Use `kebab-case` with versioning, e.g., `showcase-search-v1`.
- **Analyzer Pattern**: Edge N-gram min_chars: 1, max_chars: 20 is standard for autocomplete.
- **Naming**: Ensure files use `kebab-case.ts`.
- **Location**: Store mapping definitions in `src/modules/search/definitions/`.

## References

- [Source: planning-artifacts/prd.md#Global Search & Discovery]
- [Source: planning-artifacts/architecture.md#Data Architecture]
- [Source: planning-artifacts/epics.md#Story 2.1]

## Dev Agent Record (Initial Plan)
- **Note**: Will use `nestjs-zod` for any DTOs needed for the search module.
- **Note**: Ensure `PrismaService` is NOT used here directly for search, but mapping should align with Prisma models.
- **Note**: Follow TDD - write tests for analyzer token generation first.
