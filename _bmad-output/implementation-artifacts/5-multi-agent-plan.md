# Epic 5: Interactive Presentation & Showcase - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build premium React frontend to showcase project technical depth (Kafka, Keycloak, Performance).

**Architecture:** Vite-based SPA. Glassmorphism UI. Interactive Mermaid diagrams for arch. Live metrics via WebSocket/Polling. Framer Motion for transitions.

**Tech Stack:** React 18, Tailwind CSS v4, Framer Motion, Mermaid.js, Chart.js, Lucide Icons.

---

### Task 1: Frontend Scaffolding (Story 5.1)
**Files:**
- Create: `frontend/` (Vite project)
- Create: `frontend/src/styles/glassmorphism.css`
- Modify: `frontend/tailwind.config.js`

**Step 1: Initialize Vite**
Run: `npx create-vite@latest frontend --template react-ts`

**Step 2: Install Styles**
Run: `npm install -D tailwindcss @tailwindcss/vite framer-motion lucide-react`

**Step 3: Layout & Theme**
Implement responsive sidebar + main glassmorphism container.

**Step 4: Commit**
`feat: scaffold premium react frontend with tailwind v4`

---

### Task 2: Interactive Architecture Diagram (Story 5.2)
**Files:**
- Create: `frontend/src/components/ArchitectureDiagram.tsx`
- Create: `frontend/src/data/tech-stack.ts`

**Step 1: Mermaid Integration**
Install `mermaid`. Create component to render backend data flow (Kafka → Consumer → Prisma → PG).

**Step 2: Tech Stack Explorer**
Implement clickable nodes showing tech specs (e.g., "Prisma v7.8", "Keycloak OIDC").

**Step 3: Commit**
`feat: add interactive architecture visualization`

---

### Task 3: Live Metrics Dashboard (Story 5.3)
**Files:**
- Create: `frontend/src/components/MetricsDashboard.tsx`
- Create: `frontend/src/hooks/useLiveRevenue.ts`

**Step 1: API Integration**
Hook to `GET /v1/suppliers/me/revenue`. Implement polling (fallback) or WebSocket client.

**Step 2: Visualization**
Add Chart.js for P95 latency and balance trends.

**Step 3: Commit**
`feat: implement live metrics dashboard`

---

### Task 4: Presentation Mode (Story 5.4)
**Files:**
- Create: `frontend/src/components/PresentationMode.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: State Machine**
Define steps: [Intro, Auth, Kafka, Performance, Showcase].

**Step 2: Slide Transitions**
Use Framer Motion `AnimatePresence` for premium feel.

**Step 3: Commit**
`feat: add presentation mode with guided tour`
