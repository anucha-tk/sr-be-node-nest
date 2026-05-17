---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
---

# Elasticsearch Interactive Showcase - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Elasticsearch Interactive Showcase, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can invoke the Command Palette via `Cmd+K`.
FR2: System provides instant suggestions (Autocomplete) while typing.
FR3: Support for Multi-match search across disparate entities (ApiKey, Invoice).
FR4: Fuzzy matching for misspelled queries.
FR5: Relevance scoring for result ranking.
FR6: Live activity feed without manual refreshes.
FR7: Automatic synchronization between PostgreSQL and Elasticsearch.
FR8: Immutable audit log for fintech compliance.
FR9: Event-type filtering (e.g., Creation, Deletion).
FR10: Statistical summaries (Aggregations) on 1M+ records dashboard.
FR11: Instant calculation of metrics (Sum, Avg, Histogram).
FR12: Interactive filtering (Faceting) with real-time chart updates.
FR13: Interactive Architecture view of data flow.
FR14: Live health status for Elasticsearch and Kafka.
FR15: Real-time monitor of synchronization lag.
FR16: Keycloak-based Authentication/Authorization.
FR17: Role-based data masking (RBAC) in search results.
FR18: Tiered Rate Limiting for high-compute endpoints.
FR19: Semantic API versioning (`/api/v1`).

### NonFunctional Requirements

NFR1: Latency: < 100ms for p95 autocomplete; < 200ms for full results; < 1,000ms for aggregations.
NFR2: Consistency: Data reflected in Elastic < 2,000ms after Postgres update.
NFR3: Failure Recovery: Idempotent Kafka consumers with offset management.
NFR4: Security: TLS 1.3 encryption and sensitive metadata masking at rest.
NFR5: Compliance: Immutable record of all financial events.
NFR6: Scalability: Support up to 10M records with minimal performance degradation.
NFR7: Volume: Support tiered bulk indexing rates of > 10,000 docs/sec.

### Additional Requirements

- **Starter Template**: NestJS CLI + Vite React-TS.
- **Elasticsearch Cluster (v8.17.3)** setup with Manual Mapping and Custom Analyzers (Edge N-gram).
- **Event-Driven CDC Pattern** using Kafka with Hard Delete in Elastic.
- **High-Performance Analytics** using Elasticsearch Aggregations.
- **Unified Search API** for Cross-entity Search.
- **Server-Sent Events (SSE)** for Live Activity Feed.
- **Keycloak OIDC integration**.
- **Docker-Compose for Infrastructure** (Postgres, Kafka, Elastic 8.17.3, Kibana).
- **Health Indicators (`/health`)** for Elasticsearch and Kafka status.
- **Mandatory Idempotency check** for Kafka events.
- **No default exports allowed**.

### UX Design Requirements

UX-DR1: Implement "Command Palette" (Cmd+K) search interface following the Linear/Stripe inspiration.
UX-DR2: Implement "Architecture Map" - interactive system diagram showing live data flow (Kafka status, etc.).
UX-DR3: Implement "Performance Lab" - visual comparison of query speeds (1M+ records).
UX-DR4: Implement "Security Vault" - interactive demonstration of Keycloak and API Key validation flows.
UX-DR5: Implement "Real-time Activity Feed" (Live Updates) using Server-Sent Events (SSE) with no-refresh updates.
UX-DR6: Use "Skeleton Loaders" for all data-fetching states to maintain "Speed as a Utility" perception.
UX-DR7: Implement "High-Density Minimalist Tables" using Inter font and optimized whitespace.
UX-DR8: Ensure "Near-zero latency" feeling for search and filtering of 1M+ records (using Virtualized Lists).
UX-DR9: Implement "Standardized API Response Envelopes" with `executionTimeMs` in metadata for performance transparency.
UX-DR10: Implement "Actionable Errors" in the UI, linking to help documentation for failed requests.

### FR Coverage Map

