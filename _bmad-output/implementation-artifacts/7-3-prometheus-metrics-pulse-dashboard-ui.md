# Story 7.3: Prometheus Metrics Pulse Dashboard UI

**Status**: ready-for-dev
**Epic**: [Epic 7: The Pulsing System (Enterprise Observability Showcase)](../planning-artifacts/epic-7-pulsing-system.md)

## 1. User Story
**As a** Senior Interviewer,
**I want** to see real-time infrastructure and application metrics (CPU, RAM, Throughput),
**So that** I can monitor the health and performance of the backend services.

## 2. Acceptance Criteria
- [ ] **FR-7.3.1**: New component `PrometheusDashboard` created in React.
- [ ] **FR-7.3.2**: Backend integration with `nestjs-prometheus` to expose `/metrics` endpoint.
- [ ] **FR-7.3.3**: Frontend fetches and displays real-time metrics using `Recharts`.
- [ ] **FR-7.3.4**: Visualizations include:
    - CPU Usage (%)
    - Memory Usage (MB)
    - Request Throughput (Req/sec)
    - Active WebSocket Connections
- [ ] **FR-7.3.5**: Glassmorphism UI consistent with the rest of the showcase.
- [ ] **FR-7.3.6**: Real-time updates every 5-10 seconds.

## 3. Technical Guardrails

### Backend (NestJS)
- **Packages**: `@willsoto/nestjs-prometheus`, `prom-client`.
- **Module**: `PrometheusModule` registered in `AppModule`.
- **Endpoint**: `/metrics` (exposed via public route or dedicated middleware).
- **Custom Metrics**:
    - `kafka_events_processed_total` (Counter)
    - `active_socket_connections` (Gauge)

### Frontend (React)
- **Location**: `frontend/src/components/PrometheusDashboard.tsx`
- **Charts**: Use `AreaChart` or `LineChart` from `Recharts`.
- **Polling**: `useEffect` with `setInterval` or use a dedicated hook for fetching metrics.
- **Data Transformation**: Parse Prometheus plain-text or use a JSON-ready metrics endpoint if available.

### UI/UX
- Use vibrant gradients for charts (Indigo, Purple, Emerald).
- Grid layout for multiple metrics.
- Tooltips and responsive legend.

## 4. Developer Notes

### Files to Modify
- `package.json` (Add backend deps)
- `src/app.module.ts` (Register Prometheus)
- `frontend/src/App.tsx` (Add new tab/view)
- `frontend/src/components/PrometheusDashboard.tsx` (New component)

### Existing Context
- `MetricsDashboard.tsx` is currently mapped to "Event Pulse". It should be renamed or the new dashboard should be added as a sub-tab.
- `Recharts` is already in the project dependencies.

## 5. Success Criteria
- [ ] `bun run check:full` passes.
- [ ] `/metrics` endpoint returns valid Prometheus data.
- [ ] Frontend charts update dynamically without page refresh.
