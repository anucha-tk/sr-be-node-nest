# Project Context: sr-be-node-nest

This document provides critical architectural rules, implementation patterns, and technical guidelines for the sr-be-node-nest project. AI agents MUST strictly adhere to these rules to ensure consistency and quality.

## 🚀 Project Identity & Goals

- **Project Name:** sr-be-node-nest (Supplier Revenue Dashboard Backend)
- **Goal:** High-performance, event-driven financial dashboard processing 1M+ records with sub-second latency.
- **Core Principles:** Speed as a Utility, Radical Transparency (Auditability), Zero-Defect Quality.

## 🛠️ Technology Stack

- **Framework:** NestJS (Standard Express Adapter)
- **Database:** PostgreSQL 17 (Running in Docker)
- **ORM:** Prisma v7.8.0 (Strict typing required)
- **Validation:** `nestjs-zod` + `zod` v4.4.3
- **Messaging:** Apache Kafka v4.2.0 (NestJS Microservices)
- **Identity:** Keycloak v26.6.1 (OIDC)
- **Documentation:** Scalar UI (`@scalar/nestjs`)
- **Logging:** Pino (`nestjs-pino`)

## 📏 Naming & Structure Standards

- **Files:** `kebab-case` with functional suffix (e.g., `revenue.service.ts`).
- **Classes:** `PascalCase` (e.g., `RevenueService`).
- **Variables/Methods:** `camelCase`.
- **Database Tables:** `PascalCase` (e.g., `Invoice`, `SupplierRevenue`).
- **Database Columns:** `camelCase`.
- **Database Indexes:** `idx_{tableName}_{columnName}`.
- **API Endpoints:** `v1/` prefix, `kebab-case` plural (e.g., `GET /v1/supplier-revenues`).
- **API Keys:** `camelCase`.

## 🛡️ Authentication & Security

- **Hybrid Model:** Keycloak (User/Admin) + API Key (Service-to-Service).
- **Default Policy:** Zero Trust (All routes protected by default unless marked `@Public()`).
- **RBAC:** Use `@Roles('admin')` for administrative actions.
- **API Key Storage:** Store hashed keys in database; never log raw keys.

## 📡 API Interaction Patterns (Standard Envelope)

All API responses MUST follow this structure:

```json
{
  "success": boolean,
  "data": any,
  "meta": {
    "timestamp": "ISO 8601 UTC",
    "executionTimeMs": number,
    "pagination": { "limit": number, "offset": number, "total": number } | null
  },
  "error": {
    "code": "BUSINESS_ERROR_CODE",
    "message": "Human readable message",
    "details": []
  } | null
}
```

- **Error Consistency:** Use Global Exception Filter to map all errors to this envelope.
- **Dates:** Always return ISO 8601 format in UTC.

## ⚙️ Event-Driven Rules (Kafka)

- **Idempotency:** Every event MUST be checked against a `ProcessedEvent` table using `eventId` before processing.
- **Observability:** Every event payload MUST include a `correlationId`.
- **Atomicity:** Balance updates and audit logging MUST occur within an ACID transaction.
- **Dead Letter Queue (DLQ):** Failed events must be routed to a DLQ for retry logic.

## 🧪 Quality Guardrails

- **Test Coverage:** Minimum 80% (Jest/Supertest).
- **Quality Gates:** Enforcement via Lefthook (Pre-commit lint/test).
- **Clean Architecture:** Feature-based modular structure (`src/modules/{feature}`).
- **Environment:** All `.env` variables MUST be validated via Zod at startup.

## 🛑 Critical Implementation Reminders

- **No Lying:** Never claim a feature is complete if it doesn't satisfy the Acceptance Criteria in the story.
- **No Magic Numbers:** Use constants or config values.
- **No Empty Try-Catch:** Every caught error must be logged with Pino and returned via Standard Envelope.
- **Performance:** Always use indexes for filtering on large datasets (1M+).
