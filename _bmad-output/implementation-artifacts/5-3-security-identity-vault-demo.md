# Story 5.3: Security & Identity Vault Demo

Status: done

## Story

As a Developer,
I want to create an interactive demonstration of the security validation process (JWT & API Keys),
So that users can see the multi-layered security in action.

## Acceptance Criteria

1. **Security Showcase**: Interactive UI presenting Keycloak OIDC login status and API Key access control.
2. **JWT Inspector**: A modal drawer to inspect the decoded JWT token details fetched from `/auth-test/protected`.
3. **Rate Limiting Simulation**: Interactive "Flood API" button to trigger HTTP 429 Too Many Requests showing active protection in real-time.

## Tasks / Subtasks

- [x] Create SecurityView.tsx in frontend components
- [x] Implement API Key listings using `/v1/auth/api-keys`
- [x] Implement decoded JWT inspection using `/auth-test/protected`
- [x] Implement rate-limit flooding simulation against `/v1/security-showcase/rate-limit-test` to trigger HTTP 429
