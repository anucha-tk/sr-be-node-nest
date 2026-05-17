## LLM Improving log

### Technical Resolutions (2026-05-17)

- **NestJS Server-Sent Events (SSE) Stream**: Built a high-performance, real-time SSE stream (`/api/v1/activity/stream`) using the NestJS `@Sse` decorator and RxJS Observables. It broadcasts unified system activities with query-parameter-based event filtering at the server level.
- **Kafka-Driven Observability Bridging**: Configured the backend `SearchConsumer` to emit structured audit logs to the `ActivityService` subject upon consuming Kafka messages. This instantly links background messaging activity to active front-end listeners.
- **SSE Client & WebSocket Hybrid Resiliency**: Upgraded frontend `SystemPulseSidebar` to use a native EventSource client that operates in tandem with WebSockets. It prevents duplicates, manages reconnection seamlessly, and queries dynamic filters (`ALL`, `KAFKA_PRODUCED`, `KAFKA_CONSUMED`, `DB_COMMIT`).
- **Interactive Trace Details Drawer**: Added a spring-animated Framer Motion slide-in panel in the sidebar, displaying metadata, database changes, and distributed trace IDs. This provides direct deep-dive links into Jaeger tracing UI (port 16686).
- **High-Coverage Branch Assertions**: Expanded search module tests to cover fallback indexing branches and varying Elasticsearch search total hit structures, pushing branch coverage past the strict 80% CI quality gate.
- **Instant Frontend Navigation Search**: Implemented case-insensitive keyword search instantly in front-end `useCommandPalette` hook before triggering backend `Elasticsearch` query. This merges local page results dynamically and handles fail-safes gracefully if backend service drops out.
- **Strict React 19 / TS 5+ Types**: Handled React 19 type errors with logical operators by coercing `unknown` to `boolean` (e.g. `!!log.raw`) and using appropriate type assertions to ensure full compatibility under standard type checkers.
- **React 19 Virtualization:** Pure React custom virtual list provides extremely lightweight, high-performance rendering (60fps) for 1,000+ items while avoiding React 19 package manager peer dependency clashes.
- **Virtualized Keyboard Navigation:** Auto-scrolling focused items into the scroll container viewport is easily implemented by tracking `selectedIndex` changes and comparing item positions against container scroll bounds.

### Technical Resolutions (2026-05-16)

- **Elasticsearch v9 Integration:** `indices.create` no longer uses a `body` property; parameters are flattened.
- **Fuzzy Search:** `multi_match` with `fuzziness: 'AUTO'` and `prefix_length: 2` provides good balance between typo tolerance and performance. Boosting critical fields (e.g., `invoiceNumber^3`) improves result relevance.
- **E2E Testing:** Use `MockGuard` and `MockAuthModule` to bypass Keycloak in E2E tests. Ensure versioning is enabled in the test app if the controller uses `@Version`.

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
