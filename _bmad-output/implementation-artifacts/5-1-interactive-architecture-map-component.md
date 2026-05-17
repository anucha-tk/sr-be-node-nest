# Story 5.1: Interactive Architecture Map Component

Status: done

## Story

As a Developer,
I want to create an interactive system diagram to illustrate the data flow between Postgres, Kafka, and Elasticsearch,
So that stakeholders can easily understand the complex system architecture.

## Acceptance Criteria

1. **Architecture View**: A visual diagram (React Flow/SVG) is displayed on the Architecture page.
2. **Interactive Nodes**: Clicking on nodes (e.g., Kafka, NestJS, Prisma, PostgreSQL) shows real-time status, tech specs, and official docs.
3. **Data Flow Animation**: Supports a simulated/test "beam of light" particle animation illustrating Kafka to NestJS to Prisma to Postgres flow.

## Tasks / Subtasks

- [x] Create ArchitectureDiagram.tsx in frontend components
- [x] Integrate `@xyflow/react` (React Flow) for interactive diagram node layout
- [x] Implement clickable nodes connecting to Tech Stack metadata drawer/panel
- [x] Add "Test Beam" Kafka event animation trigger and smooth visual connections
