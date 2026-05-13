---
project_name: 'sr-be-node-nest'
user_name: 'Anucha-tk'
date: '2026-05-13'
sections_completed:
  [
    'technology_stack',
    'language_rules',
    'framework_rules',
    'testing_rules',
    'quality_rules',
    'workflow_rules',
    'anti_patterns',
  ]
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Technologies

- **Runtime:** Bun v1.2+, Node.js v24+ (Fallback)
- **Backend:** NestJS v11.0.1 (Express), PostgreSQL 17
- **Frontend:** React v19.2.6, Vite v8.0.12
- **Database & ORM:** Prisma v7.8.0, PostgreSQL 17
- **Messaging:** Apache Kafka (KafkaJS v2.2.4)

### Key Dependencies

- **Security:** Keycloak Connect v26.1.1, nest-keycloak-connect v1.10.1
- **Validation:** nestjs-zod v5.3.0, zod v4.4.3
- **Frontend UI:** Tailwind CSS v4.3.0, Framer Motion v12.38.0, Lucide React v1.14.0
- **Visualization:** Recharts v3.8.1, React Flow v12.10.2, Mermaid v11.15.0
- **Observability:** nestjs-pino v4.6.1, pino v10.3.1

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Module System:** Use `nodenext` for both `module` and `moduleResolution`.
- **Strictness:** Target `ES2023` with `strictNullChecks: true`.
- **Exports:** Use **Named exports** for all NestJS components (Modules, Controllers, Services). Avoid default exports.
- **Error Handling:** 
    - Use `catch (error: unknown)`.
    - Extract messages via `instanceof Error`.
    - Handle `Prisma.PrismaClientKnownRequestError` for database-specific idempotency failures (P2002).

### Framework-Specific Rules

**NestJS (Backend)**

- **Structure:** Feature-based modular structure in `src/modules/{feature}`.
- **Boundaries:** Cross-module communication MUST happen via Services. Controllers must not call other controllers.
- **Security:** Use `@Public()` for open routes and `@Roles()` for RBAC.
- **Prisma:** Always inject `PrismaService` via constructor.
- **Kafka:** Every event processing MUST check `ProcessedEvent` table for idempotency.
- **Docs:** Use `@ApiTags()` and `@ApiStandardResponse()` for all endpoints.

**React (Frontend)**

- **Design:** Glassmorphism aesthetics using `glass-panel` utility and Tailwind 4.
- **Motion:** Use `framer-motion` for all non-static UI transitions.
- **Data:** Use the `fetchApi` helper in `src/api.ts` for consistency.
- **Icons:** Use `Lucide React` for all interface icons.

### Testing Rules

- **Coverage:** Minimum **80% coverage** threshold for Branches, Functions, Lines, and Statements.
- **Location:** Unit tests (`.spec.ts`) reside adjacent to code; E2E tests (`.e2e-spec.ts`) in `test/e2e/`.
- **Idempotency:** Every financial operation test MUST cover the "duplicate event" scenario (P2002 handling).
- **Mocks:** Use `jest.fn()` for `PrismaService` and `ClientKafka` isolation.
- **Enforcement:** All tests must pass before commit via `lefthook`.

### Code Quality & Style Rules

- **Quality Gates:** Commit only after `lefthook` successfully runs `bun check:full`.
- **Commits:** Strictly follow **Conventional Commits** (e.g., `feat:`, `fix:`, `refactor:`).
- **Naming:**
    - Files: `kebab-case.suffix.ts`
    - Classes: `PascalCase`
    - DB Tables: `PascalCase`
- **Documentation:** Use `@ApiTags()`, `@ApiOperation()`, and `@ApiStandardResponse()` for API docs.
- **Clean Code:** Small, single-responsibility functions. Replace magic numbers with constants.

### Development Workflow Rules

- **Infrastructure:** Always develop with `docker compose` to match production-like environments.
- **Environment:** Validate all `.env` variables via Zod at application startup.
- **Migrations:** Use `bun prisma:migrate` for schema changes; avoid `bun prisma:push`.
- **Tracking:** Keep `sprint-status.yaml` updated as the single source of truth for progress.
- **Quality Control:** `lefthook` must pass before any push.

### Critical Don't-Miss Rules

- **Money:** NEVER use `number` for financial calculations. Always use `Prisma.Decimal`.
- **Idempotency:** Every Kafka event MUST be checked against `ProcessedEvent` table before processing.
- **Performance:** Queries on 1M+ records MUST use Materialized Views or optimized B-Tree indexes.
- **Atomicity:** Balance updates and audit logging MUST occur within a single ACID transaction.
- **Logging:** Use `nestjs-pino` for all logs. Never log sensitive keys or raw secrets.
- **Loading:** Always implement Skeleton Loaders for heavy data fetching.
- **Runtime Optimization:** Prefer `bun` for faster cold starts and I/O.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when technology stack changes.
- Review quarterly for outdated rules.
- Remove rules that become obvious over time.

Last Updated: 2026-05-13
