# Story 1.1: Project Foundation & Infra Setup

Status: done

## Dev Agent Record (Antigravity)
- **Note**: Reconfirmed `z.treeifyError(validatedConfig.error)` as the standard for this project, correctly identifying `.format()` as deprecated.
- **Validation**: All ACs met and verified.


<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Senior Developer,
I want a standardized containerized environment with core frameworks,
so that I can build enterprise features with consistent infrastructure.

## Acceptance Criteria

1. **Infrastructure Availability**: `docker compose up` brings up healthy containers for PostgreSQL 17, Keycloak v26, and Kafka v4.
2. **Data Persistence Foundation**: Prisma client (v7.8.0) is initialized and can successfully connect/run migrations to the PostgreSQL container.
3. **Fail-Fast Configuration**: Environment variables are strictly validated using Zod at application startup; process exits with clear error if required variables are missing or invalid.
4. **Clean Architecture Alignment**: Basic project structure matches naming conventions (PascalCase Tables, camelCase Columns, kebab-case Files) and core observability (Pino) is initialized.

## Tasks / Subtasks

- [x] Initialize Infrastructure Layer (AC: 1)
  - [x] Create `docker-compose.yml` with PostgreSQL 17, Keycloak v26, and Kafka v4 services.
  - [x] Ensure proper health checks and volume persistence for all services.
  - [x] Configure Keycloak initial admin credentials via environment variables.
- [x] Configure Data Layer with Prisma (AC: 2)
  - [x] Install `prisma` (dev) and `@prisma/client` (v7.8.0).
  - [x] Initialize `prisma/schema.prisma` with PostgreSQL provider.
  - [x] Verify connection via a dummy migration or `prisma db pull`.
- [x] Implement Strict Environment Validation (AC: 3)
  - [x] Install `zod` and `@nestjs/config`.
  - [x] Create `src/config/env.validation.ts` using Zod schema.
  - [x] Integrate validation into `AppModule`.
- [x] Setup Core Observability & Quality Guards (AC: 4)
  - [x] Install `pino`, `nestjs-pino`, and `pino-pretty`.
  - [x] Configure `LoggerModule` in `AppModule`.
  - [x] Install and initialize `lefthook` for pre-commit linting/testing.

## Dev Notes

- **Database**: Use PostgreSQL 17 image. Standard PascalCase for table names in Prisma schema [Source: architecture.md#Additional Requirements].
- **Auth**: Keycloak v26. No need for realm config yet, just healthy container [Source: epics.md#Story 1.1].
- **Eventing**: Kafka v4. Recommend KRaft mode to avoid Zookeeper dependency if supported by standard images.
- **Validation**: Use `nestjs-zod` for DTO/Env validation [Source: architecture.md#Data Foundation].
- **Logging**: Pino is mandatory for structured logging [Source: architecture.md#Additional Requirements].

### Project Structure Notes

- **Naming**: Ensure all new files use `kebab-case.ts`.
- **Location**: Config validation should live in `src/config/`.

### References

- [Source: planning-artifacts/prd.md#Technical Requirements]
- [Source: planning-artifacts/architecture.md#Additional Requirements]
- [Source: planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Low)

### Debug Log References

- Fixed floating promise warning in `main.ts` for clean build
- Set up Prisma 7 `prisma.config.ts` configuration to fix url parsing
- Migrated deprecated `.format()` to `z.treeifyError()` for Zod v4 compatibility

### Completion Notes List

- Set up docker-compose.yml with PostgreSQL 17, Keycloak 26, and Kafka 4 (KRaft mode).
- Configured Prisma with PostgreSQL datasource pointing to localhost.
- Created Strict Zod Environment configuration via `src/config/env.validation.ts` and integrated into `AppModule` using `@nestjs/config`.
- Set up logging with `nestjs-pino` and pre-commit checks with `lefthook`.

### File List

- `docker-compose.yml` (New)
- `.env.example` (New)
- `lefthook.yml` (New)
- `prisma/schema.prisma` (New)
- `prisma.config.ts` (New)
- `src/config/env.validation.ts` (New)
- `src/app.module.ts` (Modified)
- `src/main.ts` (Modified)
- `package.json` (Modified)
