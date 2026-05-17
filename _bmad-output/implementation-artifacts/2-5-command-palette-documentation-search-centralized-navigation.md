---
story_id: "2.5"
story_key: "2-5-command-palette-documentation-search-centralized-navigation"
epic_id: "epic-2"
title: "CMD+K Documentation Search & Centralized Navigation"
status: "ready-for-dev"
last_updated: "2026-05-17"
---

# Story 2.5: CMD+K Documentation Search & Centralized Navigation

## User Story
**As a User,**
I want to search for system concepts, design analogies (like "สายพานลำเลียงพัสดุ"), and technical documentation keywords in the Command Palette,
**So that** I can instantly navigate to any section of the technical showcase or simulation dashboard.

## Acceptance Criteria
- [ ] **Centralized Configuration:** Create a single source of truth (`src/config/pages.ts`) containing all showcase pages, their labels, descriptions, and list of search keywords (e.g., "สายพาน", "พัสดุ", "idempotency", "Scalar").
- [ ] **Unified UI Consumption:** Refactor `App.tsx` (headers), `ShowcaseSidebar.tsx` (navigation menu), and `SystemPulseSidebar.tsx` to read titles and descriptions dynamically from the centralized config.
- [ ] **In-Memory Autocomplete Search:** Update `useCommandPalette` to perform keyword-based matching against the centralized page configuration on the frontend.
- [ ] **Result Merging:** Merge in-memory documentation matches with dynamic Elasticsearch API database query hits, displaying pages/documentation first as "Quick Navigation" results.
- [ ] **Actionable Routing:** Selecting a documentation search result must trigger the appropriate state transition (e.g., setting the active tab, opening the presentation view) and close the Command Palette.

## Technical Requirements
- **Configuration Path:** Create `frontend/src/config/pages.ts` exporting a `PAGES` array of objects: `{ id: string, title: string, subLabel: string, desc: string, keywords: string[], icon: any }`.
- **Search Logic:** Enhance `useCommandPalette.ts` to perform case-insensitive substring matching against `title`, `desc`, and `keywords`.
- **Result Types:** Assign `type: 'action'` to documentation results to distinguish them from standard database entities (`invoice`, `supplier`, `api-key`).

## File Structure
- `frontend/src/config/pages.ts` (New)
- `frontend/src/components/CommandPalette/CommandPalette.tsx` (Update)
- `frontend/src/components/ShowcaseSidebar.tsx` (Update)
- `frontend/src/hooks/useCommandPalette.ts` (Update)
- `frontend/src/App.tsx` (Update)

## Testing Requirements
- Unit tests for the search filtering logic inside `useCommandPalette.spec.ts`.
- Ensure frontend passes 100% build checks with `tsc --noEmit`.
