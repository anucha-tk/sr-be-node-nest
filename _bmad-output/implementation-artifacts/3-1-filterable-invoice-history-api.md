# Story 3.1: Filterable Invoice History API

## 📋 Overview
**User Story:**
As a Supplier Owner,
I want to search and filter my invoice history,
So that I can reconcile payments and find specific transactions quickly.

**Epic:** 3 (Invoice History & Search)
**Status:** done
**Priority:** High

## ✅ Acceptance Criteria
- [x] **Given** a large invoice dataset (supporting up to 1M+ records)
- [x] **When** I call `GET /v1/invoices` with `status`, `startDate`, and `endDate` parameters
- [x] **Then** the system returns a paginated list using `limit` and `offset`
- [x] **And** the total count of matching records is included in the `meta.pagination` object
- [x] **And** the response time for filtering on indexed columns is `< 500ms`
- [x] **And** the results are scoped to the authenticated Supplier (security boundary)

## 📋 Tasks/Subtasks
- [x] **Task 1: Database Schema & Migration**
    - [x] Create `Invoice` model in `schema.prisma`.
    - [x] Add fields: `id`, `invoiceNumber`, `supplierId`, `amount`, `status` (PENDING, PAID, CANCELLED), `paidAt`, `createdAt`, `updatedAt`.
    - [x] Add indexes: `idx_invoices_supplierId`, `idx_invoices_status`, `idx_invoices_paidAt`.
    - [x] Run Prisma migration.
- [x] **Task 2: Controller & DTO Implementation**
    - [x] Create `InvoiceQueryDto` for filtering and pagination (Zod validated).
    - [x] Create `InvoiceListItemDto` for the response data.
    - [x] Implement `GET /v1/invoices` in `InvoiceController`.
- [x] **Task 3: Service Layer Implementation**
    - [x] Implement `InvoiceService.findAll(supplierId: string, query: InvoiceQueryDto)`.
    - [x] Implement efficient filtering and pagination using Prisma.
    - [x] Ensure count query and data query are optimized.
- [x] **Task 4: Security & Identity**
    - [x] Secure endpoint using `UnifiedAuthGuard` and `UnifiedRoleGuard`.
    - [x] Enforce Supplier scope (users can only see their own invoices).
- [x] **Task 5: Validation & Quality**
    - [x] Write TDD unit tests for controller and service.
    - [x] Write E2E tests for filtering and pagination.
    - [x] Verify latency targets (< 500ms).
    - [x] Run `bun run check:full`.

## 🛠️ Technical Context
- **Framework:** NestJS
- **ORM:** Prisma v7.8.0
- **Validation:** `nestjs-zod`
- **Identity:** `@CurrentUser()` for supplier ID extraction
- **Response Format:** Standard Envelope with `meta.pagination`

## 🏗️ Architecture Compliance
- **Standard Envelope:** Must include `success`, `data`, `meta.pagination`, and `error`.
- **Naming:** `PascalCase` for models, `camelCase` for columns/DTOs, `kebab-case` for files.
- **Indexing:** Required for `supplierId`, `status`, and `paidAt`.
- **Zero Trust:** All routes protected by default.

## 🧪 Testing Requirements
- **TDD Mandatory:** Tests before implementation.
- **Coverage:** >= 80%.
- **Performance:** Validate execution time in E2E tests if possible.

## 📂 Implementation Plan
1. **Prisma Update:** Add `Invoice` model and run `bun prisma migrate dev`.
2. **DTOs:** Define `InvoiceQueryDto` and `InvoiceListItemDto` in `src/modules/invoice/dto/`.
3. **Module Scaffold:** Create `InvoiceModule`, `InvoiceController`, and `InvoiceService` in `src/modules/invoice/`.
4. **Logic:** Implement filtering logic in `InvoiceService`.
5. **Security:** Apply `@Roles('supplier')` and ensure `supplierId` filter is forced to the current user's ID.

## 📝 Developer Notes
- Use `Decimal` for currency amounts.
- Ensure `meta.pagination` contains `total`, `limit`, and `offset`.
- The `Invoice` model should eventually be linked to the `RevenueAuditLog` if needed, but for this story, focus on history retrieval.