- FR1: Epic 2 - Command Palette Search
- FR2: Epic 2 - Command Palette Search
- FR3: Epic 2 - Command Palette Search
- FR4: Epic 2 - Command Palette Search
- FR5: Epic 2 - Command Palette Search
- FR6: Epic 3 - Real-Time Sync & Activity
- FR7: Epic 3 - Real-Time Sync & Activity
- FR8: Epic 3 - Real-Time Sync & Activity
- FR9: Epic 3 - Real-Time Sync & Activity
- FR10: Epic 4 - Analytics & Insights
- FR11: Epic 4 - Analytics & Insights
- FR12: Epic 4 - Analytics & Insights
- FR13: Epic 5 - Interactive Showcase
- FR14: Epic 5 - Interactive Showcase
- FR15: Epic 5 - Interactive Showcase
- FR16: Epic 1 - Project Foundation
- FR17: Epic 1 & 2 - Security & RBAC
- FR18: Epic 1 - Project Foundation
- FR19: Epic 1 - Project Foundation

## Epic List

### Epic 1: Project Foundation & Infrastructure
Initialize the project with all core infrastructure (Bun, NestJS, Postgres, Elastic, Kafka, Keycloak) and seed data. Ensures the environment is ready for sub-second search.
**FRs covered:** FR16, FR18, FR19

### Epic 2: Command Palette Search Experience (The Search Master)
Enable high-speed search via Cmd+K with autocomplete, fuzzy matching, and relevance scoring across disparate entities.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 3: Real-Time Event Synchronization (The Activity Stream)
Implement near real-time sync via Kafka CDC and a live activity feed via SSE to ensure data consistency without manual refreshes.
**FRs covered:** FR6, FR7, FR8, FR9

### Epic 4: Search Analytics & Data Insights (The Insight Explorer)
Provide real-time statistical summaries, metrics, and faceting using Elasticsearch aggregations on millions of records.
**FRs covered:** FR10, FR11, FR12

### Epic 5: Interactive Architectural Showcase
Create an interactive visual narrative of the system's architecture, live health status, and performance labs for demonstration.
**FRs covered:** FR13, FR14, FR15

## Epic 1: Project Foundation & Infrastructure

Initialize the project with all core infrastructure (Bun, NestJS, Postgres, Elastic, Kafka, Keycloak) and seed data. Ensures the environment is ready for sub-second search.

### Story 1.1: Project Initialization & Infrastructure Setup

As a Developer,
I want to initialize the NestJS project with Bun and Docker-Compose (Postgres, Elastic 8.x, Kafka, Kibana),
So that I have a complete and consistent development environment.

**Acceptance Criteria:**

**Given** a new Bun project
**When** I run `docker compose up`
**Then** Postgres, Elasticsearch, Kafka, and Kibana containers are running correctly
**And** NestJS can connect to all services via standard services

### Story 1.2: Core Identity & Security Integration

As a Developer,
I want to integrate Keycloak OIDC and implement RBAC guards,
So that sensitive financial data is protected and access is strictly controlled.

**Acceptance Criteria:**

**Given** a running Keycloak instance
**When** I call a protected API endpoint
**Then** the system validates the JWT and roles before allowing access
**And** it supports both `@Public()` and `@Roles()` decorators for flexibility

### Story 1.3: High-Volume Data Seeding Engine

As a Developer,
I want to create a seeding script for 1,000,000+ records in PostgreSQL,
So that we can test the system's performance at scale.

**Acceptance Criteria:**

**Given** an empty PostgreSQL database
**When** I run the seeding command
**Then** 1 million records (Transactions/Invoices) are created within a reasonable time (< 2 mins)
**And** the data is randomized and realistic for search testing

### Story 1.4: API Standards & Health Monitoring

As a Developer,
I want to implement a standard Response Envelope, Semantic Versioning, and Health checks,
So that the API is predictable, traceable, and easy to monitor.

**Acceptance Criteria:**

**Given** a standard API endpoint
**When** I call it via `/api/v1/`
**Then** the response follows the format `{ success, data, meta, error }`
**And** the `/health` endpoint shows the connection status of DB, Kafka, and Elasticsearch

## Epic 2: Command Palette Search Experience (The Search Master)

