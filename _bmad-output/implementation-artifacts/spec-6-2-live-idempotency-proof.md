# Story 6-2: Live Idempotency Proof Showcase

## Objective
Demonstrate the backend's ability to handle duplicate requests safely using the Idempotency Engine (Kafka Event ID + Database Unique Constraint).

## Acceptance Criteria
1.  **Backend Simulation Endpoint**: A new endpoint `/v1/revenue/simulate` that allows triggering revenue processing manually.
2.  **Idempotency Feedback**: The `RevenueService` returns clear feedback when a duplicate event is detected.
3.  **Frontend UI Component**: A dedicated section "Live Idempotency Proof" with a "Trigger Double Payment" button.
4.  **Real-time Proof**:
    *   1st Click: UI shows "Success" and balance increases.
    *   2nd Click (identical payload): UI shows "Duplicate Detected" and balance remains unchanged.
5.  **Technical Proof**: Frontend displays the raw API response showing the "Skipped" status.

## Technical Details
-   **Endpoint**: `POST /v1/revenue/simulate`
-   **Service**: `RevenueService.processRevenue` refactored to return result status.
-   **WebSocket**: (Optional) Emit `idempotency_detected` event.
