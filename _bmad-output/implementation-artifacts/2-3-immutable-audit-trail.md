# Story 2.3: Immutable Audit Trail

## 📋 Overview
**User Story:**
As a Financial Auditor,
I want an immutable record of every balance change,
So that I can trace the source of every revenue update.

**Epic:** 2 (Real-time Revenue Tracking)
**Status:** completed
**Priority:** High

## ✅ Acceptance Criteria
- [x] **Given** a successful revenue update transaction
- [x] **When** the balance is modified
- [x] **Then** a new entry is appended to the `RevenueAuditLog` table
- [x] **And** the log includes `correlationId`, `invoiceId`, `previousBalance`, `newBalance`, and `timestamp`
- [x] **And** the log entry is immutable (no update/delete allowed via API)

## 📋 Tasks/Subtasks
- [x] **Task 1: Database Schema Update**
    - [x] Add `RevenueAuditLog` model to `prisma/schema.prisma`
    - [x] Run `bun run db:migrate`
- [x] **Task 2: Implement Audit Logging in RevenueService**
    - [x] Modify `RevenueService.processRevenue` to fetch previous balance
    - [x] Integrate `RevenueAuditLog` creation into the existing transaction
    - [x] Ensure `correlationId` and `invoiceId` are correctly logged
- [x] **Task 3: Verification and Quality**
    - [x] Write unit tests for `RevenueService` audit logging
    - [x] Verify atomicity (if audit log fails, balance update fails)
    - [x] Run `bun run check:full` to ensure no regressions

## 🛠️ Technical Context
- **Database:** PostgreSQL 17 via Prisma.
- **Models Required:**
  - `RevenueAuditLog`: To store the immutable history of balance changes.
- **Audit Strategy:**
  1. This must be part of the same ACID transaction in `RevenueService.processRevenue`.
  2. The log must capture the state *before* and *after* the update.
  3. Fields: `id` (UUID), `correlationId`, `invoiceId`, `supplierId`, `amount`, `previousBalance`, `newBalance`, `timestamp`.
- **Immutability:** 
  - Prisma logic should only ever `create`.
  - No update/delete methods should exist for this model in the service layer.
  - (Optional but recommended) Database level constraints or triggers can be used to prevent updates, but application-level focus is required for this story.

## 🏗️ Architecture Compliance
- **Prisma Schema:** Add `RevenueAuditLog` model.
- **ACID Transactions:** Integrate into the existing `prisma.$transaction` in `RevenueService`.
- **Domain Logic:** Implement in `RevenueService`.
- **Naming:** Follow `PascalCase` for tables and `camelCase` for columns.

## 🧪 Testing Requirements
- **TDD Mandatory:** Write tests to verify that an audit log is created for every successful revenue update.
- **Data Integrity:** Verify all required fields (`correlationId`, `invoiceId`, etc.) are correctly populated.
- **Atomicity:** Ensure that if the audit log creation fails, the entire revenue transaction rolls back.
- **Coverage:** >= 80%.

## 📂 Implementation Plan
1. **Schema Update:**
   - Add `RevenueAuditLog` model to `prisma/schema.prisma`.
   - Fields: `id`, `supplierId`, `invoiceId`, `correlationId`, `amount`, `previousBalance`, `newBalance`, `createdAt`.
   - Run `bun run db:migrate`.
2. **Revenue Service Update:**
   - Modify `RevenueService.processRevenue` to include audit logging.
   - Fetch the previous balance before updating.
   - Calculate or fetch the new balance.
   - Create the `RevenueAuditLog` entry within the same transaction.
3. **Validation:**
   - Ensure `correlationId` is extracted from the event and passed to the log.
   - Verify that the log is truly "append-only" by not exposing any update/delete endpoints.

## 📝 Developer Notes
- Use `Prisma.Decimal` for all balance fields.
- Ensure the `correlationId` is consistently passed from the Kafka event down to the service.
- The `invoiceId` comes from the `invoice.paid` event.
- `previousBalance` should be the balance of the `SupplierRevenue` *before* the current update.
