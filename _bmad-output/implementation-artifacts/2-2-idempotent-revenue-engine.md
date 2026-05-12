# Story 2.2: Idempotent Revenue Engine

## 📋 Overview
**User Story:**
As a Supplier Owner,
I want to ensure my revenue is calculated exactly once per invoice,
So that my financial balance is always accurate.

**Epic:** 2 (Real-time Revenue Tracking)
**Status:** ready-for-dev
**Priority:** Critical

## ✅ Acceptance Criteria
- [ ] **Given** an `invoice.paid` event with a unique `eventId`
- [ ] **When** the revenue service processes the event
- [ ] **Then** it checks the `ProcessedEvent` table for the `eventId` to ensure idempotency
- [ ] **And** it updates the `SupplierRevenue` balance using an ACID transaction
- [ ] **And** attempting to process the same `eventId` again results in no balance change (skip)

## 🛠️ Technical Context
- **Database:** PostgreSQL 17 via Prisma.
- **Models Required:**
  - `ProcessedEvent`: To store IDs of events already processed.
  - `SupplierRevenue`: To store the current balance for each supplier.
- **Idempotency Strategy:** 
  1. Start Prisma Transaction.
  2. Attempt to create entry in `ProcessedEvent`.
  3. If unique constraint fails (event already processed), rollback/commit and skip balance update.
  4. If successful, update `SupplierRevenue`.
- **Concurrency:** Ensure atomic balance updates (e.g., `balance: { increment: amount }` or raw SQL `UPDATE ... SET balance = balance + ?`).

## 🏗️ Architecture Compliance
- **Prisma Schema:** Add `ProcessedEvent` and `SupplierRevenue` models.
- **ACID Transactions:** Use `prisma.$transaction`.
- **Domain Logic:** Implement logic in `RevenueService` (needs to be created).
- **Controller:** Delegate to `RevenueService`.

## 🧪 Testing Requirements
- **TDD Mandatory:** Write tests for `RevenueService` to simulate duplicate events.
- **Transactional Tests:** Verify that if the balance update fails, the `ProcessedEvent` entry is not committed.
- **Coverage:** >= 80%.

## 📂 Implementation Plan
1. **Schema Update:**
   - Add `ProcessedEvent` (id: String, createdAt: DateTime).
   - Add `SupplierRevenue` (supplierId: String @id, balance: Decimal, updatedAt: DateTime).
   - Run `bun run db:migrate`.
2. **Revenue Service:**
   - Create `RevenueService`.
   - Implement `processRevenue(dto: RevenueEventDto)`.
   - Use `$transaction` for idempotency check and balance update.
3. **Integration:**
   - Update `RevenueController` to call `RevenueService.processRevenue`.
4. **Validation:**
   - Ensure all errors are logged and handled correctly (no empty catches).

## 📝 Developer Notes
- Use `Prisma.Decimal` for financial balances to avoid floating-point issues.
- `eventId` from Kafka should be mapped to the primary key of `ProcessedEvent`.
- Correlation ID from the event should be passed through for logging.
