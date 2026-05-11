# Story 1.2: Keycloak Identity & RBAC

**Status:** done
**Epic:** 1: Secure Access & Documentation
**Story ID:** 1.2
**Key:** 1-2-keycloak-identity-rbac

## 🎯 Goal
As a Supplier Owner or Admin,
I want to authenticate via a centralized identity provider,
So that my financial data is protected by industry-standard OIDC.

## 📋 Acceptance Criteria
- **Given** Keycloak is configured with a project realm (initialized in Story 1.1)
- **When** I send a request to a `@Roles('admin')` protected endpoint with a valid Admin JWT
- **Then** the request is allowed and my user identity is available in the request context
- **And** a request without a valid JWT returns `401 Unauthorized` in the standard JSON envelope
- **And** a Supplier attempting to access Admin-only routes returns `403 Forbidden`

## 🛠️ Technical Requirements
- **Integration:** Use `nest-keycloak-connect` for OIDC integration.
- **Identity Provider:** Connect to Keycloak v26.6.1 (running on port 8080 from story 1.1).
- **Guards:** Implement Global Guards for `AuthGuard`, `ResourceGuard`, and `RoleGuard` via `APP_GUARD` providers.
- **RBAC:** Map Keycloak roles to NestJS decorators.
- **Context:** Create a `@CurrentUser()` decorator to extract user information (sub, preferred_username, roles) from the Keycloak JWT.
- **Error Handling:** Use a `GlobalExceptionFilter` to wrap 401 and 403 errors in the project's Standard Envelope.

## 🏗️ Architecture Compliance
- **Module:** Implementation must reside in `src/modules/auth/`.
- **Guards:** Global guards configuration should be in `AppModule`.
- **Naming:** Follow `kebab-case` for files and `camelCase` for JSON keys.
- **Standard Envelope:** Ensure all responses (success/error) match:
  ```json
  {
    "success": boolean,
    "data": any,
    "meta": { "timestamp": "ISO8601", "executionTimeMs": number },
    "error": { "code": string, "message": string, "details": [] } | null
  }
  ```

## 📂 File Structure Requirements
- `src/modules/auth/`
  - `auth.module.ts` (Configures Keycloak client using `KeycloakConnectModule`)
  - `controllers/auth-test.controller.ts` (Temporary test endpoints for RBAC verification)
- `src/common/`
  - `decorators/current-user.decorator.ts`
  - `filters/http-exception.filter.ts` (Centralized error mapping)
  - `interceptors/response-envelope.interceptor.ts` (Wraps successful responses)

## 💡 Developer Context & Guardrails
- **Keycloak Realm:** The realm name, auth-server-url, and client-id must be retrieved from `ConfigService` (validated by Zod in Story 1.1).
- **Zero Trust:** Ensure that by default, routes require authentication. Use a `@Public()` decorator to bypass when necessary.
- **Token Validation:** `nest-keycloak-connect` handles token validation; ensure the `secret` (if using confidential client) or public key is correctly mapped.
- **Learning from 1.1:** The `docker-compose.yml` already includes Keycloak. Ensure the application can wait for Keycloak readiness or handle transient connection failures gracefully.

## 🧪 Testing Requirements
- **Unit Tests:** Mock Keycloak service to test RBAC logic in controllers.
- **Integration (E2E):** Use a test JWT to verify:
  - Valid Admin JWT → 200 OK.
  - Valid Supplier JWT to Admin route → 403 Forbidden.
  - No JWT → 401 Unauthorized.
  - All errors follow the `StandardEnvelope` structure.

## Tasks/Subtasks
- [x] Set up `auth.module.ts` with Keycloak configuration.
- [x] Create standard envelope interceptor and exception filter.
- [x] Apply Global Guards and create `@CurrentUser()` decorator.
- [x] Create `auth-test.controller.ts`.
- [x] Add unit tests and e2e tests for Auth Module.

## Dev Agent Record
### Implementation Plan
- Implemented `AuthModule` with `nest-keycloak-connect`.
- Configured dynamic Keycloak setup using `ConfigService` in `auth.module.ts`.
- Implemented `ResponseEnvelopeInterceptor` for standard API responses.
- Implemented `HttpExceptionFilter` to map errors to the standard envelope.
- Created `CurrentUser` decorator to extract payload from JWT.
- Set up `AuthTestController` to test RBAC logic.

### Debug Log
- Resolved `nest-keycloak-connect` dependency conflicts via legacy peer deps.
- Fixed Test modules injection by fully mocking `KeycloakConnectModule` exports using Jest.
- Addressed `@Public()` requirement on `AppController` so root health checks bypass Keycloak.

### Completion Notes
- Story is complete. All guards, custom decorators, interceptors, and filters are implemented and E2E verified. Tests cover missing token (401), valid access (200), and invalid role (403).

## File List
- `src/app.module.ts`
- `src/app.controller.ts`
- `src/main.ts`
- `src/config/env.validation.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/controllers/auth-test.controller.ts`
- `src/modules/auth/controllers/auth-test.controller.spec.ts`
- `src/common/interceptors/response-envelope.interceptor.ts`
- `src/common/filters/http-exception.filter.ts`
- `src/common/decorators/current-user.decorator.ts`
- `test/auth-rbac.e2e-spec.ts`
- `test/app.e2e-spec.ts`

## Change Log
- Added Keycloak integration for Auth with Global Guards.
- Added Standard Envelope format for success/error responses.
- Added `@CurrentUser` parameter decorator.
- Added Auth E2E specs.

## Review Findings

- [x] [Review][Patch] StandardEnvelope executionTimeMs precision [src/common/interceptors/response-envelope.interceptor.ts:25]
- [x] [Review][Patch] HttpExceptionFilter raw Error handling [src/common/filters/http-exception.filter.ts]
- [x] [Review][Patch] ResponseEnvelopeInterceptor non-JSON responses [src/common/interceptors/response-envelope.interceptor.ts]
- [x] [Review][Patch] HttpExceptionFilter exception response type [src/common/filters/http-exception.filter.ts:29]
- [x] [Review][Patch] Error code mapping to BUSINESS_ERROR_CODE [src/common/filters/http-exception.filter.ts:34]
- [x] [Review][Patch] Test RoleGuard brittle logic [test/auth-rbac.e2e-spec.ts:40]
