---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["prd.md", "product-brief-elasticsearch.md", "ux-design-specification.md", "implementation-readiness-report-2026-05-16.md", "project-context.md"]
workflowType: 'architecture'
project_name: 'sr-be-node-nest'
user_name: 'Anucha-tk'
date: '2026-05-16'
lastStep: 8
status: 'complete'
completedAt: '2026-05-16'
---

# Architecture Decision Document: Elasticsearch Showcase

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Advanced Search Experience**: ระบบต้องรองรับการค้นหาผ่าน Command Palette (Cmd+K) ที่มีประสิทธิภาพสูงด้วย Elasticsearch (Autocomplete, Fuzzy, Relevance Scoring)
- **Asynchronous Data Ingestion**: การซิงค์ข้อมูลจาก PostgreSQL ไปยัง Elasticsearch ต้องผ่าน Kafka โดยใช้รูปแบบ Change Data Capture (CDC) เพื่อลดภาระของฐานข้อมูลหลัก
- **Insight Explorer Dashboard**: ระบบวิเคราะห์ข้อมูลที่ใช้ Elasticsearch Aggregations เพื่อคำนวณสถิติจากข้อมูลนับล้านชุดแบบ Real-time

**Non-Functional Requirements:**
- **Sub-second Performance**: Latency สำหรับการค้นหาต้อง < 100ms (p95) และการวิเคราะห์ข้อมูลต้อง < 1,000ms
- **Distributed Reliability**: การประมวลผล Kafka ต้องเป็นแบบ Idempotent และรองรับ Bulk Indexing ที่อัตรา > 10,000 docs/sec
- **Premium Observability**: สถาปัตยกรรมต้องเปิดเผยสถานะภายใน (Internal State) ผ่าน Dashboard รวมถึง Sync Lag และ Cluster Health

**Scale & Complexity:**
- โครงสร้างข้อมูลมีความซับซ้อนสูง เนื่องจากต้องจัดการ Mapping และ Analyzers ใน Elasticsearch ให้สอดคล้องกับธุรกิจ Fintech
- ต้องจัดการกับข้อมูลปริมาณมหาศาล (1M - 10M records) โดยไม่ลดทอนประสิทธิภาพ

- Primary domain: Fintech + Search & Analytics Engine
- Complexity level: High (Event-driven, Big Data Indexing)
- Estimated architectural components: ~6-8 Core Services (Ingestion, Search API, Analytics, Sync Monitor, etc.)

### Technical Constraints & Dependencies

- **Platform Constraints**: ต้องทำงานภายใต้ Bun Runtime และ NestJS v11
- **Data Foundation**: PostgreSQL 17 (Source of Truth) และ Elasticsearch 9.4.0 (Read Model)
- **Infrastructure**: ต้องรันผ่าน Docker Compose ทั้งหมดสำหรับการพัฒนาในเครื่อง (Local Dev)
- **Legacy Integration**: ต้องบูรณาการเข้ากับระบบ Service Registry เดิมที่มีอยู่แล้วในระบบ

### Cross-Cutting Concerns Identified

- **Schema Evolution**: การจัดการเมื่อ Schema ใน Postgres เปลี่ยนแปลงและต้องอัปเดต Elastic Index Mapping
- **Error Propagation**: การจัดการข้อผิดพลาดในระบบ Distributed (เช่น Kafka ล่ม หรือ Elastic Index เต็ม)
- **Performance Budgeting**: การควบคุม Resource usage ของ Elasticsearch ไม่ให้กระทบกับ Service อื่นๆ ในเครื่อง

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack (API-heavy Backend with Motion-rich Frontend)** based on project requirements analysis.

### Starter Options Considered

- **NestJS CLI (Official)**: มาตรฐานสำหรับการพัฒนา Backend ระดับ Enterprise รองรับการขยายตัว (Scalability) ได้ดีที่สุด
- **Vite React-TS Template**: มาตรฐานสำหรับการพัฒนา Frontend ที่รวดเร็วและรองรับ React 19 ได้อย่างสมบูรณ์
- **Aceternity UI / Magic UI (Optional)**: สำหรับใช้เป็น Library เสริมในส่วนของ Motion Components

### Selected Starter: NestJS CLI + Vite React-TS

**Rationale for Selection:**
เนื่องจากโปรเจกต์ต้องการแสดงความเป็น "Senior Showcase" การใช้เครื่องมือมาตรฐาน (Standard CLI) แล้วนำมาบูรณาการเทคโนโลยีที่ซับซ้อน (Kafka, Elasticsearch, Framer Motion) ด้วยตนเอง จะแสดงให้เห็นถึงความเข้าใจในระดับรากฐานได้ดีกว่าการใช้ Boilerplate สำเร็จรูปที่มีความซับซ้อนเกินไป

