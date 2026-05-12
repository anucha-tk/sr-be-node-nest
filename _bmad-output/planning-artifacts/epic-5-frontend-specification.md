# Epic 5: Premium Showcase Frontend - Detailed Specification

> **Status:** Planning / Refinement
> **Owner:** Anucha-tk
> **Purpose:** To provide a visual-first, technical demonstration of the `sr-be-node-nest` backend capabilities (Kafka, Keycloak, PostgreSQL performance) through a high-fidelity React application.

---

## A. Visual Identity & Rich Aesthetics

### 1. Design System: "Midnight Obsidian"

- **Background:** Deep dark slate (`#020617`) with a subtle radial gradient.
- **Glassmorphism:**
  - `background: rgba(255, 255, 255, 0.03)`
  - `backdrop-filter: blur(16px)`
  - `border: 1px solid rgba(255, 255, 255, 0.1)`
- **Typography:**
  - Headers: **Outfit** (Modern, Geometric)
  - Data/Metrics: **JetBrains Mono** (Technical, Precise)
- **Palette:**
  - Primary: Indigo-500 (`#6366f1`) - Action items and tech-flow paths.
  - Success: Emerald-400 - Kafka events and balance updates.
  - Accent: Amber-400 - Highlights and code snippets.

### 2. Micro-interactions (Framer Motion)

- **Component Entrance:** All cards use `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` with a staggered delay of `0.1s`.
- **The "Event Pulse":** When a new metric update is received:
  - The balance text scales up (`scale: 1.05`) for `200ms`.
  - A subtle outer glow pulses in Emerald-400.
- **Hover States:** Glass panels elevate with `whileHover={{ y: -8, scale: 1.01 }}` and increase border opacity.

---

## B. The "Wow" Features (Technical Deep-Dive)

### 1. Interactive Architecture Visualizer

- **Tooling:** React-Flow (Interactive Nodes).
- **Nodes:**
  - **Kafka Producer (Simulated):** Triggers the flow.
  - **Kafka Topic:** Shows "Queue Depth" (simulated or real).
  - **NestJS Consumer:** Shows "Processing" status and latency metrics.
  - **PostgreSQL / Prisma:** Shows the final storage.
- **Interaction:** Clicking a node opens a slide-over panel with:
  - **Technical Specs:** Versions and patterns used (e.g., "Strategy: Idempotent Consumer").
  - **Code Preview:** Direct snippet from the backend codebase (using `highlight.js`).

### 2. Live Kafka "Beam" Animation

- **Visual:** A particle effect or "beam of light" that physically travels along the connectors in the Architecture Map when a simulation button is pressed.
- **Logic:** Follows the actual event lifecycle: `Production -> Ingestion -> Persistence`.

### 3. "The Million Record" Performance Lab

- **Goal:** Prove the backend's P95 latency targets (<1s for 1M rows).
- **UI:** A split-screen comparison:
  - **Left Side:** Result of a query on non-indexed columns (Simulated slow path).
  - **Right Side:** Result of the optimized backend API `GET /v1/analytics/summary`.
- **Live Counter:** A stopwatch animation that shows the execution time in milliseconds, matching the `meta.executionTimeMs` from the backend.

---

## C. Presentation Mode (The Narrative)

### 1. Presentation Controls

- A "Play" button in the header that enters **Guided Mode**.
- Previous / Next controls with keyboard support (Arrow keys).

### 2. The Storyline Script

1.  **Slide 1: The Challenge**: Presenting the scale (1M+ records) and security requirements of a fintech system.
2.  **Slide 2: Identity & Security**: Demonstration of Keycloak login and API Key-based access to the revenue data.
3.  **Slide 3: Event-Driven Heart**: Simulate a transaction. Show the "Beam" animation through Kafka. Highlight the "exactly-once" processing logic.
4.  **Slide 4: Performance Benchmarking**: Run the 1M record analytics query. Show the P95 latency results compared to standard queries.
5.  **Slide 5: Audit & Integrity**: Open the "Audit Trail" view. Show the immutable log entry created by the transaction in Slide 3.

### 3. Interviewer "Key Takeaways" Sidebar

- In Presentation Mode, a dedicated sidebar shows talking points for the developer:
  - _"Mention: We use Zod for Kafka message validation to prevent poisoned pills."_
  - _"Mention: The database uses B-Tree indexes on indexed columns to maintain sub-second latency."_

---

## Implementation Roadmap (Enhanced)

1.  **Refine Design Tokens:** Update `index.css` and `tailwind.config.js` with the Midnight Obsidian palette.
2.  **Architecture Map 2.0:** Replace static images with an interactive React-Flow diagram.
3.  **Real-time Hook Enhancement:** Implement the Kafka "Beam" trigger in `MetricsDashboard.tsx`.
4.  **Presentation UI:** Create the slide-based state machine for Presentation Mode.
