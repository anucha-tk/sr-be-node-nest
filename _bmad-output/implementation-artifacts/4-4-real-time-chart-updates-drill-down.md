# Story 4.4: Real-time Chart Updates & Drill-down

Status: done

## Story

As a User,
I want the charts to update instantly based on filter changes and support drilling down,
So that I can explore data interactively without delays.

## Acceptance Criteria

1. **Interactive Refinements**: Changing filters or query inputs instantly updates the charts and stats in near-zero latency (< 200ms).
2. **Interactive Drill-down**: Clicking a chart element (e.g. status pie slice or supplier bar) instantly sets the dashboard's corresponding filter, dynamically re-aggregating all visualizations in real-time.
3. **Execution Transparency**: Displays the backend execution time in milliseconds (`executionTimeMs`) for search analytics query performance tracking.

## Tasks / Subtasks

- [x] Implement live search query & filters inside InsightsDashboard
- [x] Wire up click-handlers on Recharts segments (pie/bar) to update active filters
- [x] Integrate standard execution time indicator in stats header
