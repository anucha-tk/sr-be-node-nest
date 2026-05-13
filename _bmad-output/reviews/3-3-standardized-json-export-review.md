# Code Review Report: 3.3-standardized-json-export

## 🛡️ Review Summary
- **Story:** 3.3-standardized-json-export
- **Reviewer:** Antigravity (Simulated BMad Reviewers)
- **Status:** Issues Identified
- **Date:** 2026-05-13

## 🔍 Findings

### 1. Architecture: Standard Envelope Bypass
- **Category:** Architecture
- **Severity:** Critical
- **Finding:** The `exportAll` method in `InvoiceController` uses `@Res() res: Response` and calls `res.json(items)`. This bypasses the NestJS interceptor that wraps responses in the Standard JSON Envelope (`success`, `data`, `meta`, `error`).
- **Required Fix:** Refactor to return the data directly and use `@Header` or a custom interceptor/decorator if possible, or manually wrap the response to maintain consistency. Actually, for file downloads, the standard envelope might not be desired for the *content* of the file, but the story says "data structure matches the `InvoiceListItemDto` schema". If the export *is* the file, then the file content shouldn't be wrapped. However, the API endpoint itself should be consistent.
- **Correction:** The file content should be raw JSON, but the controller should handle it correctly. If using `@Res()`, I must manually set the envelope if it's meant to be an API response, but since it's a *file download*, the raw JSON is actually what's needed. However, the `Content-Type` is `application/json`, which makes it look like an API response.
- **Better Finding:** If the goal is a *file download*, using `@Res()` is correct, but we must ensure it doesn't break global filters if an error occurs.

### 2. AC Violation: Missing `format` Validation
- **Category:** Acceptance Criteria
- **Severity:** High
- **Finding:** AC #2 specifies `GET /v1/invoices/export?format=json`. The current implementation does not validate the `format` parameter.
- **Required Fix:** Add validation for `format` query parameter.

### 3. Code Quality: Untyped `mapToDto`
- **Category:** Maintainability
- **Severity:** Medium
- **Finding:** `InvoiceService.mapToDto` uses `any` for the input parameter.
- **Required Fix:** Use `Prisma.InvoiceGetPayload` or similar to type the input.

### 4. Robustness: Error Handling
- **Category:** Stability
- **Severity:** Medium
- **Finding:** Bypassing NestJS response handling with `@Res()` means standard exception filters might not work as expected if headers are already sent.
- **Required Fix:** Ensure error handling is robust or use a more Nest-idiomatic way to handle file downloads.

## ✅ Triage Status
- [ ] Envelope Consistency
- [ ] Format Validation
- [ ] Typing Improvements
