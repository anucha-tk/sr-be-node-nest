# Story 3.4: Real-time Activity UI & Audit Trail

Status: done

## Story

As a User,
I want to see a live activity feed with smooth animations and audit trail details,
so that I am always aware of the latest system changes.

## Acceptance Criteria

1. **SSE Integration**: The frontend connects to the backend SSE endpoint `/api/v1/activity/stream` to receive real-time system pulses.
2. **Smooth Animations**: The live traces sidebar animates new entries smoothly using Framer Motion.
3. **Trace Visualization**: Each activity item displays its Trace ID, event type, description, and deep dive links.
4. **Audit Trail Resolution**: Clicking on an activity item opens its comprehensive audit details, showing database balance adjustments.

## Tasks / Subtasks

- [x] Implement useSSE custom hook or EventSource integration in frontend (AC: 1)
- [x] Bind SSE connection to SystemPulseSidebar and AuditTrailView (AC: 1, 3)
- [x] Add smooth entry animations using Framer Motion (AC: 2)
- [x] Connect audit details drill-down on click (AC: 4)
