## LLM Improving log

### Technical Resolutions (2026-05-11)

- **Prisma Sync:** Run `bunx prisma generate` after schema changes to prevent `tsc` errors on missing properties.
- **E2E Mocking:**
  - Keycloak guards (`AuthGuard`, `RoleGuard`) must be overridden using `overrideGuard()` and `APP_GUARD` token in `TestingModule` to bypass global security.
  - `KEYCLOAK_LOGGER` mock needs a `verbose` method to avoid runtime crashes in `nest-keycloak-connect`.
- **Linting:**
  - Use `@ts-expect-error` with `delete` to safely exclude sensitive fields (like `keyHash`) while satisfying both `tsc` (type safety) and ESLint (unused variables).
  - Create specific `RequestWithAuth` interfaces instead of casting to `any` to avoid unsafe member access warnings.

## Library

- zod: if use z.string().url() deprecate use z.url()