**Initialization Commands:**

**Backend (Manual Setup for Elastic):**
```bash
# Add Elasticsearch to existing NestJS project
bun add @nestjs/elasticsearch @elastic/elasticsearch
```

**Frontend (Modern Stack Setup):**
```bash
# Set up modern frontend stack
bun install framer-motion tailwindcss @tailwindcss/vite
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- **Bun v1.2+**: เป็น Runtime หลักเพื่อประสิทธิภาพสูงสุด
- **TypeScript v5.x**: พร้อม Strict Null Checks และ Named Exports

**Styling Solution:**
- **Tailwind CSS v4.0**: ใช้ CSS-first approach และรองรับการทำ Glassmorphism ได้ง่ายขึ้น

**Build Tooling:**
- **Vite v8.0**: เพื่อความรวดเร็วในขั้นตอน Development และการทำ HMR

**Testing Framework:**
- **Jest (Backend) & Vitest (Frontend)**: เพื่อรักษามาตรฐาน Coverage > 80%

**Code Organization:**
- **Feature-based Modular Structure**: แยกส่วนงานตาม Bounded Context (Search, Sync, Analytics)

**Development Experience:**
- **Docker Compose**: สำหรับการจัดการ Infrastructure (Postgres, Kafka, Elastic) ทั้งหมดในจุดเดียว

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Elasticsearch Indexing Strategy**: ใช้ **Manual Mapping** ร่วมกับ **Custom Analyzers (Edge N-gram)** เพื่อความแม่นยำของระบบ Autocomplete ใน Command Palette
- **Event-Driven CDC Pattern**: ใช้ **Kafka** เป็นตัวกลางในการ Sync ข้อมูลจาก PostgreSQL ไปยัง Elasticsearch แบบ Real-time โดยใช้ **Hard Delete** ใน Elastic เมื่อข้อมูลต้นทางถูกลบ (เพื่อความสะอาดของ Read Model)
- **High-Performance Analytics**: ใช้ **Elasticsearch Aggregations** สำหรับหน้า Dashboard เพื่อแสดงผลสถิติแบบ Real-time บนข้อมูล 1M+ records

**Important Decisions (Shape Architecture):**
- **Unified Search API**: ออกแบบ Endpoint เดียวที่รองรับการค้นหาข้าม Entity (Cross-entity Search) เพื่อรองรับประสบการณ์การใช้งานแบบ Command Palette
- **Server-Sent Events (SSE)**: ใช้สำหรับการทำ Live Activity Feed เพื่อลดความซับซ้อนและประหยัด Resource เมื่อเทียบกับ WebSockets

### Data Architecture

- **Elasticsearch (v9.4.0)**: ทำหน้าที่เป็น Read Model หลักสำหรับการค้นหาและวิเคราะห์ข้อมูล
- **Manual Mapping**: กำหนดฟิลด์ `keyword` สำหรับ ID/Status และ `text` พร้อม `edge_ngram` analyzer สำหรับชื่อและคำค้นหา
- **Bulk Indexing**: ใช้ระบบ Batch Processing ผ่าน Kafka เพื่อรองรับการนำเข้าข้อมูลขนาดใหญ่ (>10,000 docs/sec)

### Authentication & Security

- **Keycloak OIDC**: จัดการ Identity ทั่วทั้งระบบ โดย Elasticsearch Search API จะต้องมีการตรวจสอบสิทธิ์ (RBAC) ก่อนการเข้าถึง
- **Data Masking**: บังคับใช้ในระดับ Service Layer ก่อนส่งผลลัพธ์การค้นหาจาก Elasticsearch กลับไปยังผู้ใช้

### API & Communication Patterns

- **Search API (REST)**: รองรับพารามิเตอร์ `q` (query), `filters`, และ `page` โดยส่งกลับผลลัพธ์ในรูปแบบ Standard Envelope
- **Sync Lag Monitoring**: มี API พิเศษสำหรับตรวจสอบความหน่วงระหว่าง PostgreSQL และ Elasticsearch เพื่อความโปร่งใสในระบบ Distributed

### Infrastructure & Deployment

- **Docker-Compose Environment**: Infrastructure ทั้งหมด (Postgres, Kafka, Elastic 9.4.0, Keycloak) รันผ่าน Docker เพื่อความง่ายในการพัฒนาและ Demo
- **Health Indicators**: ทุก Service ต้องมี `/health` endpoint ที่ตรวจสอบสถานะการเชื่อมต่อกับ Elasticsearch และ Kafka

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where AI agents could make different choices (Naming, Indexing, Sync Logic, etc.)

### Naming Patterns

**Database Naming Conventions:**
- **Postgres Tables**: `PascalCase` (เช่น `ProcessedEvent`)
- **Postgres Columns**: `camelCase` (เช่น `eventId`)
- **Elasticsearch Indices**: `kebab-case` พร้อม versioning (เช่น `transactions-v1`)

**API Naming Conventions:**
- **Endpoints**: `kebab-case` พหูพจน์ (เช่น `/v1/search-analytics`)
- **Query Params**: `camelCase`

**Code Naming Conventions:**
- **Files**: `kebab-case.suffix.ts` (เช่น `elastic-sync.service.ts`)
- **Classes/Interfaces**: `PascalCase` (เช่น `SearchResponseDto`)

### Structure Patterns

**Project Organization:**
- **Feature Modules**: เก็บไว้ใน `src/modules/{feature_name}`
- **Search Definitions**: Mapping และ Analyzers เก็บใน `src/modules/search/definitions/`

**File Structure Patterns:**
- **Unit Tests**: อยู่คู่กับไฟล์หลัก (เช่น `search.service.spec.ts`)
- **DTOs**: อยู่ในโฟลเดอร์ `dto/` ภายในแต่ละโมดูล

### Format Patterns

**API Response Formats:**
- ใช้ออบเจกต์มาตรฐาน: `{ success: boolean, data: T, meta: any, error: any }`

**Data Exchange Formats:**
- **JSON**: `camelCase` สำหรับคีย์ทั้งหมด
- **Date/Time**: ISO 8601 (UTC) เสมอ

### Communication Patterns

**Event System Patterns:**
- **Topic Naming**: `showcase.{domain}.{action}`
- **Payload**: ต้องมี `correlationId`, `timestamp`, และ `actorId`

### Process Patterns

**Error Handling Patterns:**
- ใช้ **nestjs-pino** สำหรับการ Log ทุก Error พร้อม `correlationId`
- ห้ามคืนค่า Stack Trace ไปยัง Client

**Enforcement Guidelines:**
- ทุก AI Agent ต้องทำการเช็ค Idempotency ก่อนการประมวลผล Kafka Event
- ห้ามใช้ Default Export โดยเด็ดขาด

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
sr-be-node-nest/
├── src/
│   ├── main.ts                     # Entry point & Scalar UI Config
│   ├── app.module.ts               # Root Module
│   ├── common/                     # Global Shared logic
│   │   ├── decorators/             # @Public(), @Roles()
│   │   ├── filters/                # Global Exception Filters (Envelope Standard)
│   │   ├── guards/                 # Keycloak Guards
│   │   ├── interceptors/           # Pino Logging & Transform Interceptors
│   │   └── utils/                  # fetchApi, string helpers
│   ├── config/                     # Zod-validated Environment Config
│   ├── modules/                    # Feature-based Modules
│   │   ├── auth/                   # Keycloak & RBAC logic
│   │   ├── search/                 # Command Palette & Search API
│   │   │   ├── definitions/        # Elasticsearch Mappings & Analyzers
│   │   │   ├── search.controller.ts
│   │   │   └── search.service.ts
│   │   ├── sync/                   # Kafka CDC & Bulk Ingestion Engine
│   │   │   ├── kafka.consumer.ts
│   │   │   └── elastic-sync.service.ts
│   │   ├── analytics/              # Aggregations & Insight Engine
│   │   └── health/                 # Sync Lag & Cluster Status Monitoring
│   └── shared/                     # Cross-module shared services (PrismaService, ElasticService)
├── prisma/
│   ├── schema.prisma               # PostgreSQL Schema (Source of Truth)
│   └── seed.ts                     # 1M+ Records Seeding logic
├── docker/
│   ├── docker-compose.yml          # Postgres, Kafka, Elastic 9.4.0, Kibana
│   └── elasticsearch.yml           # Custom Elastic configuration
├── test/
│   ├── e2e/                        # Cross-module integration tests
│   └── fixtures/                   # Shared test data
├── .env.example
├── lefthook.yml                    # Quality Gate configuration
└── README.md
```

