# Story 1.3: API Key Security for Services

**Status:** done
**Epic:** 1: Secure Access & Documentation
**Story ID:** 1.3
**Key:** 1-3-api-key-security-for-services

## 🎯 Goal

As a Third-Party Developer,
I want to use API Keys for service-to-service communication,
So that I can integrate with the revenue API without a user browser session.

## 📋 Acceptance Criteria

- **Given** an active API Key exists for a service in the database
- **When** I call the API with `x-api-key` header
- **Then** the custom `ApiKeyGuard` validates the hashed key against the database
- **And** the request is authorized based on the assigned scopes
- **And** invalid or revoked keys return `401 Unauthorized` with a clear error code in the Standard Envelope
- **And** the system supports management (Create/Revoke) of API Keys for Admins (FR3)

## 🛠️ Technical Requirements

- **Data Model:** Create `ApiKey` model in `prisma/schema.prisma`:
  - `id` (UUID)
  - `name` (String, e.g. "Bank-Integration")
  - `keyHash` (String, unique) - Store SHA-256 hash of the key
  - `scopes` (String[]) - e.g. ["revenue:read", "invoices:read"]
  - `isActive` (Boolean, default: true)
  - `createdAt`, `updatedAt`, `revokedAt` (DateTime)
- **Shared Service:** Implement `PrismaService` in `src/shared/` to provide access to the database (missed in 1.1/1.2).
- **Custom Guard:** Implement `ApiKeyGuard` in `src/common/guards/api-key.guard.ts`.
  - Should extract key from `x-api-key` header.
  - Should hash the provided key and compare with `keyHash` in DB.
  - Should set `req.apiKey` context if valid.
- **Hybrid Security:** Ensure `ApiKeyGuard` can work alongside Keycloak (routes can be protected by EITHER JWT OR API Key using a custom `@UseGuards(OrGuard(AuthGuard, ApiKeyGuard))` or similar pattern, or by specifically choosing one).
- **Management API:**
  - `POST /v1/auth/api-keys`: Create a new key (Returns the plain key ONCE + metadata). Restricted to `admin` role.
  - `DELETE /v1/auth/api-keys/:id`: Revoke/Deactivate a key. Restricted to `admin` role.
- **Hashing:** Use a secure hashing algorithm (e.g., `crypto.createHash('sha256')`) to store keys. Do NOT store plain keys.

## 🏗️ Architecture Compliance

- **Module:** Logic should be integrated into `src/modules/auth/`.
- **Guard Location:** `src/common/guards/api-key.guard.ts`.
- **Prisma Service:** `src/shared/prisma/prisma.service.ts` (as per architecture diagram).
- **Naming:** Follow `kebab-case` for files and `camelCase` for JSON keys.
- **Standard Envelope:** All success and error responses must match the established format.

## 📂 File Structure Requirements

- `src/shared/prisma/`
  - `prisma.service.ts`
- `src/common/guards/`
  - `api-key.guard.ts`
- `src/modules/auth/`
  - `services/api-key.service.ts`
  - `controllers/api-key.controller.ts`
  - `dto/create-api-key.dto.ts`
- `prisma/schema.prisma` (Update)

## 💡 Developer Context & Guardrails

- **Security First:** Never log the plain API Key. Only log the `id` or `name` of the key being used.
- **Zero Trust:** API Keys must be explicitly linked to scopes. A key with no scopes should have no access.
- **Error Codes:** Use specific codes like `ERR_INVALID_API_KEY` or `ERR_REVOKED_API_KEY` in the error response.
- **Prisma Integration:** Ensure `PrismaService` handles clean shutdown (`onModuleInit` / `onModuleDestroy`).
- **Standard Interceptor:** Ensure the `ResponseEnvelopeInterceptor` from Story 1.2 is applied.

## 🧪 Testing Requirements

- **Unit Tests:**
  - `ApiKeyService`: Test hashing, creation, and retrieval.
  - `ApiKeyGuard`: Test header extraction and validation logic.
- **Integration (E2E):**
  - Verify `401` when header is missing or invalid.
  - Verify `200` when valid key is provided.
  - Verify `401` when key is revoked/inactive.
  - Verify `admin` role requirement for management endpoints.

## Tasks/Subtasks

- [ ] Implement `PrismaService` and `ApiKey` model.
- [ ] Implement `ApiKeyService` for management and validation.
- [ ] Implement `ApiKeyGuard` and integrate with NestJS.
- [ ] Create `api-key.controller.ts` for Admin management.
- [ ] Add unit and E2E tests for API Key flow.

### Review Findings

- [x] [Review][Decision] Scope Enforcement Missing — AC3 requires authorization based on assigned scopes, but ApiKeyGuard only checks if the key is valid/active.
- [x] [Review][Patch] RBAC/Guard Incompatibility — ApiKeyGuard does not populate request.user, causing @Roles check to fail. [src/modules/auth/controllers/api-key.controller.ts:10]
- [x] [Review][Patch] Unsalted SHA256 — Using unsalted SHA256 for key storage is vulnerable to rainbow tables. [src/modules/auth/services/api-key.service.ts:78]
- [x] [Review][Patch] Revocation Logic Flaw — validateKey ignores revokedAt date; revokeKey overwrites existing revokedAt. [src/modules/auth/services/api-key.service.ts:22]
- [x] [Review][Patch] Key Leak in Response — createKey returns full record including keyHash. [src/modules/auth/controllers/api-key.controller.ts:16]
- [x] [Review][Patch] Prisma Exception Handling — revokeKey throws P2025 on missing ID, causing 500 error. [src/modules/auth/controllers/api-key.controller.ts:23]
- [x] [Review][Patch] Scope Whitelist Missing — CreateApiKeyDto allows arbitrary strings in scopes. [src/modules/auth/dto/create-api-key.dto.ts:6]
- [x] [Review][Patch] Header Case/Array Handling — No protection against multiple x-api-key headers or case variations. [src/common/guards/api-key.guard.ts:16]

