# Story 3.2: API Rate Limiting

## 📋 Overview
**User Story:**
As a System Administrator,
I want to implement rate limiting across all API endpoints,
So that I can protect the system from abuse, brute-force attacks, and Ensure fair resource distribution.

**Epic:** 3 (Invoice History & Search)
**Status:** ready-for-dev
**Priority:** High

## ✅ Acceptance Criteria
- [ ] **Given** a public or authenticated client
- [ ] **When** the client exceeds the defined request limit (e.g., 100 reqs / 1 min)
- [ ] **Then** the system returns a `429 Too Many Requests` status code
- [ ] **And** the response follows the Standard JSON Envelope with a `THROTTLED` error code
- [ ] **And** different limits are applied based on authentication type (API Key vs JWT)
- [ ] **And** the limits are configurable via environment variables

## 📋 Tasks/Subtasks
- [ ] **Task 1: Infrastructure Setup**
    - [ ] Install `@nestjs/throttler`.
    - [ ] Configure `ThrottlerModule` in `AppModule`.
- [ ] **Task 2: Tiered Rate Limiting Implementation**
    - [ ] Create `CustomThrottlerGuard` to differentiate between API Key and JWT users.
    - [ ] Define default limits in `.env` and validate with Zod.
- [ ] **Task 3: Error Handling**
    - [ ] Customize the throttler exception response to match the Standard Envelope.
- [ ] **Task 4: Validation & Quality**
    - [ ] Write TDD unit tests for the guard logic.
    - [ ] Write E2E tests to verify rate limiting behavior.
    - [ ] Run `bun run check:full`.

## 🛠️ Technical Context
- **Framework:** NestJS
- **Library:** `@nestjs/throttler`
- **Identity:** `UnifiedAuthGuard` integration
- **Configuration:** `ConfigService` + Zod

## 🏗️ Architecture Compliance
- **Standard Envelope:** Must include `success: false`, `error: { code: 'THROTTLED', ... }`.
- **Zero Trust:** Rate limiting applies to all routes including public ones.
- **Config Driven:** No hardcoded limits.

## 🧪 Testing Requirements
- **TDD Mandatory:** Tests before implementation.
- **Coverage:** >= 80%.
- **E2E:** Verify `429` response and standard envelope.

## 📂 Implementation Plan
1. **Dependencies:** Add `@nestjs/throttler`.
2. **Config:** Add `THROTTLE_TTL` and `THROTTLE_LIMIT` to `.env` and `src/config/`.
3. **Guard:** Implement `ThrottlerGuard` extension to handle `UnifiedAuthGuard` context.
4. **Integration:** Provide global `APP_GUARD` for throttler.
5. **Testing:** Mock time or use high frequency requests in E2E.
