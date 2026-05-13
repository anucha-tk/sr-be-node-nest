---
title: 'Real-time WebSocket Audit Log'
type: 'feature'
created: '2026-05-13'
status: 'in-review'
baseline_commit: '6931c604022e0051ea36b409c7340eb1c88c7ea7'
epic_num: 6
story_num: 1
context: ['_bmad-output/project-context.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current Audit Trail uses a 3-second polling interval. This is inefficient and fails to demonstrate the real-time, event-driven nature of the Kafka-based backend.

**Approach:** Implement a Socket.io gateway in the backend to broadcast revenue audit logs instantly upon creation. Update the frontend to use a WebSocket client for live updates, removing the need for aggressive polling.

## Boundaries & Constraints

**Always:**
- Use `@nestjs/websockets` and `@nestjs/platform-socket.io` on the backend.
- Use `socket.io-client` on the frontend.
- Implement JWT-based authentication for the WebSocket connection using the existing Keycloak tokens.
- Ensure the WebSocket connection is established only when the user is authenticated.

**Ask First:**
- Should we implement room-based broadcasting (e.g., per supplier)? For the initial showcase, a global broadcast (for admins) or simple supplier-filtering on the client is acceptable.

**Never:**
- Do not bypass security; anonymous users must not receive audit log streams.
- Do not instantiate multiple Socket.io clients in the frontend; use a singleton or a dedicated hook/context.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Live Update | Kafka event processed -> DB saved | `audit_log_created` event emitted to client | Log and continue |
| Unauthenticated Conn | WebSocket connection without JWT | Connection rejected | `401 Unauthorized` |
| Connection Drop | Network failure | Client attempts reconnection | Auto-reconnect (Socket.io default) |

</frozen-after-approval>

## Code Map

- `src/modules/notifications/notifications.gateway.ts` -- WebSocket gateway for broadcasting events.
- `src/modules/notifications/notifications.module.ts` -- Module definition for notification services.
- `src/app.module.ts` -- Entry point for registering the new module.
- `src/modules/revenue/revenue.service.ts` -- Source of audit log events.
- `frontend/src/hooks/useWebSockets.ts` -- New hook for managing the socket connection.
- `frontend/src/components/AuditTrailView.tsx` -- Updated to listen for live events.

## Tasks & Acceptance

**Execution:**
- [x] `backend` -- Install `@nestjs/websockets @nestjs/platform-socket.io socket.io` -- Required dependencies for WS.
- [x] `src/modules/notifications/notifications.gateway.ts` -- Create gateway with JWT auth in `handleConnection` -- Core real-time hub.
- [x] `src/modules/notifications/notifications.module.ts` -- Define module and export gateway -- Dependency management.
- [x] `src/app.module.ts` -- Import `NotificationsModule` -- Integration.
- [x] `src/modules/revenue/revenue.service.ts` -- Inject `NotificationsGateway` and emit event in `processRevenue` -- Trigger broadcast.
- [x] `frontend` -- Install `socket.io-client` -- Frontend dependency.
- [x] `frontend/src/hooks/useWebSockets.ts` -- Implement socket singleton and event listener hook -- Frontend state management.
- [x] `frontend/src/components/AuditTrailView.tsx` -- Replace `setInterval` polling with WebSocket listener -- Live UI update.

**Acceptance Criteria:**
- Given an active WebSocket connection, when a revenue transaction is processed, then a new row appears in the Audit Trail instantly without any network requests visible in the 'Network' tab (after initial connection).
- Given no JWT token, when attempting to connect to the WebSocket, then the connection is refused by the backend.

## Verification

**Commands:**
- `npm run lint` -- expected: SUCCESS
- `npm run test` -- expected: All tests pass (including any new gateway tests)

**Manual checks (if no CLI):**
- Open Browser Console, observe "Socket.io" connection established.
- Trigger a transaction (via existing demo tools), see immediate update in Audit Trail.
