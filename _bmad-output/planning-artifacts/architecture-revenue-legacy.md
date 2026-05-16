---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: ["prd.md", "ux-design-specification.md", "ux-api-mockups.html", "implementation-readiness-report-2026-05-11.md"]
workflowType: 'architecture'
project_name: 'sr-be-node-nest'
user_name: 'Anucha-tk'
date: '2026-05-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Identity & Access**: ระบบ Auth แบบ Hybrid (JWT/OIDC + API Keys) และ RBAC เพื่อรองรับทั้ง User และ External Services
- **Event-Driven Revenue**: การประมวลผลรายได้ผ่าน Kafka ที่ต้องรับประกันความถูกต้อง 100% (No duplicates)
- **Enterprise Analytics**: ระบบสรุปข้อมูลรายได้และแนวโน้มที่ต้องทำงานได้รวดเร็วบนฐานข้อมูลขนาดใหญ่

**Non-Functional Requirements:**
- **High-Performance Read**: รองรับข้อมูลระดับ 1M+ records โดยมี latency < 1s ผ่านการทำ Indexing และ Materialized Views
- **Audit-Ready**: ระบบ Audit log แบบ Immutable และการทำ Transaction Tracing ทั่วทั้งระบบ
- **Zero-Defect Quality**: บังคับใช้ Quality Gates (80% coverage) และ Clean Architecture อย่างเข้มงวด

**Scale & Complexity:**
- **Primary domain**: Fintech / Enterprise API
- **Complexity level**: High (Distributed Systems)
- **Estimated architectural components**: ~8-10 modules (Auth, Kafka, Revenue, Analytics, Audit, etc.)

### Technical Constraints & Dependencies
- **Runtime**: NestJS (Node.js)
- **Data**: Prisma ORM / PostgreSQL
- **Messaging**: Apache Kafka (Real-time processing)
- **Identity**: Keycloak (OIDC Provider)
- **Documentation**: Scalar UI

### Cross-Cutting Concerns Identified
- **Distributed Idempotency**: การป้องกันการคำนวณซ้ำซ้อนในสถาปัตยกรรมแบบ Event-driven
- **Observability**: การใช้ Correlation IDs และ Structured Logging เพื่อติดตาม Transaction ตั้งแต่ต้นจนจบ
- **Global Error Handling**: การส่งกลับ Rich Error Objects ตามมาตรฐาน UX Spec

## Starter Template Evaluation

### Primary Technology Domain

API/Backend (NestJS) based on project requirements analysis.

### Starter Options Considered

- **NestJS CLI (Official)**: Standard Express-based setup. Best for "Senior Showcase" due to flexibility and stability.
- **NestJS Fastify**: High-performance alternative, but the user opted for the standard Express adapter for now to ensure compatibility and standard patterns.

### Selected Starter: NestJS CLI (Standard Express)

**Rationale for Selection:**
The user has already initialized the project using the official NestJS CLI. This provides a clean, standard foundation that aligns with the requirement for "Senior Level" showcase development, allowing for full control over subsequent integrations (Prisma, Kafka, Keycloak).

**Initialization Command:**

