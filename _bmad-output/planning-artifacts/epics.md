---
stepsCompleted: ["Step 1: Validate Prerequisites and Extract Requirements", "Step 2: Design Epic List", "Step 3: Generate Epics and Stories", "Step 4: Final Validation"]
inputDocuments: ["prd.md", "architecture.md", "ux-design-specification.md", "ux-api-mockups.html"]
---

# sr-be-node-nest - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for sr-be-node-nest, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: JWT-based login via Keycloak OIDC.
FR2: Role-Based Access Control (RBAC) for Admin/Supplier roles.
FR3: API Key management (Create/Revoke) for third-party developers.
FR4: JWT verification for all protected routes.
FR5: API Key validation for service-to-service calls.
FR6: Real-time revenue balance visibility for Suppliers.
FR7: Searchable/Filterable invoice history.
FR8: Kafka consumer for "Invoice Paid" events.
FR9: Guaranteed idempotency for Kafka message processing.
FR10: ACID consistency for all financial data updates.
FR11: Aggregated revenue metrics across all suppliers for Admins.
FR12: Revenue trend visualization data (Time-series).
FR13: Custom date-range summary reports.
FR14: JSON export of invoice history.
FR15: Secure REST API for external consumers.
FR16: Interactive OpenAPI/Scalar documentation.
FR17: Rate limiting for external API endpoints.
FR18: Immutable audit logging for financial transactions.
FR19: Transaction tracing via Correlation IDs.

### NonFunctional Requirements

NFR1: Analytics queries on 1M+ records complete in < 1,000ms.
NFR2: Kafka end-to-end processing latency < 2,000ms.
NFR3: CRUD API response time < 200ms (P95).
NFR4: Encryption of sensitive data at rest and in transit (TLS 1.2+).
NFR5: Zero Trust model for internal service-to-service calls.
NFR6: Short-lived JWTs with secure refresh token rotation.
NFR7: 100% Data Integrity via idempotent event handling.
NFR8: Immutable, append-only audit logs.
NFR9: Minimum 80% automated test coverage.
NFR10: Adherence to NestJS best practices and Clean Architecture.

### Additional Requirements

- **Starter Template**: NestJS CLI (Standard Express) already initialized.
- **Data Foundation**: PostgreSQL 17 + Prisma v7.8.0 + nestjs-zod for schema validation.
- **Security Backbone**: Keycloak (OIDC) integration + custom API Key Strategy Guard.
- **Event-Driven Core**: Apache Kafka via NestJS Microservices with distributed idempotency logic.
- **Orchestration**: Docker Compose for all infrastructure (DB, Keycloak, Kafka).
- **Quality Standards**: CI pipeline enforcement via Lefthook; minimum 80% coverage (Jest/Supertest).
- **Observability**: Structured logging (Pino) and Correlation IDs for transaction tracing.
- **Naming Conventions**: PascalCase Tables, camelCase Columns/API, kebab-case Files.

### UX Design Requirements

UX-DR1: Performance Perception - Near-zero latency feel for 1M+ records using optimized views and skeleton loaders.
UX-DR2: Real-Time Confidence - Live balance updates from Kafka without refresh.
UX-DR3: Efficient Filtering - Power filtering (limit, offset, total) for transaction lists.
UX-DR4: Seamless Auth - Integrated Keycloak/API Key experience.
UX-DR5: Standardized API DX - Consistent camelCase JSON, ISO 8601 dates, and rich error objects.
UX-DR6: API Documentation - Interactive Scalar UI with "Try it out" and help links in errors.
UX-DR7: Audit Transparency - Immutable audit trails linked to source Kafka events.

### FR Coverage Map

FR1: Epic 1 - JWT login via Keycloak
FR2: Epic 1 - Role-Based Access Control
FR3: Epic 1 - API Key management
FR4: Epic 1 - JWT verification
FR5: Epic 1 - API Key validation
FR6: Epic 2 - Real-time balance visibility
FR7: Epic 3 - Filterable invoice history
FR8: Epic 2 - Kafka consumer for payment events
FR9: Epic 2 - Idempotent processing
FR10: Epic 2 - ACID financial updates
FR11: Epic 4 - Aggregated admin metrics
FR12: Epic 4 - Revenue trend visualization
FR13: Epic 4 - Custom date-range reports
FR14: Epic 3 - JSON export for history
FR15: Epic 3 - Secure external REST API
FR16: Epic 1 - Interactive Scalar documentation
FR17: Epic 3 - API Rate limiting
FR18: Epic 2 - Immutable audit logging
FR19: Epic 2 - Transaction correlation IDs

## Epic List

### Epic 1: Secure Access & Documentation
Goal: Establish identity foundation and interactive documentation. Users can login via Keycloak and explore API via Scalar UI with proper RBAC.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR16.

