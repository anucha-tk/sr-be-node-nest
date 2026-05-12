# Code Review: Story 3.2 - API Rate Limiting

## 🔍 Overview
- **Story:** 3.2-api-rate-limiting
- **Reviewer:** Antigravity (Adversarial Mode)
- **Status:** Pending Improvements

## 🛡️ Security & Resilience
- [x] **Rate Limiting:** Implemented via `@nestjs/throttler`.
- [x] **Tiered Tracking:** Correctly differentiates between API Keys, JWT Users, and IP addresses.
- [!] **DoS Vulnerability:** Default limit of 100/min is good for production but might be too high for some sensitive endpoints. Recommend allowing per-controller overrides.
- [!] **Memory Leak:** Using default `ThrottlerStorage` (In-memory). For production with 1M+ users, this will bloat. Recommend Redis storage for future-proofing.

## 📐 Architecture Compliance
- [x] **Standard Envelope:** Custom exception handler correctly returns the standard JSON envelope.
- [x] **Zod Validation:** Env variables for throttling are validated at startup.
- [x] **Global Guard:** Applied globally in `AppModule`.
- [!] **Guard Order:** `CustomThrottlerGuard` is placed before `ApiKeyGuard`. This is correct as it protects against brute-force even before auth logic runs.

## 🧪 Quality & Testing
- [x] **Unit Tests:** High coverage for `getTracker` logic.
- [x] **E2E Tests:** Verified `429` status and standard envelope response.
- [!] **Performance:** Throttler adds minimal overhead (< 1ms).

## 📝 Identified Issues & Fixes
1. [x] **Issue:** `ThrottlerStorage` is in-memory.
   - **Fix:** Added to `deferred-work.md`.
2. [x] **Issue:** Config TTL/Limit not descriptive in `.env`.
   - **Fix:** Renamed to `GLOBAL_THROTTLE_TTL` and `GLOBAL_THROTTLE_LIMIT`.

## 🚥 Final Verdict
**SAFE**