Enable high-speed search via Cmd+K with autocomplete, fuzzy matching, and relevance scoring across disparate entities.

### Story 2.1: Elasticsearch Mapping & Edge N-gram Analyzer

As a Developer,
I want to configure manual mapping and Edge N-gram analyzers in Elasticsearch,
So that the autocomplete is fast, accurate, and handles partial matches correctly.

**Acceptance Criteria:**

**Given** an empty Elasticsearch index
**When** I create the index with the specified manual mapping
**Then** the fields use the Edge N-gram analyzer for partial matching
**And** the mapping supports multiple entities (Invoices, Suppliers, etc.)

### Story 2.2: Command Palette Search API (Fuzzy & Multi-match)

As a Developer,
I want to implement a Search API supporting fuzzy matching, multi-match across entities, and relevance scoring,
So that users get the best possible results even with typos.

**Acceptance Criteria:**

**Given** data indexed in Elasticsearch
**When** I call the search API with a query `q`
**Then** the system returns fuzzy and multi-match results across entities
**And** results are ranked by their relevance score

### Story 2.3: CMD+K Search Interface (Frontend)

As a User,
I want to invoke the search interface via `Cmd+K` and navigate results via keyboard,
So that I can find information quickly without leaving the current context.

**Acceptance Criteria:**

**Given** the application UI
**When** I press `Cmd+K` (or `Ctrl+K`)
**Then** the Command Palette opens and focuses the search input
**And** I can navigate suggestions using arrow keys and select with Enter

### Story 2.4: Search Result Visualization & Performance UX

As a User,
I want to see search results in a high-density table with skeleton loaders,
So that the experience feels fast and professional even when loading large datasets.

**Acceptance Criteria:**

**Given** a search query is being processed
**When** the data is loading
**Then** skeleton loaders are displayed to maintain UI responsiveness
**And** results are rendered in a high-density table using a Virtualized List for performance

### Story 2.5: CMD+K Documentation Search & Centralized Navigation

As a User,
I want to search for system concepts, design analogies (like "สายพานลำเลียงพัสดุ"), and technical documentation keywords in the Command Palette,
So that I can instantly navigate to any section of the technical showcase or simulation dashboard.

**Acceptance Criteria:**

**Given** the Command Palette is open
**When** I search for a page concept or analogy keyword
**Then** the palette displays matching documentation pages under "Quick Navigation"
**And** selecting a documentation result routes me to the target tab instantly and closes the search menu

## Epic 3: Real-Time Event Synchronization (The Activity Stream)

Implement near real-time sync via Kafka CDC and a live activity feed via SSE to ensure data consistency without manual refreshes.

### Story 3.1: Event-Driven CDC Ingestion (Kafka Producer)

As a Developer,
I want to implement Kafka Producers in NestJS to emit events on PostgreSQL data changes,
So that downstream services can react to data changes in near real-time.

**Acceptance Criteria:**

**Given** a successful database transaction in Prisma
**When** the data is committed
**Then** the system emits a Kafka message with the change details and a Trace ID
**And** the message is sent to the appropriate domain topic

### Story 3.2: Idempotent Elastic Sync Consumer

As a Developer,
I want to implement Kafka Consumers that perform idempotent upserts/deletes in Elasticsearch,
So that the search index remains consistent with the source-of-truth without duplicate processing.

**Acceptance Criteria:**

**Given** a message in the Kafka topic
**When** the consumer processes the message
**Then** the Elasticsearch index is updated (Upsert/Delete) accordingly
**And** the system checks the `ProcessedEvent` table to ensure idempotency

### Story 3.3: Live Activity Feed API (SSE)

As a Developer,
I want to implement a Server-Sent Events (SSE) endpoint to stream live activity updates,
So that the frontend can receive real-time notifications without polling.

**Acceptance Criteria:**

**Given** an active SSE connection from a client
**When** a new system event occurs
**Then** the server streams the event data to the client immediately
**And** the API supports filtering by event type (Creation, Deletion, etc.)

### Story 3.4: Real-time Activity UI & Audit Trail

As a User,
I want to see a live activity feed with smooth animations and audit trail details,
So that I am always aware of the latest system changes.