### Epic 2: Real-time Revenue Tracking
Goal: Implement the core event-driven ingestion engine. Processes Kafka events to update supplier balance with high integrity and immutable audit logs.
**FRs covered:** FR6, FR8, FR9, FR10, FR18, FR19.

### Epic 3: Invoice History & Search
Goal: Provide deep transparency into financial transactions. Users can search, filter, and export invoice data under secure rate-limited conditions.
**FRs covered:** FR7, FR14, FR15, FR17.

### Epic 4: Enterprise Performance Analytics
Goal: Deliver high-scale financial insights. Admins see real-time aggregations and trends on 1M+ records with senior-level SQL optimization.
**FRs covered:** FR11, FR12, FR13.

## Epic 1: Secure Access & Documentation

Establish identity foundation and interactive documentation. Users can login via Keycloak and explore API via Scalar UI with proper RBAC.

### Story 1.1: Project Foundation & Infra Setup

As a Senior Developer,
I want a standardized containerized environment with core frameworks,
So that I can build enterprise features with consistent infrastructure.

**Acceptance Criteria:**

**Given** a new NestJS project
**When** I run `docker compose up`
**Then** PostgreSQL 17, Keycloak v26, and Kafka v4 are running and healthy
**And** Prisma client can successfully connect and run migrations to PostgreSQL
**And** `.env` variables are validated using Zod at application startup

### Story 1.2: Keycloak Identity & RBAC

As a Supplier Owner or Admin,
I want to authenticate via a centralized identity provider,
So that my financial data is protected by industry-standard OIDC.

**Acceptance Criteria:**

**Given** Keycloak is configured with a project realm
**When** I send a request to a `@Roles('admin')` protected endpoint with a valid Admin JWT
**Then** the request is allowed and my user identity is available in the request context
**And** a request without a valid JWT returns `401 Unauthorized` in the standard JSON envelope
**And** a Supplier attempting to access Admin-only routes returns `403 Forbidden`

### Story 1.3: API Key Security for Services

As a Third-Party Developer,
I want to use API Keys for service-to-service communication,
So that I can integrate with the revenue API without a user browser session.

**Acceptance Criteria:**

**Given** an active API Key exists for a service
**When** I call the API with `x-api-key` header
**Then** the custom `ApiKeyGuard` validates the hashed key against the database
**And** the request is authorized based on the assigned scopes
**And** invalid or revoked keys return `401 Unauthorized` with a clear error code

### Story 1.4: Interactive Scalar API Docs

As a Developer Consumer,
I want interactive, beautiful API documentation,
So that I can test endpoints and integrate with zero friction.

**Acceptance Criteria:**

**Given** the application is running
**When** I navigate to `/docs`
**Then** Scalar UI renders the OpenAPI v3 specification
**And** all security schemes (JWT OIDC and API Key) are documented and testable via "Try it out"
**And** the documentation includes the standard JSON response envelope structure

## Epic 2: Real-time Revenue Tracking

Implement the core event-driven ingestion engine. Processes Kafka events to update supplier balance with high integrity and immutable audit logs.

### Story 2.1: Kafka Consumer & Event Mapping

As a System Service,
I want to consume invoice payment events from Kafka,
So that I can trigger revenue calculations automatically.

**Acceptance Criteria:**

**Given** a Kafka producer sends an `invoice.paid` event
**When** the NestJS Microservice consumer receives the message
**Then** the message payload is validated against the Zod schema
**And** the event is successfully mapped to an internal `RevenueEventDto`
**And** failures are sent to a Dead Letter Queue (DLQ) for later recovery

### Story 2.2: Idempotent Revenue Engine

As a Supplier Owner,
I want to ensure my revenue is calculated exactly once per invoice,
So that my financial balance is always accurate.

**Acceptance Criteria:**

**Given** an `invoice.paid` event with a unique `eventId`
**When** the revenue service processes the event
**Then** it checks the `ProcessedEvent` table for the `eventId` to ensure idempotency
**And** it updates the `SupplierRevenue` balance using an ACID transaction
**And** attempting to process the same `eventId` again results in no balance change (skip)

### Story 2.3: Immutable Audit Trail

As a Financial Auditor,
I want an immutable record of every balance change,
So that I can trace the source of every revenue update.

**Acceptance Criteria:**

**Given** a successful revenue update transaction
**When** the balance is modified
**Then** a new entry is appended to the `RevenueAuditLog` table
**And** the log includes `correlationId`, `invoiceId`, `previousBalance`, `newBalance`, and `timestamp`
**And** the log entry is immutable (no update/delete allowed via API)

### Story 2.4: Fast Balance Visibility API

