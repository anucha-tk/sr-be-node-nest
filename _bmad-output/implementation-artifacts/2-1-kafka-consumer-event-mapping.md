# Story 2.1: Kafka Consumer & Event Mapping

## 📋 Overview
**User Story:**
As a System Service,
I want to consume invoice payment events from Kafka,
So that I can trigger revenue calculations automatically.

**Epic:** 2 (Real-time Revenue Tracking)
**Status:** done
**Priority:** High

## ✅ Acceptance Criteria
- [ ] **Given** a Kafka producer sends an `invoice.paid` event
- [ ] **When** the NestJS Microservice consumer receives the message
- [ ] **Then** the message payload is validated against the Zod schema
- [ ] **And** the event is successfully mapped to an internal `RevenueEventDto`
- [ ] **And** failures are sent to a Dead Letter Queue (DLQ) for later recovery

## 🛠️ Technical Context
- **Kafka Topic:** `invoice.paid`
- **Validation:** Use `zod` and `nestjs-zod`.
- **Payload Requirements:** Must contain `eventId`, `invoiceId`, `supplierId`, `amount`, `currency`, `correlationId`, and `timestamp`.
- **DLQ Pattern:** If validation or mapping fails, publish the raw message to `invoice.paid.dlq`.
- **Framework:** NestJS Microservices with Kafka transporter.

## 🏗️ Architecture Compliance
- **File Naming:** kebab-case (e.g., `invoice-paid.schema.ts`).
- **Module Structure:** 
  - `src/modules/kafka/`: Shared Kafka configuration and client.
  - `src/modules/revenue/`: Consumer logic and mapping.
- **Observability:** Ensure `correlationId` is logged with every incoming message using `Pino`.

## 🧪 Testing Requirements
- **TDD Mandatory:** Write tests in `revenue.controller.spec.ts` or similar before implementation.
- **Mocking:** Mock Kafka Client for unit tests.
- **Coverage:** Minimum 80% line coverage for the new logic.

## 📂 Implementation Plan
1. **Infrastructure:**
   - Ensure Kafka is running in `docker-compose.yml`.
   - Update `main.ts` to listen for microservice messages.
2. **Kafka Module:**
   - Create `KafkaModule` to provide Kafka clients for producer (DLQ) and consumer config.
3. **Revenue Module:**
   - Create `RevenueModule`.
   - Define `InvoicePaidSchema` (Zod).
   - Create `RevenueEventDto`.
   - Implement `RevenueController` with `@EventPattern('invoice.paid')`.
4. **Error Handling:**
   - Implement a filter or service logic to catch validation errors and route to DLQ.

## 📝 Developer Notes
- Every event payload MUST include a `correlationId` as per project rules.
- Use `Prisma` for any database checks if needed (though Story 2.2 handles the DB part, 2.1 focuses on the consumer).
- Refer to `_bmad-output/project-context.md` for standard response envelopes if any REST endpoints are added (none expected for this story).

---
**Status Note:** done (Patches applied and verified)

### Review Findings
- [x] [Review][Patch] Hardcoded broker default localhost:9092 [src/main.ts:47]
- [x] [Review][Patch] Hardcoded Kafka Topics and Client IDs [src/modules/kafka/kafka.constants.ts]
- [x] [Review][Patch] Zod schema precision and validation gaps [src/modules/revenue/schemas/invoice-paid.schema.ts]
- [x] [Review][Patch] Potential for large log entries from Zod errors [src/modules/revenue/revenue.controller.ts:31]
- [x] [Review][Patch] Missing error handling for microservice connection [src/main.ts:43]
- [x] [Review][Defer] Missing fallback for DLQ emit failure [src/modules/revenue/revenue.controller.ts:40] — deferred, pre-existing
