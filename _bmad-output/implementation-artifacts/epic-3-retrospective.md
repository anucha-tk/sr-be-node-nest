# Retrospective: Epic 3 - Invoice History & Search

**Date:** 2026-05-13
**Epic:** 3
**Status:** Complete

## 🎯 Successes

- **Scalable Search:** Implemented filterable invoice history optimized for 1M+ records using Prisma indexing and standardized pagination.
- **Defensive Security:** Successfully deployed tiered rate limiting (API Key vs JWT) via `@nestjs/throttler` and custom guards.
- **High-Fidelity Export:** Standardized JSON export implemented with proper stream headers and filter persistence.
- **Consumer Excellence:** Achieved 100% "Consumer Ready" status with standardized JSON envelopes, ISO 8601 UTC dates, and global `X-Correlation-Id` tracking.

## 💡 Lessons Learned

- **Interceptor Power:** Moving the `StandardEnvelope` logic to global interceptors and filters significantly reduced controller complexity and eliminated "double wrapping" bugs.
- **Stream vs. Interceptor:** Discovered that manual header setting for file downloads requires `passthrough: true` to avoid conflicts with global response interceptors.
- **Error Normalization:** Centralizing error code mapping in `HttpExceptionFilter` ensures business-friendly error codes (e.g., `THROTTLED`) are consistent across the system.
- **Correlation Propagation:** Implementing correlation IDs at the middleware level allows for seamless tracing across success and error paths.

## 🚀 Action Items for Epic 4 (Performance & Seeding)

1. **High-Speed Seeding:** Implement the `4-1` seeding engine using `Prisma.createMany` or raw SQL `COPY` to handle the 1M record target efficiently.
2. **Aggregate Query Performance:** For the `4-2` Admin Summary API, ensure aggregate functions (`_sum`, `_count`) are backed by appropriate indexes.
3. **Advanced SQL Profiling:** Utilize `EXPLAIN ANALYZE` for the complex time-series queries in `4-3` to validate indexing strategy against the seeded dataset.
4. **Rate Limit Tuning:** Monitor throttler behavior under simulated load during seeding/admin tasks to tune `.env` defaults.

---

_Facilitated by Antigravity and the BMad Team._
