# Story 4.1: Million-Record Seeding Engine

## 📋 Overview
**User Story:**
As a Performance Engineer,
I want a high-speed seeding engine to populate the database with 1M+ records,
So that I can validate system performance, indexing strategy, and API latency under production-scale load.

**Epic:** 4 (Performance & Scale)
**Status:** ready-for-dev
**Priority:** High

## ✅ Acceptance Criteria
- [ ] **Given** a target record count (e.g., 1,000,000)
- [ ] **When** I run the seeding command (CLI or endpoint)
- [ ] **Then** the system populates `Invoice` and `RevenueAuditLog` tables with randomized but statistically realistic data
- [ ] **And** the seeding performance reaches at least 10,000 records/second
- [ ] **And** the engine uses batching to prevent memory exhaustion
- [ ] **And** progress is logged every 10% of completion
- [ ] **And** data integrity (foreign keys, types) is maintained

## 📋 Tasks/Subtasks
- [ ] **Task 1: Seeding Engine Architecture**
    - [ ] Create `SeedModule` and `SeedService`.
    - [ ] Implement batching logic using `Prisma.createMany`.
- [ ] **Task 2: Realistic Data Generation**
    - [ ] Use `faker` (if available) or optimized random generators for `invoiceNumber`, `amount`, `status`, etc.
    - [ ] Ensure `supplierId` matches existing users or a dedicated seed supplier.
- [ ] **Task 3: Performance Optimization**
    - [ ] Use raw SQL if `createMany` is too slow for 1M records.
    - [ ] Optimize transaction usage (balance between speed and safety).
- [ ] **Task 4: CLI/Trigger Interface**
    - [ ] Create a `main-seed.ts` script or a protected administrative endpoint.
- [ ] **Task 5: Validation & Quality**
    - [ ] Write tests for the seeding logic (small batch validation).
    - [ ] Run benchmark test for 1M records.
    - [ ] Run `bun run check:full`.

## 🛠️ Technical Context
- **Framework:** NestJS / Standalone Script
- **ORM:** Prisma v7.8.0
- **Scale:** 1,000,000 records
- **Targets:** `Invoice`, `RevenueAuditLog`

## 🏗️ Architecture Compliance
- **Prisma createMany:** Preferred for performance.
- **Batch Size:** Configurable (default 5000-10000).
- **Concurrency:** Ensure no deadlocks if running in parallel with API.

## 🧪 Testing Requirements
- **Unit Tests:** Verify data distribution and batching logic.
- **Integration Tests:** Verify record count after execution.

## 📂 Implementation Plan
1. **Scaffold:** Create `src/modules/seed/`.
2. **Logic:** Implement generator and batcher.
3. **Trigger:** Add `seed:million` script to `package.json`.
4. **Execution:** Run and verify metrics.

## 📝 Developer Notes
- Ensure indexes are ACTIVE during seeding to measure "real world" insertion time, but if too slow, consider dropping/recreating (Standard DB practice). For this story, keep indexes to test realistic scenario.
