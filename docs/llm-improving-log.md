## LLM Improving log

### Technical Resolutions (2026-05-16)

- **Elasticsearch v9 Integration:** `indices.create` no longer uses a `body` property; parameters are flattened (e.g., `settings`, `mappings` are top-level). Use `as any` or strict literal types to satisfy TS for complex nested objects.
- **E2E Testing:** Services that initialize connections (like Elasticsearch) should skip `onModuleInit` logic in test mode (`process.env.NODE_ENV === 'test'`) or be explicitly mocked to prevent timeouts in global `AppModule` tests.

### Technical Resolutions (2026-05-11)

- **Prisma Sync:** Run `bunx prisma generate` after schema changes to prevent `tsc` errors on missing properties.
- **E2E Mocking:**
  - Keycloak guards (`AuthGuard`, `RoleGuard`) must be overridden using `overrideGuard()` and `APP_GUARD` token in `TestingModule` to bypass global security.
  - `KEYCLOAK_LOGGER` mock needs a `verbose` method to avoid runtime crashes in `nest-keycloak-connect`.
- **Linting:**
  - Use `@ts-expect-error` with `delete` to safely exclude sensitive fields (like `keyHash`) while satisfying both `tsc` (type safety) and ESLint (unused variables).
  - Create specific `RequestWithAuth` interfaces instead of casting to `any` to avoid unsafe member access warnings.

## Library

- zod:
  - if use z.string().url() deprecate use z.url()
  - `.format()` is deprecated; use `z.treeifyError(error)` for structured error reporting instead.
- docker:
  - use named volumes (e.g., `elastic_data`) for stateful services like Elasticsearch to ensure data persists across container restarts.
