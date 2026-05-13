# Story 3.4: Consumer-Ready REST API

As a Third-Party Developer,
I want a consistent and predictable API interface,
So that I can integrate with minimal debugging effort.

## Acceptance Criteria

- **Given** any API response (Success or Error)
- **When** I receive the payload
- **Then** it is wrapped in the `StandardEnvelope` (`success`, `data`, `meta`, `error`)
- **And** all date-time fields follow the ISO 8601 (UTC) format
- **And** all keys use `camelCase` naming convention
- **And** error responses include a specific business code and a human-readable message

## Developer Context

This story ensures that the API follows high-quality standards for external consumers. While global filters and interceptors handle the envelope, this story focuses on strict consistency across all modules.

### Architecture Compliance
- Standard JSON Envelope: `{ success, data, meta, error }`
- Date Format: ISO 8601 UTC
- Naming: `camelCase` for all JSON keys
- Business Error Codes: Upper-case snake-case (e.g., `ERR_AUTH_EXPIRED`)

### Files to Review/Modify
- `src/common/filters/http-exception.filter.ts`: Ensure comprehensive error code mapping.
- `src/common/interceptors/response-envelope.interceptor.ts`: Verify metadata and timestamp accuracy.
- `src/modules/auth/controllers/api-key.controller.ts`: Check response consistency.
- `src/modules/invoice/invoice.controller.ts`: Check response consistency.
- `src/modules/revenue/revenue.controller.ts`: Check response consistency.

Status: Completed
Date: 2026-05-13

## Implementation Details

1. **Standardized Response Envelope**:
   - Centralized in `src/common/interceptors/response-envelope.interceptor.ts`.
   - Applied globally via `AppModule`.
   - Structure: `{ success, data, meta: { timestamp, executionTimeMs, correlationId, pagination? }, error }`.

2. **Transaction Tracing**:
   - Implemented `CorrelationIdMiddleware` in `src/common/middleware/correlation-id.middleware.ts`.
   - Generates/extracts `X-Correlation-Id` header for every request.
   - Returned in both Success and Error response metadata.

3. **Global Error Mapping**:
   - Enhanced `HttpExceptionFilter` in `src/common/filters/http-exception.filter.ts`.
   - Maps standard HTTP status codes to business-friendly codes (e.g., `RESOURCE_NOT_FOUND`, `AUTH_REQUIRED`, `ERR_RATE_LIMIT_EXCEEDED`).
   - Normalizes framework error codes to upper-snake-case.

4. **Consistency Audit**:
   - Refactored `ApiKeyController` and `InvoiceController` to remove manual wrapping.
   - Updated `InvoiceController.exportAll` to use `passthrough: true` for headers while maintaining standard wrapping.
   - Verified `toISOString()` usage in all services for date formatting.

## Verification Results

- **Unit Tests**: 103 passed (including updated tests for interceptors and filters).
- **E2E Tests**: 12 passed (including new `test/consumer-ready-api.e2e-spec.ts`).
- **Quality Gates**:
  - Coverage: >80% for all core modules.
  - Linting: 0 errors in core implementation files.
  - Performance: `executionTimeMs` tracked for all success responses.

## Artifacts Created/Modified

- `src/common/middleware/correlation-id.middleware.ts` (New)
- `src/common/interfaces/request-with-metadata.interface.ts` (New)
- `test/consumer-ready-api.e2e-spec.ts` (New)
- `src/app.module.ts` (Modified: Registered global filter/interceptor/middleware)
- `src/main.ts` (Modified: Cleaned up manual registrations)
- `src/common/filters/http-exception.filter.ts` (Modified: Robust mapping)
- `src/common/interceptors/response-envelope.interceptor.ts` (Modified: Added correlationId)
- `src/modules/auth/controllers/api-key.controller.ts` (Modified: Removed double wrapping)
- `src/modules/invoice/invoice.controller.ts` (Modified: Fixed export wrapping)

## Technical Requirements
- Ensure `executionTimeMs` is accurately calculated in the interceptor.
- Ensure validation errors (Zod) are mapped to a structured `details` array in the error object.
- Verify that no raw internal errors leak to the consumer.

## Testing Requirements
- Unit tests for `HttpExceptionFilter` covering various status codes and custom errors.
- Integration tests verifying the envelope structure for success and error scenarios.
- E2E tests checking date formats and naming conventions in live responses.
