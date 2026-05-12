# Story 1.4: Interactive Scalar API Docs

**Status:** done
**Epic:** 1: Secure Access & Documentation
**Story ID:** 1.4
**Key:** 1-4-interactive-scalar-api-docs

## 🎯 Goal

As a Developer Consumer,
I want interactive, beautiful API documentation,
So that I can test endpoints and integrate with zero friction.

## 📋 Acceptance Criteria

- **Given** the application is running
- **When** I navigate to `/docs`
- **Then** Scalar UI renders the OpenAPI v3 specification
- **And** all security schemes (JWT OIDC and API Key) are documented and testable via "Try it out"
- **And** the documentation includes the standard JSON response envelope structure
- **And** all existing endpoints (Auth, API Keys, etc.) are properly categorized with descriptions

## 🛠️ Technical Requirements

- **Library:** Use `@scalar/nestjs` for rendering the documentation.
- **OpenAPI Integration:** Use `@nestjs/swagger` to generate the OpenAPI v3 specification.
- **Route:** Configure the documentation to be available at `/docs`.
- **Security Schemes:**
  - Define `bearer` auth for Keycloak OIDC.
  - Define `api-key` auth using the `x-api-key` header.
  - **Global Requirement:** Every endpoint supports EITHER `bearer` or `api-key` (documented globally in OpenAPI specification).
- **Global Config:** Ensure all controllers/endpoints use `@ApiTags()` for categorization.
- **Standard Envelope Documentation:** 
  - Create a reusable `StandardResponseDto` using `@ApiProperty()` and `@ApiExtraModels()`.
  - Use generics or `api-helper` to wrap response types in the documentation.
- **Theme:** Use the default Scalar theme as specified in UX design (Clean & Minimal).

## 🏗️ Architecture Compliance

- **Location:** Configuration should be in `src/main.ts`.
- **DTOs:** Documentation helpers can reside in `src/common/dto/` or `src/common/docs/`.
- **Consistency:** Ensure `camelCase` is used in all documented properties.
- **Standard Envelope:** The documentation MUST reflect the `{ success, data, meta, error }` structure.

## 📂 File Structure Requirements

- `src/main.ts` (Update)
- `src/common/docs/`
  - `standard-response.dto.ts`
  - `api-response.decorator.ts` (Optional, for easier documentation)

## 💡 Developer Context & Guardrails

- **Security First:** Even if documented, ensure `@Public()` is only used where intended.
- **Accuracy:** The documentation must match the actual implementation (use Zod schemas with `@nestjs/swagger` if possible, or manual DTOs). Since we use `nestjs-zod`, ensure `patchNestjsSwagger()` is called in `main.ts`.
- **Actionable Errors:** Document common error codes (e.g., `AUTH_INVALID_TOKEN`, `VAL_VALIDATION_FAILED`).
- **Performance Proof:** Mention that `executionTimeMs` is included in all responses.

## 🧪 Testing Requirements

- **Integration (E2E):**
  - Verify `GET /docs` returns `200 OK` and contains Scalar UI HTML.
  - Verify `GET /docs-json` (or equivalent) returns valid OpenAPI v3 JSON.
  - Verify that both `JWT` and `x-api-key` security schemes appear in the JSON.

## Tasks/Subtasks

- [x] Install `@scalar/nestjs-api-reference` and `@nestjs/swagger`.
- [x] Configure OpenAPI and Scalar in `src/main.ts`.
- [x] Implement `StandardResponseDto` and documentation decorators.
- [x] Annotate existing controllers (`Auth`, `ApiKey`) with Swagger decorators.
- [x] Verify security scheme visibility and "Try it out" functionality.
- [x] Achieve >= 80% coverage for any new logic (though mostly config).

## 📂 File List

- `src/main.ts` (Modified)
- `src/common/docs/standard-response.dto.ts` (New)
- `src/common/docs/api-response.decorator.ts` (New)
- `src/modules/auth/dto/api-key-response.dto.ts` (New)
- `src/modules/auth/dto/auth-test-response.dto.ts` (New)
- `src/modules/auth/controllers/api-key.controller.ts` (Modified)
- `src/modules/auth/controllers/auth-test.controller.ts` (Modified)
- `test/e2e/documentation.e2e-spec.ts` (New)

## 🕒 Change Log

- **2026-05-11**: Integrated Scalar API Reference at `/docs`.
- **2026-05-11**: Configured OpenAPI v3 with JWT and API Key security schemes.
- **2026-05-11**: Implemented `ApiStandardResponse` decorator for documented envelope consistency.
- **2026-05-11**: Annotated `Auth` and `ApiKey` controllers with Swagger documentation.

## 🤖 Dev Agent Record

### Implementation Plan
1. Install `@scalar/nestjs-api-reference` and `@nestjs/swagger`.
2. Configure `DocumentBuilder` in `main.ts` with `bearer` and `api-key` security schemes.
3. Use `cleanupOpenApiDoc` from `nestjs-zod` for compatibility.
4. Create `StandardResponseDto` to model the project's JSON envelope.
5. Create `ApiStandardResponse` decorator to simplify wrapping response data in the envelope.
6. Annotate all endpoints in `ApiKeyController` and `AuthTestController`.

### Debug Log
- Encountered peer dependency conflict during installation (NestJS 11 vs nest-keycloak-connect). Resolved with `--legacy-peer-deps`.
- Corrected package name to `@scalar/nestjs-api-reference`.
- Resolved `patchNestjsSwagger` removal in `nestjs-zod` v5 by using `cleanupOpenApiDoc(document)`.
- Fixed Prisma initialization error in E2E tests by mocking `PrismaService`.

### Completion Notes
All acceptance criteria met. API documentation is live at `/docs` (when running). Security schemes are correctly defined. All responses in documentation reflect the `{ success, data, meta, error }` structure.

**Status:** review