**Acceptance Criteria:**

**Given** the application dashboard
**When** a new event is received via SSE
**Then** the activity feed updates with a smooth animation (Framer Motion)
**And** I can click on an activity item to see its full audit trail details

## Epic 4: Search Analytics & Data Insights (The Insight Explorer)

Provide real-time statistical summaries, metrics, and faceting using Elasticsearch aggregations on millions of records.

### Story 4.1: Elasticsearch Aggregation API (Stats & Metrics)

As a Developer,
I want to implement an API that uses Elasticsearch aggregations for statistical calculations (Sum, Avg, Histogram),
So that users can get high-speed insights from millions of records.

**Acceptance Criteria:**

**Given** high-volume data in Elasticsearch
**When** I call the analytics API
**Then** the system returns aggregation results (Sum, Avg, Count) in < 1,000ms
**And** it supports Date Histogram for time-series analysis

### Story 4.2: Interactive Faceting & Filter API

As a Developer,
I want to implement an API for dynamic faceting that allows users to drill down into search results,
So that users can find specific subsets of data intuitively.

**Acceptance Criteria:**

**Given** the Search API
**When** I provide `filters` parameters
**Then** the system returns filtered results along with updated aggregation counts (facets)
**And** it suggests available facet values based on the current search context

### Story 4.3: Insights Dashboard UI (Recharts Integration)

As a User,
I want to see a dashboard with interactive charts visualizing search insights,
So that I can quickly understand data trends and distributions.

**Acceptance Criteria:**

**Given** data from the Analytics API
**When** I open the Insights Dashboard
**Then** the system renders interactive charts (Recharts) for key metrics
**And** the charts are responsive and include smooth transitions when data changes

### Story 4.4: Real-time Chart Updates & Drill-down

As a User,
I want the charts to update instantly based on filter changes and support drilling down,
So that I can explore data interactively without delays.

**Acceptance Criteria:**

**Given** the Insights Dashboard with active filters
**When** I select a new filter value
**Then** the charts update immediately without page reloads
**And** clicking on a chart element (e.g., a bar) navigates to the corresponding filtered list view

## Epic 5: Interactive Architectural Showcase

Create an interactive visual narrative of the system's architecture, live health status, and performance labs for demonstration.

### Story 5.1: Interactive Architecture Map Component

As a Developer,
I want to create an interactive system diagram to illustrate the data flow between Postgres, Kafka, and Elasticsearch,
So that stakeholders can easily understand the complex system architecture.

**Acceptance Criteria:**

**Given** the system architecture metadata
**When** I open the Architecture page
**Then** a visual diagram (React Flow/SVG) is displayed
**And** clicking on nodes (e.g., Kafka) shows real-time status like topic names and message counts

### Story 5.2: Live Performance Lab & Benchmarking

As a User,
I want to see a live performance comparison between traditional DB queries and Elasticsearch on 1M+ records,
So that I can verify the speed advantages of the showcase.

**Acceptance Criteria:**

**Given** 1M+ records in both PostgreSQL and Elasticsearch
**When** I run a benchmark from the UI
**Then** the system displays a side-by-side comparison of execution times
**And** it highlights the performance gain (e.g., "10x faster")

### Story 5.3: Security & Identity Vault Demo

As a Developer,
I want to create an interactive demonstration of the security validation process (JWT & API Keys),
So that users can see the multi-layered security in action.

**Acceptance Criteria:**

**Given** the running authentication system
**When** I perform a test request in the showcase UI
**Then** the UI provides visual feedback for each validation step (Decoding, Role Check, etc.)
**And** any errors are displayed as "Actionable Errors" with remediation guidance

### Story 5.4: Presentation Mode & Storytelling UI

As a Developer,
I want a "Presentation Mode" that guides users through the project's highlights,
So that I can deliver smooth and effective live demonstrations.

**Acceptance Criteria:**

**Given** the functional showcase application
**When** I activate Presentation Mode
**Then** the UI guides me through pre-defined user journeys with brief explanations
**And** transitions between sections are smooth and visually engaging (Framer Motion)