```bash
nest new sr-be-node-nest
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript v5.x with default strictness.
- Node.js environment.

**Styling Solution:**
- N/A (Backend API).

**Build Tooling:**
- Webpack (Nest CLI default).

**Testing Framework:**
- Jest (configured for unit and e2e tests).

**Code Organization:**
- Standard NestJS Modular Architecture (src/main.ts, app.module.ts).

**Development Experience:**
- Hot reloading via npm run start:dev.
- Linting and formatting (ESLint/Prettier).

**Note:** Project initialization has been completed as the foundation for the architectural decisions.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Data Foundation**: ใช้ PostgreSQL 17 และ Prisma v7.8.0 ร่วมกับ `nestjs-zod` สำหรับการทำ Schema Validation ที่เข้มงวด
- **Security Backbone**: ใช้ Keycloak (OIDC) ร่วมกับ API Key Strategy (Custom Guard) เพื่อความปลอดภัยระดับ Enterprise
- **Event-Driven Core**: ใช้ Kafka ผ่าน NestJS Microservices และระบบ Idempotency เพื่อความแม่นยำของข้อมูลรายได้

**Important Decisions (Shape Architecture):**
- **Orchestration**: แยก Infrastructure (DB, Keycloak, Kafka) ออกเป็น Docker Containers เพื่อความง่ายในการจัดการ
- **Quality Standards**: บังคับใช้ Quality Gates ผ่าน Lefthook, Jest และ Supertest (E2E)
- **Observability**: ใช้ Pino สำหรับ Structured Logging และ Correlation IDs ทั่วทั้งระบบ

### Data Architecture
- **Database**: PostgreSQL 17 (LTS) - รันผ่าน Docker
- **ORM**: Prisma v7.8.0 - เน้น Type-safety และประสิทธิภาพการ Query 1M+ Records
- **Validation**: `nestjs-zod` - ป้องกันข้อมูลผิดพลาดตั้งแต่ระดับ Entry point
- **Migration**: Prisma Migrate

### Authentication & Security
- **Identity Provider**: Keycloak v26.6.1 (Dockerized)
- **Integration**: `nest-keycloak-connect` สำหรับการจัดการสิทธิ์ User/Admin
- **Service Access**: API Key Guard พร้อมการเก็บ Key แบบ Hashed ใน Database และระบบ Scopes
- **Encryption**: ข้อมูลที่อ่อนไหวจะถูกเข้ารหัสตามมาตรฐาน TLS 1.2+ และ DB Hashing

### API & Communication Patterns
- **Messaging**: Apache Kafka v4.2.0 - ประมวลผลธุรกรรมแบบ Asynchronous
- **Idempotency**: ระบบตรวจสอบ Message ID เพื่อป้องกันการคำนวณซ้ำ
- **Documentation**: Scalar UI (`@scalar/nestjs`) - เน้นประสบการณ์ที่ดีของนักพัฒนา
- **Consistency**: Global Exception Filter สำหรับการส่งกลับ Standard JSON Envelope

### Infrastructure & Deployment
- **Local Dev**: Docker Compose สำหรับรัน Services ทั้งหมด
- **Quality Control**: Lefthook (Git Hooks) และ 80% Test Coverage Target (Jest + Supertest)
- **Observability**: Pino Logging + Correlation IDs สำหรับการทำ Transaction Tracing
- **Config**: NestJS ConfigModule พร้อม Zod Validation สำหรับ `.env`


## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming Conventions:**
- **Tables**: `PascalCase` (เช่น `Invoice`, `SupplierRevenue`)
- **Columns**: `camelCase` (เช่น `invoiceId`, `totalAmount`)
- **Indexes**: `idx_{tableName}_{columnName}`

**API Naming Conventions:**
- **Endpoints**: `kebab-case` และเป็นพหูพจน์ (เช่น `/v1/supplier-revenues`)
- **Query Params**: `camelCase`
- **Versioning**: ต้องมี `v1/` นำหน้าเสมอ

**Code Naming Conventions:**
- **Files**: `kebab-case` พร้อม suffix (เช่น `revenue.controller.ts`, `create-revenue.dto.ts`)
- **Classes**: `PascalCase` (เช่น `RevenueService`)
- **Methods/Variables**: `camelCase`

### Structure Patterns

**Project Organization:**
- **Modular Architecture**: แยกตาม Feature (Domain-driven modules)
- **Shared**: Utilities ทั่วไปเก็บใน `src/common` หรือ `src/shared`

**File Structure Patterns:**
- **Tests**: Unit tests (`.spec.ts`) อยู่คู่กับไฟล์โค้ด, Integration/E2E อยู่ใน `test/`
- **DTOs**: อยู่ในโฟลเดอร์ `dto/` ภายในแต่ละ module

### Format Patterns

**API Response Formats:**
- ใช้ **Standard Envelope** ทุกครั้ง: `{ "success": true, "data": {}, "meta": {}, "error": null }`
- **Error Format**: `{ "code": "STRING", "message": "Human readable", "details": [] }`

**Data Exchange Formats:**
- **Date/Time**: ISO 8601 (UTC)
- **JSON Fields**: `camelCase`

### Communication Patterns

**Event System Patterns (Kafka):**
- **Event Naming**: `domain.action` (เช่น `invoice.paid`)
- **Payload**: ต้องมี `correlationId` และ `timestamp` เสมอ

### Process Patterns

**Error Handling Patterns:**
- ใช้ **Global Exception Filter** เพื่อแปลง Error ทั้งหมดให้เป็น Standard Envelope
- ห้ามใช้ `try-catch` แบบว่างเปล่า ต้องมี Logging (Pino) เสมอ


## Project Structure & Boundaries

### Complete Project Directory Structure

```text
sr-be-node-nest/
├── src/
│   ├── main.ts                 # Entry point & Scalar UI Config
│   ├── app.module.ts           # Root Module
│   ├── common/                 # Shared logic across modules
│   │   ├── decorators/         # Custom decorators (e.g. @GetUser)
│   │   ├── filters/            # Global Exception Filters (Envelope Standard)
│   │   ├── guards/             # API Key Guard, Keycloak Guards
│   │   ├── interceptors/       # Logging & Transform Interceptors
│   │   ├── middleware/         # Correlation ID Middleware
│   │   └── utils/              # Helper functions
│   ├── config/                 # Zod-validated Environment Config
│   ├── modules/                # Feature-based Modules (Bounded Contexts)
│   │   ├── auth/               # Keycloak & User Management
│   │   ├── revenue/            # Revenue Calculation & Idempotency
│   │   ├── invoice/            # Invoice & Payment tracking
│   │   ├── analytics/          # High-performance Analytics
│   │   └── kafka/              # Shared Kafka Producer/Consumer logic
│   └── shared/                 # Shared Services (e.g. PrismaService, PinoService)
├── prisma/
│   ├── schema.prisma           # Database Schema (PostgreSQL)
│   └── seed.ts                 # Large Dataset Seeding (1M+ records)
├── test/
│   ├── e2e/                    # Supertest scenarios
│   └── fixtures/               # Test data
├── docker-compose.yml          # Postgres, Keycloak, Kafka, Zookeeper
├── lefthook.yml                # Pre-commit Quality Gates
└── .env.example
```

### Requirements to Structure Mapping

- **Identity & Access (FR1-3)**: จัดการใน `modules/auth/` และ `common/guards/`
- **Event-Driven Revenue (FR4-10)**: หัวใจสำคัญอยู่ที่ `modules/revenue/` โดยใช้ `modules/kafka/` เป็นทางผ่านข้อมูล
- **Invoice Management (FR11-14)**: จัดการใน `modules/invoice/`
- **Enterprise Analytics (FR15-18)**: ใช้ `modules/analytics/` ในการทำ Query ข้อมูลขนาดใหญ่ (Materialized Views/Complex SQL)
- **API Documentation (FR19)**: ตั้งค่าที่ `main.ts` โดยใช้ Scalar UI

### Architectural Boundaries

- **Internal Boundary**: แต่ละ Module ใน `modules/` จะต้องคุยกันผ่าน **Services** เท่านั้น (Dependency Injection) ห้ามข้ามไปใช้ Controller ของกันและกัน
- **Data Boundary**: Prisma Client จะถูกห่อหุ้มด้วย `PrismaService` ใน `shared/` เพื่อให้ทุก Module ใช้สิทธิ์การเข้าถึงฐานข้อมูลผ่านจุดเดียว
- **External Boundary**: การติดต่อกับโลกภายนอก (Kafka/Keycloak) จะถูกจัดกลุ่มไว้ใน Module เฉพาะทาง เพื่อให้ง่ายต่อการ Mock ตอนทำ Testing


## Architecture Validation Results

### Coherence Validation ✅
- **Decision Compatibility**: เทคโนโลยีทั้งหมด (NestJS, Prisma, Kafka, Keycloak) เป็นมาตรฐาน Enterprise ที่ทำงานร่วมกันได้ดีเยี่ยม
- **Pattern Consistency**: กฎการตั้งชื่อและโครงสร้างไฟล์สอดคล้องกับแนวทาง Modular Architecture ของ NestJS
- **Structure Alignment**: โครงสร้างโฟลเดอร์รองรับทั้งการสเกลข้อมูล และการประมวลผลแบบ Event-driven

### Requirements Coverage Validation ✅
- **Functional Requirements**: ทุกข้อ (FR1-19) มีที่อยู่อย่างชัดเจนใน Module ต่างๆ
- **Non-Functional Requirements**: รองรับประสิทธิภาพด้วย Postgres 17 และความปลอดภัยด้วย Keycloak OIDC

### Implementation Readiness Validation ✅
- **Overall Status**: **READY FOR IMPLEMENTATION**
- **Confidence Level**: High

### Architecture Completeness Checklist
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries

**First Implementation Priority:**
- Initialize Docker Compose with PostgreSQL, Keycloak, and Kafka.