### Architectural Boundaries

**API Boundaries:**
- **External API**: ทุก API ต้องเข้าถึงผ่าน `/v1/` และถูกปกป้องด้วย Keycloak Guard หรือ API Key Guard
- **Data Boundary**: PostgreSQL คือ Source of Truth เพียงหนึ่งเดียว ส่วน Elasticsearch เป็น Read-only Model สำหรับ Search/Analytics เท่านั้น

**Service Boundaries:**
- การสื่อสารข้าม Module ต้องผ่าน **Service Injection** เท่านั้น ห้าม Module หนึ่งเรียกใช้ Controller ของอีก Module หนึ่งโดยตรง
- Shared Services (Prisma, Elasticsearch Client) จะถูกรวบรวมไว้ใน `shared/` module เพื่อการจัดการ Lifecycle ที่ดี

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- **Search Experience (FR1-6)**: `src/modules/search/`
- **Real-time Sync (FR7-12)**: `src/modules/sync/`
- **Analytics (FR13-16)**: `src/modules/analytics/`
- **Health Monitoring (FR17-18)**: `src/modules/health/`

### Integration Points

**Internal Communication:**
- ใช้ **Event-driven architecture (Kafka)** สำหรับการซิงค์ข้อมูลข้ามระบบเพื่อลดความหน่วงในขั้นตอน Write operation ของฐานข้อมูลหลัก

