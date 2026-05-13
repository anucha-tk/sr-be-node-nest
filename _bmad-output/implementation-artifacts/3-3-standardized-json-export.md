# Story 3.3: Standardized JSON Export

Status: ready-for-dev

## Story

As a Supplier Owner,
I want to export my invoice history as a JSON file,
so that I can import my data into my own accounting software.

## Acceptance Criteria

1. **Given** I have filtered a set of invoices
2. **When** I call `GET /v1/invoices/export?format=json` with filters (`status`, `startDate`, `endDate`)
3. **Then** the system generates a JSON file containing all matching records (ignoring pagination limits for export)
4. **And** the download is triggered with `Content-Type: application/json` and `Content-Disposition: attachment; filename=invoices_export_{timestamp}.json`
5. **And** the data structure matches the `InvoiceListItemDto` schema
6. **And** the results are scoped to the authenticated Supplier (security boundary)

## Tasks / Subtasks

- [ ] **Task 1: Controller Implementation** (AC: #2, #4)
  - [ ] Implement `GET /v1/invoices/export` in `InvoiceController`.
  - [ ] Use `@Header` or `Res()` to set download headers.
  - [ ] Validate `format=json` requirement.
- [ ] **Task 2: Service Layer Implementation** (AC: #3, #5, #6)
  - [ ] Implement `InvoiceService.exportAll(supplierId: string, query: InvoiceQueryDto)`.
  - [ ] Reuse filtering logic from `findAll` but skip `take` and `skip`.
  - [ ] Map data to `InvoiceListItemDto` compatible format.
- [ ] **Task 3: Testing & Quality** (AC: #1-6)
  - [ ] Write TDD unit tests for export logic.
  - [ ] Write E2E tests verifying headers and content structure.
  - [ ] Ensure `bun run check:full` passes.

## Dev Notes

- Reuse `Prisma.InvoiceWhereInput` construction logic from `InvoiceService.findAll`.
- Export should generally not be paginated (return all matches).
- Filename should include a UTC timestamp for uniqueness.
- Ensure `decimal` values from Prisma are converted to `number`.

### Project Structure Notes

- Controller: `src/modules/invoice/invoice.controller.ts`
- Service: `src/modules/invoice/invoice.service.ts`
- DTOs: `src/modules/invoice/dto/`

### References

- [Source: src/modules/invoice/invoice.controller.ts]
- [Source: src/modules/invoice/invoice.service.ts]

## Dev Agent Record

### Agent Model Used

Gemini 3 Flash

### Debug Log References

### Completion Notes List

### File List
