---
stepsCompleted:
  [
    'step-01-init',
    'step-02-discovery',
    'step-02b-vision',
    'step-02c-executive-summary',
    'step-03-success',
    'step-04-journeys',
    'step-05-domain',
    'step-06-innovation',
    'step-07-project-type',
    'step-08-scoping',
    'step-09-functional',
    'step-10-nonfunctional',
    'step-11-polish',
    'step-12-complete',
  ]
inputDocuments: ['JD.md', 'README.md']
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: 'api_backend'
  domain: 'fintech'
  complexity: 'high'
  projectContext: 'brownfield'
releaseMode: 'phased'
workflowType: 'prd'
---

## Executive Summary

The **Supplier Revenue Dashboard** is an enterprise-grade backend service designed to provide real-time financial insights for suppliers within a large-scale supply chain ecosystem. It addresses the critical challenge of processing massive volumes of transactional data from multiple sources while ensuring the highest standards of financial security and data integrity.

Built with **NestJS**, the system serves as a showcase for senior-level engineering practices, featuring a robust multi-layered security architecture, high-performance database management using **Prisma** and **PostgreSQL**, and comprehensive observability. The project is designed to handle complex business logic through scalable **MVC** and **Dependency Injection** patterns, making it audit-ready and highly maintainable for cross-functional international teams.

### What Makes This Special

This project distinguishes itself through a multi-dimensional focus on advanced enterprise requirements:

1. **Real-Time Event Processing**: Leveraging **Apache Kafka**, the system processes high-volume transactional events into real-time revenue metrics, demonstrating proficiency in distributed systems and asynchronous programming.
2. **Comprehensive Security & Identity**: The API implements a sophisticated security layer integrating **Keycloak (OAuth2/OIDC)** for JWT-based identity management alongside **API Key** authentication for service-to-service communication, enforced via custom NestJS Guards.
3. **Advanced Data Engineering**: Beyond simple CRUD, the system utilizes **Prisma** for complex financial aggregations and implements strategic **Database Indexing** to optimize query performance on massive datasets (1M+ records).
4. **Enterprise Observability**: A global implementation of **Structured Logging** (Winston/Pino) and **Global Exception Filters** ensures that every event is traceable and system health is transparent.
5. **Strict Quality Gates**: A full CI pipeline via **Lefthook** enforces 80%+ test coverage (Supertest/Jest), linting, and strict commit conventions, guaranteeing a "zero-defect" development lifecycle.

## Project Classification

- **Project Type**: API Backend (RESTful)
- **Domain**: Fintech / Enterprise Resource Management
- **Complexity**: High (Event-driven, distributed systems, strict security)
- **Project Context**: Brownfield (Expanding existing NestJS ecosystem)

## Success Criteria

### User Success

- **Interview Readiness**: ผู้พัฒนา (คุณ Anucha-tk) สามารถอธิบายรายละเอียดการติดตั้งและการทำงานของ Kafka, การเชื่อมต่อ Keycloak และการทำ SQL optimization ได้อย่างแม่นยำในการสัมภาษณ์ระดับ Senior.
- **Showcase Quality**: โปรเจกต์แสดงถึงมาตรฐาน "Senior Level" ผ่านโค้ดที่สะอาด สถาปัตยกรรมที่เป็นระบบ และเอกสารที่พร้อมสำหรับการนำเสนอสด.

### Business Success

- **Data Integrity**: ข้อมูลตัวเลขรายได้ต้องมีความแม่นยำ 100% แม้จะมีการประมวลผลแบบ Distributed Real-time ผ่าน Kafka.
- **System Trust**: ไม่พบช่องโหว่ด้านความปลอดภัยในการจัดการ JWT และ API Key; ผ่านเกณฑ์มาตรฐานความปลอดภัยภายใน.

### Technical Success

- **Quality Assurance**: มี Test Coverage ไม่ต่ำกว่า 80% ทั้ง Unit และ Integration tests โดยมีการบังคับผ่าน Quality Gates.
- **Latency Targets**: ระบบคำนวณรายได้ผ่าน Kafka ต้องประมวลผลเสร็จสิ้นภายในเวลา < 2 วินาที.
- **Developer Experience**: นโยบาย "Zero Broken Window" — บังคับใช้การตรวจ Lint, Format และ Commit conventions อย่างเข้มงวดผ่าน Lefthook.

## User Journeys

### Journey 1: Somsak - Real-Time Cash Flow Visibility

**Persona**: Somsak, a Supplier Owner managing a logistics fleet.

- **Goal**: Instantly see revenue updates to manage payroll liquidity.
- **Scenario**: When an invoice is marked "Paid" in the ERP, a Kafka event updates Somsak's dashboard immediately, allowing him to confirm driver payments.

### Journey 2: Sarah - Financial Audit & Transparency

**Persona**: Sarah, an Operations Admin managing thousands of suppliers.

- **Goal**: Trace discrepancies and verify calculation logic.
- **Scenario**: Sarah uses structured logs and trace IDs to follow the lifecycle of a disputed transaction, confirming the Kafka-driven calculation was accurate via an immutable audit trail.

### Journey 3: Dave - Third-Party Financial Integration

**Persona**: Dave, a Developer at a partner bank.

