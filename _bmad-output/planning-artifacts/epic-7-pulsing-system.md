# Epic 7: The Pulsing System (Enterprise Observability Showcase)

**Status**: Planning / Draft
**Goal**: ยกระดับระบบจาก "Financial Dashboard" สู่ "Enterprise-grade Observable System" โดยการเปลี่ยนการประมวลผลหลังบ้านที่มองไม่เห็น ให้กลายเป็นภาพ Real-time Pulse ที่แสดงถึงความเสถียรและประสิทธิภาพของระบบ Kafka และ Distributed Tracing.

---

## 1. Architectural Vision

เราจะใช้สถาปัตยกรรมแบบ **"Full-stack Observability"**:
- **Producer Level**: ทุกครั้งที่มีการสร้าง Invoice หรือ Update สถานะ ระบบจะส่ง Kafka Event พร้อม `traceId`.
- **Transmission Level**: ข้อมูลจะไหลผ่าน Kafka Topic ที่มีลิมิตและความปลอดภัยสูง.
- **Consumer Level**: NestJS จะประมวลผลข้อมูลและส่ง "Pulse Notification" ผ่าน **WebSockets (Socket.io)** ไปยัง Frontend ทันที.
- **Tracing Level**: ใช้ **OpenTelemetry** เชื่อมต่อทุก Hop (API -> Kafka -> Consumer -> DB) และแสดงผลใน **Jaeger**.
- **Metrics Level**: เก็บสถิติ TPS (Transactions Per Second) ส่งไปยัง **Prometheus** และ **Grafana**.

---

## 2. Functional Requirements (Capability Contract)

### 7.1: Live Pulse Sidebar (Frontend)
- **FR-7.1.1**: เพิ่ม Side-panel ด้านขวาใน React ที่ "หด-ขยาย" ได้.
- **FR-7.1.2**: แสดง Real-time Stream ของ Kafka events (เช่น `[PRODUCED] Invoice #123`, `[CONSUMED] Revenue Updated`).
- **FR-7.1.3**: เมื่อคลิกที่ Event ใน Sidebar ต้องแสดง **Trace ID** และลิงก์ไปยัง Jaeger เพื่อดูรายละเอียดเชิงลึก.

### 7.2: Distributed Tracing (Backend)
- **FR-7.2.1**: ติดตั้ง OpenTelemetry Instrumentation สำหรับ NestJS, Prisma, และ Kafka.
- **FR-7.2.2**: รองรับ **Context Propagation** เพื่อให้ Trace ID เดินทางข้ามจาก API Producer ไปยัง Microservice Consumer ผ่าน Kafka Headers ได้.
- **FR-7.2.3**: บันทึก "Span" ของการทำงานที่สำคัญ (เช่น Database query time, Kafka delivery time).

### 7.3: Technical Pulse Dashboard
- **FR-7.3.1**: แสดงกงล้อความเร็ว (TPS Gauge) ใน UI เพื่อบอกว่าระบบกำลังประมวลผลอยู่กี่รายการต่อวินาที.
- **FR-7.3.2**: แสดงกราฟ Latency ของ Kafka แบบ Real-time.

---

## 3. User Journey: The "Senior" Interview Demo

1. **The Pulse**: ผู้พัฒนาเปิดหน้าจอ Showcase และขยาย Side-panel "System Pulse" ออกมา.
2. **The Action**: กดปุ่ม "Simulate Million Record Pulse".
3. **The Reaction**: Side-panel จะเริ่ม "เต้น" (Pulse) ตามจังหวะ Kafka Events ที่ไหลเข้ามาแบบวินาทีต่อวินาที พร้อมกราฟ TPS ที่พุ่งสูงขึ้น.
4. **The Deep Dive**: ผู้พัฒนาคลิกที่ Event หนึ่งใน Sidebar และระบบพาไปยังหน้า **Jaeger UI** เพื่อโชว์ว่า "ดูนี่สิ ข้อมูลเดินทางจาก API ผ่าน Kafka และไปจบที่ DB ภายใน 45ms โดยไม่มีข้อมูลตกหล่น".

---

## 4. Implementation Stories

- **Story 7.1: WebSocket Gateway & Pulse Sidebar UI** (React + NestJS Gateway)
- **Story 7.2: OpenTelemetry Integration & Jaeger Setup** (Infrastructure + SDK)
- **Story 7.3: Prometheus Metrics & Pulse Dashboard UI** (Metrics Export + Charts)

---

## 5. Technical Stack Update

- **Tracing**: OpenTelemetry (SDK), Jaeger (Collector/UI)
- **Metrics**: Prometheus (TSDB), Grafana (Optional / Integrated UI)
- **Real-time**: WebSockets (Socket.io-client / NestJS Gateway)
- **Infrastructure**: Docker Compose (Update for OTel stack)
