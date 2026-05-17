---
story_id: "2.3"
story_key: "2-3-cmd-k-search-interface-frontend"
epic_id: "epic-2"
title: "CMD+K Search Interface (Frontend)"
status: "ready-for-dev"
last_updated: "2026-05-16"
---

# Story 2.3: CMD+K Search Interface (Frontend)

## User Story
**As a User,**
I want to invoke the search interface via `Cmd+K` and navigate results via keyboard,
**So that** I can find information quickly without leaving the current context.

## Acceptance Criteria
- [ ] **Given** the application UI, **When** I press `Cmd+K` (or `Ctrl+K`), **Then** the Command Palette opens and focuses the search input.
- [ ] **Given** the Command Palette is open, **When** I type in the search box, **Then** it debounces and calls the Search API (`/api/v1/search?q=...`).
- [ ] **Given** search results are returned, **When** I use arrow keys, **Then** I can navigate through the suggestions.
- [ ] **Given** a result is selected, **When** I press `Enter`, **Then** it navigates to the relevant section or performs the action.
- [ ] **Given** data is loading, **When** waiting for API response, **Then** skeleton loaders are displayed.

## Technical Requirements
- **Trigger:** Global event listener for `meta+k` and `ctrl+k`.
- **UI Component:** `CommandPalette` component using `AnimatePresence` and `framer-motion`.
- **Styling:** Tailwind 4 with `glass-panel` utility. Dark mode support.
- **Icons:** `Lucide React` (Search, FileText, User, Hash icons).
- **API Integration:** Use `fetchApi` from `@/api.ts` to call `/api/v1/search`.
- **Keyboard Nav:** Implement `onKeyDown` handler for `ArrowUp`, `ArrowDown`, and `Enter`.
- **Performance:** Use `useDeferredValue` or `debounce` for search input. Use a virtualized list if results > 50 (optional for this story, but recommended).

## Architecture Compliance
- Use React 19 functional components.
- No default exports.
- Components in `src/components/CommandPalette/`.
- Hooks in `src/hooks/useCommandPalette.ts`.

## File Structure
- `frontend/src/components/CommandPalette/CommandPalette.tsx` (New)
- `frontend/src/components/CommandPalette/SearchInput.tsx` (New)
- `frontend/src/components/CommandPalette/SearchResultItem.tsx` (New)
- `frontend/src/hooks/useCommandPalette.ts` (New)
- `frontend/src/App.tsx` (Update to include CommandPalette)

## Testing Requirements
- Unit tests for `useCommandPalette` hook (keyboard navigation logic).
- Component tests for `CommandPalette` (rendering, open/close).
- Coverage >= 80%.
