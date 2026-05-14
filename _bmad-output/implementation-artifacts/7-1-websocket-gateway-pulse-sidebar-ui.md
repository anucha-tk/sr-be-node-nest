# Story 7.1: WebSocket Gateway & Pulse Sidebar UI

**Status**: ready-for-dev
**Epic**: [Epic 7: The Pulsing System (Enterprise Observability Showcase)](../planning-artifacts/epic-7-pulsing-system.md)

## 1. User Story
**As a** Senior Interviewer,
**I want** to see a live stream of system events in a dedicated sidebar,
**So that** I can visualize the asynchronous nature of the Kafka-driven backend.

## 2. Acceptance Criteria
- [ ] **FR-7.1.1**: New right-side sidebar component `SystemPulseSidebar` created in React.
- [ ] **FR-7.1.2**: Sidebar is collapsible/expandable with smooth Framer Motion transitions.
- [ ] **FR-7.1.3**: Sidebar displays real-time "Pulse" cards (Kafka events, system status).
- [ ] **FR-7.1.4**: NestJS `NotificationsGateway` updated to broadcast `system.pulse` events.
- [ ] **FR-7.1.5**: Sidebar maintains a scrollable history of the last 20 events.
- [ ] **FR-7.1.6**: Integration with `App.tsx` layout (Right-aligned, glassmorphism theme).

## 3. Technical Guardrails

### Backend (NestJS)
- **Location**: `src/modules/notifications/notifications.gateway.ts`
- **Pattern**: Add `notifySystemPulse(payload: any)` method.
- **Event Name**: `system_pulse`.
- **Payload Shape**:
  ```typescript
  {
    type: 'KAFKA_PRODUCED' | 'KAFKA_CONSUMED' | 'DB_COMMIT' | 'TRACE_STARTED',
    label: string,
    timestamp: string, // ISO 8601
    metadata: Record<string, any> // Includes traceId if available
  }
  ```

### Frontend (React)
- **Location**: `frontend/src/components/SystemPulseSidebar.tsx`
- **Hook**: Use `useSocket` (if exists) or local `socket.io-client` connection.
- **Styling**: Tailwind CSS v4, `glass-panel` class, Framer Motion for entrance/exit.
- **State**: `useState` for events array, `useEffect` for socket listener.

### UI/UX
- Right sidebar width: `320px` (expanded), `0px` (collapsed/hidden).
- "Pulse" effect: Border or shadow glow when new event arrives.
- Clear icons for different event types (using `lucide-react`).

## 4. Developer Notes

### Files to Modify
- `src/modules/notifications/notifications.gateway.ts` (Backend)
- `frontend/src/App.tsx` (Frontend Layout)
- `frontend/src/components/SystemPulseSidebar.tsx` (New Component)

### Existing Context
- `NotificationsGateway` already handles `audit_log_created` and `balance_updated`.
- `App.tsx` currently has a left sidebar (`ShowcaseSidebar`). This story adds the right one.
- The `SystemPulseSidebar` should be toggleable, perhaps via a new button in the header or the existing sidebar.

## 5. Success Criteria
- [ ] `npm run check:full` passes (80% coverage).
- [ ] WebSocket connection stable between frontend/backend.
- [ ] Visual pulse animation triggers on new Kafka events.