**Data Flow:**
1. User สร้างข้อมูล -> **Postgres** (ACID Transaction)
2. Postgres -> **Kafka Event** (Producer)
3. Kafka -> **Sync Engine** (Consumer)
4. Sync Engine -> **Elasticsearch** (Bulk Indexing)
5. User ค้นหา -> **Search API** -> **Elasticsearch** (Sub-second Read)

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** เทคโนโลยีทั้งหมดเป็นมาตรฐาน Enterprise และรองรับการทำงานแบบ Distributed ร่วมกันได้ดีเยี่ยม โดยเฉพาะการใช้ Kafka เป็นตัวกลางระหว่าง PostgreSQL และ Elasticsearch
**Pattern Consistency:** กฎการตั้งชื่อและโครงสร้างไฟล์สอดคล้องกันทั่วทั้งระบบ ช่วยลดโอกาสเกิด Code Conflict ระหว่าง AI Agents
**Structure Alignment:** โครงสร้างโฟลเดอร์รองรับการขยายตัว (Scalability) และแยกส่วนการทำงาน (Decoupling) ได้อย่างชัดเจน

### Requirements Coverage Validation ✅

**Feature/Epic Coverage:** ทุกฟีเจอร์หลัก (Search, Sync, Analytics) มีโมดูลรองรับอย่างชัดเจน
**Functional Requirements Coverage:** FR1-19 ได้รับการตรวจสอบและยืนยันว่ามี Architectural Support ครบทุกข้อ
**Non-Functional Requirements Coverage:** รองรับ Performance (<100ms) ด้วย Elasticsearch Indexing และรองรับ Reliability ด้วย Kafka Idempotency

### Implementation Readiness Validation ✅

**Decision Completeness:** การตัดสินใจที่สำคัญทั้งหมด (Versions, Mapping, Sync Logic) ถูกบันทึกไว้อย่างครบถ้วน
**Structure Completeness:** โครงสร้างโฟลเดอร์มีความเฉพาะเจาะจงและพร้อมสำหรับการเริ่มโปรเจกต์
**Pattern Completeness:** กำหนดรูปแบบการสื่อสารและจัดการข้อผิดพลาดไว้ชัดเจน

### Gap Analysis Results
- **Critical Gaps**: None
- **Important Gaps**: รายละเอียดปลิดย่อยของ Kafka Topic Configuration (เช่น Partitions, Retention) สามารถกำหนดได้ในขั้นตอน Implementation

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

### Architecture Readiness Assessment

**Overall Status:** **READY FOR IMPLEMENTATION**
**Confidence Level:** High

**Key Strengths:**
- การใช้ Event-driven CDC ที่ช่วยให้ข้อมูลสดใหม่อยู่เสมอ
- การออกแบบ Search Engine ที่เน้น User Experience (Cmd+K)
- มาตรฐานคุณภาพโค้ดที่เข้มงวด (Quality Gates & Idempotency)

### Implementation Handoff

**AI Agent Guidelines:**
- ปฏิบัติตามกฎการตั้งชื่อและโครงสร้างที่กำหนดไว้อย่างเคร่งครัด
- ทุกการประมวลผลข้อมูลต้องมีการตรวจสอบ Idempotency
- รักษาคุณภาพโค้ดด้วยการเขียน Unit Test ควบคู่เสมอ (Coverage > 80%)

**First Implementation Priority:**
```bash
# Initialize project with Elasticsearch and Kafka support
bun add @nestjs/elasticsearch @elastic/elasticsearch kafkajs
```