- **Goal**: Securely fetch supplier revenue history for loan approvals.
- **Scenario**: Dave registers for an API Key, reviews the Scalar UI (OpenAPI) docs, and successfully integrates the revenue history endpoint into the bank's credit scoring engine.

## Domain-Specific Requirements

### Compliance & Regulatory

- **Financial Audit Ready**: Maintain an immutable audit log of all revenue-impacting events.
- **Data Protection**: Compliance with regional data privacy laws (PDPA) regarding financial data.

### Technical Constraints

- **Message Idempotency**: Strict enforcement in Kafka consumers to prevent duplicate revenue calculations.
- **Transaction Integrity**: Use of ACID-compliant database transactions via Prisma/PostgreSQL.
- **Dual-Layer Security**: OIDC (Keycloak) for identity and secure API Keys for automated service integrations.

### Risk Mitigations

- **Event Loss Prevention**: Implementation of Dead Letter Queues (DLQ) in Kafka.
- **Calculation Drift**: Regular background reconciliation jobs to compare aggregated revenue against raw transaction logs.

## API Backend Specific Requirements

### Technical Architecture Considerations

- **Event-Driven Processing**: Use Kafka for consuming `invoice.paid` events asynchronously.
- **ACID Transactions**: Guarantee financial consistency during status updates.

### Endpoint Specification

- **Security**: `POST /auth/login` (Keycloak), `POST /auth/api-keys` (Management).
- **Revenue**: `GET /v1/suppliers/:id/revenue`, `GET /v1/invoices` (History with filtering).
- **Analytics**: `GET /v1/analytics/summary` (Complex aggregations), `GET /v1/analytics/trends` (Time-series).

### Interview Showcase: "The Million Record Challenge"

- **Massive Seeding Engine**: Script (`task db:seed-large`) to generate 1,000,000+ records via Batch Insert.
- **Optimization Showcase**: Advanced B-Tree indexing and Materialized Views for < 1s query time on 1M rows.
- **Explain Analyze**: Ready to demonstrate query execution plans to show deep database expertise.

## Functional Requirements (Capability Contract)

### Auth & Identity

- **FR1**: JWT-based login via Keycloak OIDC.
- **FR2**: Role-Based Access Control (RBAC) for Admin/Supplier roles.
- **FR3**: API Key management (Create/Revoke) for third-party developers.
- **FR4**: JWT verification for all protected routes.
- **FR5**: API Key validation for service-to-service calls.

### Revenue Tracking

- **FR6**: Real-time revenue balance visibility for Suppliers.
- **FR7**: Searchable/Filterable invoice history.
- **FR8**: Kafka consumer for "Invoice Paid" events.
- **FR9**: Guaranteed idempotency for Kafka message processing.
- **FR10**: ACID consistency for all financial data updates.

### Analytics & Reporting

- **FR11**: Aggregated revenue metrics across all suppliers for Admins.
- **FR12**: Revenue trend visualization data (Time-series).
- **FR13**: Custom date-range summary reports.
- **FR14**: JSON export of invoice history.

### Integrations & Audit

- **FR15**: Secure REST API for external consumers.
- **FR16**: Interactive OpenAPI/Scalar documentation.
- **FR17**: Rate limiting for external API endpoints.
- **FR18**: Immutable audit logging for financial transactions.
- **FR19**: Transaction tracing via Correlation IDs.
- **FR20**: Interactive Project Presentation (Mini React Frontend).
- **FR21**: Real-time Showcase of Backend Capabilities.

## Non-Functional Requirements

### Performance

- **NFR1**: Analytics queries on 1M+ records complete in **< 1,000ms**.
- **NFR2**: Kafka end-to-end processing latency **< 2,000ms**.
- **NFR3**: CRUD API response time **< 200ms** (P95).

### Security

- **NFR4**: Encryption of sensitive data at rest and in transit (TLS 1.2+).
- **NFR5**: **Zero Trust** model for internal service-to-service calls.
- **NFR6**: Short-lived JWTs with secure refresh token rotation.

### Quality & Reliability

- **NFR7**: 100% Data Integrity via idempotent event handling.
- **NFR8**: Immutable, append-only audit logs.
- **NFR9**: Minimum **80%** automated test coverage.
- **NFR10**: Adherence to NestJS best practices and Clean Architecture.

## Project Scoping & Phased Development

### Phase 1: MVP (Core Integrity)

- **Goal**: Prove real-time value with a "Zero-Defect" foundation.
- **Features**: CRUD API, Kafka consumer, Custom Security Guards, Lefthook CI, 80% coverage.

### Phase 2: Growth (Interview Showcase)

- **Goal**: Demonstrate senior-level expertise and high-volume performance.
- **Features**: 1M Record Seeding, Materialized Views, Full Keycloak integration, Transaction Tracing, Scalar UI.

### Phase 3: Vision (Scale)

- **Goal**: Enterprise maturity and observability.
- **Features**: Multi-tenancy, ELK/Datadog APM, Multi-region replication.

### Epic 5: Interactive Showcase (Frontend)

- **Goal**: Provide a high-fidelity visual demonstration of the system's capabilities.
- **Features**: React-based presentation layer, live metric dashboards, interactive architecture diagrams, and "Senior Showcase" walk-throughs.
