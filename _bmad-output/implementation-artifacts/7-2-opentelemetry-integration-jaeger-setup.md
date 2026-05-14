# Story 7.2: OpenTelemetry Integration & Jaeger Setup

**Status**: ready-for-dev
**Epic**: [Epic 7: The Pulsing System (Enterprise Observability Showcase)](../planning-artifacts/epic-7-pulsing-system.md)

## 1. User Story
**As a** Senior Interviewer,
**I want** to see the full journey of a transaction through the system (API -> Kafka -> Consumer -> DB),
**So that** I can verify the project's distributed tracing and observability capabilities.

## 2. Acceptance Criteria
- [ ] **FR-7.2.1**: Jaeger service added to `docker-compose.yml` (all-in-one image).
- [ ] **FR-7.2.2**: OpenTelemetry SDK and instrumentation installed in the backend.
- [ ] **FR-7.2.3**: Tracing initialized for NestJS (Express), Prisma, and Kafka.
- [ ] **FR-7.2.4**: Context propagation implemented to pass `traceId` through Kafka headers.
- [ ] **FR-7.2.5**: Spans created for core business logic (Revenue calculation, Audit logging).
- [ ] **FR-7.2.6**: Trace IDs logged in structured logs (Pino) for correlation.
- [ ] **FR-7.2.7**: Traces visible in Jaeger UI at `http://localhost:16686`.

## 3. Technical Guardrails

### Infrastructure
- **Jaeger**: Use `jaegertracing/all-in-one:latest`.
- **Expose Ports**: `16686` (UI), `4317` (OTLP gRPC), `4318` (OTLP HTTP).

### Backend (NestJS)
- **Dependencies**: 
  - `@opentelemetry/sdk-node`
  - `@opentelemetry/auto-instrumentations-node`
  - `@opentelemetry/exporter-trace-otlp-http`
  - `@opentelemetry/instrumentation-nestjs-core`
  - `@opentelemetry/instrumentation-http`
  - `@opentelemetry/instrumentation-kafkajs`
  - `@prisma/instrumentation`
- **Tracing Init**: Create `src/tracing.ts` and import it as the first line in `src/main.ts`.
- **Kafka Propagation**: Ensure `kafkajs` instrumentation is configured to inject/extract headers.

### Integration
- **Pino**: Update `LoggerModule` to include `traceId` and `spanId` in logs (using `nestjs-pino` auto-binding).

## 4. Developer Notes

### Files to Create/Modify
- `docker-compose.yml` (Infrastructure)
- `src/tracing.ts` (New file for OTel setup)
- `src/main.ts` (Entry point)
- `src/modules/notifications/notifications.gateway.ts` (To include traceId in pulse events)
- `package.json` (New dependencies)

### Existing Context
- We use `kafkajs` and `prisma`. Both have official or community OTel instrumentations.
- The system already has a correlation ID strategy; this should align or be superseded by OTel `traceId`.

## 5. Success Criteria
- [ ] `bun run check:full` passes.
- [ ] A transaction (Invoice Payment) generates a single trace with spans for all hops in Jaeger.
- [ ] Logs in terminal show matching `traceId` for producers and consumers.