As a Supplier Owner,
I want to see my current revenue balance instantly,
So that I can make quick liquidity decisions.

**Acceptance Criteria:**

**Given** a Supplier is authenticated
**When** they call `GET /v1/suppliers/me/revenue`
**Then** the system returns the current balance in the standard JSON envelope
**And** the response time is `< 200ms` (P95)
**And** the metadata includes the `lastUpdated` timestamp from the latest Kafka event

## Epic 3: Invoice History & Search

Provide deep transparency into financial transactions. Users can search, filter, and export invoice data under secure rate-limited conditions.

### Story 3.1: Filterable Invoice History API

As a Supplier Owner,
I want to search and filter my invoice history,
So that I can reconcile payments and find specific transactions quickly.

**Acceptance Criteria:**

**Given** a million-record invoice dataset
**When** I call `GET /v1/invoices` with `status`, `startDate`, and `endDate` parameters
**Then** the system returns a paginated list using `limit` and `offset`
**And** the total count of matching records is included in the `meta.pagination` object
**And** the response time for filtering on indexed columns is `< 500ms`

### Story 3.2: API Rate Limiting

As a System Administrator,
I want to limit the number of API calls per user/key,
So that the system remains stable and responsive under high load.

**Acceptance Criteria:**

**Given** a rate limit of 100 requests per minute per API Key
**When** a consumer exceeds this limit
**Then** the system returns `429 Too Many Requests`
**And** the headers include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`
**And** the error body follows the standard JSON envelope with an `ERR_RATE_LIMIT_EXCEEDED` code

### Story 3.3: Standardized JSON Export

As a Supplier Owner,
I want to export my invoice history as a JSON file,
So that I can import my data into my own accounting software.

**Acceptance Criteria:**

**Given** I have filtered a set of invoices
**When** I call `GET /v1/invoices/export?format=json`
**Then** the system generates a JSON file containing all matching records
**And** the download is triggered with `Content-Type: application/json`
**And** the data structure matches the `InvoiceListItemDTO` schema

### Story 3.4: Consumer-Ready REST API

As a Third-Party Developer,
I want a consistent and predictable API interface,
So that I can integrate with minimal debugging effort.

**Acceptance Criteria:**

**Given** any API response (Success or Error)
**When** I receive the payload
**Then** it is wrapped in the `StandardEnvelope` (`success`, `data`, `meta`, `error`)
**And** all date-time fields follow the ISO 8601 (UTC) format
**And** all keys use `camelCase` naming convention
**And** error responses include a specific business code and a human-readable message

## Epic 4: Enterprise Performance Analytics

Deliver high-scale financial insights. Admins see real-time aggregations and trends on 1M+ records with senior-level SQL optimization.

### Story 4.1: Million-Record Seeding Engine

As a Performance Engineer,
I want to generate a massive, realistic financial dataset,
So that I can stress-test the analytics engine and validate latency targets.

**Acceptance Criteria:**

**Given** a clean PostgreSQL database
**When** I run `task db:seed-large`
**Then** the system generates 1,000,000+ records in the `Invoice` and `SupplierRevenue` tables
**And** the generation process uses batch inserts for efficiency
**And** the data is logically consistent (e.g., invoice sums match supplier balances)

### Story 4.2: Real-time Admin Summary API

As an Operations Admin,
I want a global overview of revenue across the entire platform,
So that I can monitor system-wide financial health.

**Acceptance Criteria:**

**Given** a database with 1M+ records
**When** I call `GET /v1/analytics/summary` as an Admin
**Then** the system returns total revenue, total pending, and supplier counts
**And** the query executes in `< 1,000ms`
**And** the results are wrapped in the standard JSON envelope with `meta.executionTimeMs`

### Story 4.3: Time-Series Trend Analysis

As an Operations Admin,
I want to see revenue trends over time,
So that I can identify growth patterns and seasonal fluctuations.

**Acceptance Criteria:**

**Given** historical invoice data
**When** I call `GET /v1/analytics/trends` with `granularity=monthly`
**Then** the system returns aggregated revenue totals grouped by month
**And** the response includes a comparison with the previous period (YoY/MoM)
**And** the data format is optimized for charting libraries (e.g., Chart.js/D3)

### Story 4.4: Advanced SQL & Index Optimization

As a Senior Database Architect,
I want to implement advanced PostgreSQL performance techniques,
So that complex analytics remains performant at any scale.

**Acceptance Criteria:**

**Given** a high-volume database
**When** analytical queries are executed
**Then** the system utilizes B-Tree indexes on search columns and Materialized Views for slow aggregations
**And** `EXPLAIN ANALYZE` confirms index-only scans or optimized plan paths for core endpoints
**And** the `lastRefreshed` timestamp is provided for all Materialized View data
