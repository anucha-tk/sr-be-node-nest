# Story 2.4: Fast Balance Visibility API

## 📋 Overview
**User Story:**
As a Supplier Owner,
I want to see my current revenue balance instantly,
So that I can make quick liquidity decisions.

**Epic:** 2 (Real-time Revenue Tracking)
**Status: review
Epic: 2
Priority: High

## Implementation Summary
- Created `RevenueResponseDto` with standard JSON envelope and `metadata.lastUpdated` field.
- Implemented `GET /v1/suppliers/me/revenue` in `RevenueController` with `@CurrentUser()` and Keycloak RBAC.
- Added `getSupplierBalance` to `RevenueService` using Prisma for atomic retrieval.
- Verified with unit tests and E2E tests.
- Performance: Query uses primary key index, meeting < 200ms latency target.

## ✅ Acceptance Criteria
- [x] **Given** a Supplier is authenticated
- [x] **When** they call `GET /v1/suppliers/me/revenue`
- [x] **Then** they receive their current balance in USD.
- [x] **And** the response includes a `metadata.lastUpdated` timestamp.
- [x] **And** the P95 latency is < 200ms.
- [x] **And** the API returns a 401/403 if the user is not a authorized supplier.

## 📋 Tasks/Subtasks
- [x] **Task 1: Controller & DTO Implementation**
    - [x] Create `RevenueResponseDto` with standard fields.
    - [x] Implement `GET /v1/suppliers/me/revenue` in `RevenueController`.
- [x] **Task 2: Service Layer Implementation**
    - [x] Implement `RevenueService.getSupplierBalance(supplierId: string)`.
    - [x] Ensure the query is optimized for speed.
- [x] **Task 3: Security & Identity**
    - [x] Secure endpoint using Keycloak guards and `@Roles` decorator.
    - [x] Use `@CurrentUser()` to extract the supplier ID.
- [x] **Task 4: Validation & Quality**
    - [x] Write and pass TDD unit tests.
    - [x] Write E2E test for the balance visibility flow.
    - [x] Verify P95 latency target (< 200ms).
    - [x] Run `bun run check:full` to ensure no regressions.

## 🛠️ Technical Context
- **Framework:** NestJS.
- **ORM:** Prisma v7.8.0.
- **Authentication:** Keycloak OIDC.
- **Response Format:** Standard Envelope (`{ success, data, meta, error }`).
- **Endpoint:** `GET /v1/suppliers/me/revenue`.
- **Identity Extraction:** Use a custom `@GetUser()` decorator to extract the identity from the Keycloak JWT.

## 🏗️ Architecture Compliance
- **Standard Envelope:** All responses must use the project's standardized JSON structure.
- **RBAC:** Ensure only users with the correct role (Supplier) can access their own balance.
- **Latency:** Focus on optimized SQL/Prisma queries.
- **Naming:** Follow `camelCase` for API and `kebab-case` for files.

## 🧪 Testing Requirements
- **TDD Mandatory:** Write tests first to define the expected response structure and security constraints.
- **Mocking:** Mock Keycloak identity for controller tests.
- **Performance:** Verify query execution time.
- **Coverage:** >= 80%.

## 📂 Implementation Plan
1. **DTO Definition:**
   - Create `RevenueResponseDto` in `src/modules/revenue/dto/`.
   - Fields: `balance`, `currency`, `lastUpdated`.
2. **Controller Logic:**
   - Update `RevenueController` with the new endpoint.
   - Use `@UseGuards(KeycloakGuard)` (or existing auth guard).
   - Use `@GetUser()` to get the supplier's UUID.
3. **Service Logic:**
   - Implement `getSupplierBalance` in `RevenueService`.
   - Fetch the latest `SupplierRevenue` record for the given `supplierId`.
4. **Validation:**
   - Ensure the `lastUpdated` field is correctly populated from the database.
   - Verify the response matches the Standard Envelope.

## 📝 Developer Notes
- Use `Prisma.Decimal` for the balance field.
- The `lastUpdated` field should come from the `updatedAt` field of the `SupplierRevenue` model (or the latest audit log entry if more accurate).
- Ensure indexes are present on `SupplierRevenue.supplierId` for O(1) or O(log n) lookups.
