# Retrospective: Epic 6 - Real-time WebSockets & Idempotency Showcase

**Date:** 2026-05-17  
**Epic:** 6  
**Status:** Complete  

---

## 🎯 Successes

- **JWT-Secured WebSocket Gateway:** Implemented a robust Socket.io gateway (`NotificationsGateway`) in NestJS, utilizing standard Keycloak JWT validation to secure all incoming client connections.
- **Resilient Frontend Socket Integration:** Created a dedicated hook `useWebSockets.ts` in the frontend, preventing connection leakage and handling reconnection.
- **Immediate Audit Trail Updates:** Successfully replaced the legacy 3-second polling mechanism with live WebSocket event broadcasts, achieving instantaneous UI updates on transaction commits.
- **Live Idempotency Demonstration:** Built an interactive simulation dashboard in the frontend (`IdempotencyView.tsx`) to show how the system detects and blocks duplicate payments under identical Kafka Event IDs.
- **Robust Exception Mapping:** Mapped duplicate errors (`P2002`) smoothly to a visual "Skipped" notification rather than crashing or bloating logs.

---

## 💡 Lessons Learned

- **Handshake Authorization:** Authenticating WebSockets requires parsing tokens during the connection handshake rather than relying on HTTP request headers, since web browser socket clients don't send standard headers.
- **Mock Gateway Cleanup:** Testing NestJS gateways requires careful disposal of socket server instances in the `afterAll` hook to prevent leaking active processes and timers in Jest.
- **Race Condition Prevention:** Ensuring event data flow (Kafka -> Database -> Socket Broadcast) operates in the correct transaction scope is critical to avoid the UI querying record details that aren't yet fully committed.

---

## 🚀 Final Deliverables Checked

1. **WebSocket Gateway:** Real-time event broadcasting verified via backend/frontend synchronization.
2. **Idempotency Engine:** Duplicate requests successfully intercepted, returning "skipped" status to clients.
3. **Audit Trail UI:** Poll-free instant row rendering working seamlessly on payment completion.

---

_Facilitated by Antigravity and the BMad Team._
