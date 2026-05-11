---
storyId: "1.3"
storyKey: "1-3-api-key-security-for-services"
storyFile: "_bmad-output/implementation-artifacts/1-3-api-key-security-for-services.md"
atddChecklistPath: "_bmad-output/test-artifacts/atdd-checklist-1-3-api-key-security-for-services.md"
generatedTestFiles: []
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-05-11T09:30:15Z'
storyId: '1.3'
storyKey: '1-3-api-key-security-for-services'
storyFile: '_bmad-output/implementation-artifacts/1-3-api-key-security-for-services.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-3-api-key-security-for-services.md'
generatedTestFiles: ['test/api-key-auth.e2e-spec.ts']
inputDocuments:
  - ".agent/skills/bmad-testarch-atdd/resources/knowledge/data-factories.md"
  - ".agent/skills/bmad-testarch-atdd/resources/knowledge/test-quality.md"
  - ".agent/skills/bmad-testarch-atdd/resources/knowledge/test-levels-framework.md"
  - ".agent/skills/bmad-testarch-atdd/resources/knowledge/api-request.md"
  - ".agent/skills/bmad-testarch-atdd/resources/knowledge/auth-session.md"
---

# ATDD Checklist: 1.3 - API Key Security for Services

## Step 1: Preflight & Context Loading
- Stack Detected: `backend`
- Story Loaded: `1-3-api-key-security-for-services.md`
- Prerequisites Verified: Approved story, Jest framework configured, Dev environment ready.
- Knowledge Base Loaded: Core + Backend + Playwright Utils (API-only).

## Step 2: Generation Mode Selection
- Mode: `AI Generation`
- Rationale: Backend project detected. No UI/browser interaction required for S2S API Key security testing.

## Step 3: Test Strategy
- Stack: `backend`
- Strategy: Hybrid of Unit (logic) and Integration (guards/endpoints) tests.

### Test Scenarios

| ID | Level | Scenario | Priority | AC |
|---|---|---|---|---|
| 1.3-UNIT-001 | Unit | `ApiKeyService.hashKey` generates deterministic SHA-256 hashes | P0 | 1, 5 |
| 1.3-INT-001 | Integration | `ApiKeyGuard` allows requests with valid `x-api-key` header | P0 | 2 |
| 1.3-INT-002 | Integration | `ApiKeyGuard` rejects requests with invalid key (`ERR_INVALID_API_KEY`) | P0 | 2, 4 |
| 1.3-INT-003 | Integration | `ApiKeyGuard` rejects requests with inactive keys | P1 | 2 |
| 1.3-API-001 | API | `POST /v1/auth/api-keys` creates a new key (Admin only) | P0 | 3 |
| 1.3-API-002 | API | `DELETE /v1/auth/api-keys/:id` revokes an existing key | P0 | 3 |
| 1.3-API-003 | API | All endpoints comply with standard response envelope | P0 | 4 |

## Step 4: Test Generation & Aggregation (RED PHASE)
- Status: `SUCCESS`
- TDD Phase: `RED`
- Execution Mode: `sequential`

### Generated Scaffolds
- `test/api-key-auth.e2e-spec.ts`: 5 tests (skipped)
- `test/fixtures/auth-fixtures.ts`: Supporting test data

### Acceptance Criteria Coverage
- [x] Admin can create API keys (1.3-API-001)
- [x] Guard validates x-api-key (1.3-INT-001)
- [x] Reject invalid keys (1.3-INT-002)
- [x] Reject inactive keys (1.3-INT-003)
- [x] Admin can revoke keys (1.3-API-002)
- [x] Standard envelope compliance (1.3-API-003)

### Implementation Guidance
- Endpoints to implement:
  - `POST /v1/auth/api-keys`
  - `DELETE /v1/auth/api-keys/:id`
- Logic: SHA-256 hashing in `ApiKeyService`.
- Guard: `ApiKeyGuard` in `src/common/guards/`.

## Step 5: Final Validation & Completion
- [x] Test scaffolds generated and skipped (`it.skip`)
- [x] Scenarios cover all P0/P1 acceptance criteria
- [x] Fixtures scaffolded for test data
- [x] Story metadata captured in checklist frontmatter

**Completion Summary:**
The ATDD red-phase scaffolding for **Story 1.3: API Key Security** is complete. 5 API test scenarios have been generated and skipped to establish the TDD red phase. These tests expect the standard JSON response envelope and specific error codes (e.g., `ERR_INVALID_API_KEY`).

**Handoff Information:**
- **Checklist Path:** `_bmad-output/test-artifacts/atdd-checklist-1-3-api-key-security-for-services.md`
- **Generated Tests:** `test/api-key-auth.e2e-spec.ts`
- **Next Step:** Proceed to implementation using the `dev-story` workflow.
