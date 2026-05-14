# Supplier Revenue Dashboard (SR-BE-NODE-NEST)

ระบบหลังบ้านประสิทธิภาพสูง สำหรับประมวลผลข้อมูลรายได้และจัดการใบแจ้งหนี้ (Invoices) พร้อมระบบตรวจสอบ (Audit Trail) และความปลอดภัยระดับองค์กร

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** NestJS (v11)
- **Runtime:** Node.js (v24) / [Bun](https://bun.sh/) (Recommended for development scripts)
- **Database:** PostgreSQL (v17) ผ่าน Prisma (v7.8.0)
- **Messaging:** Kafka (v4)
- **Observability:**
  - **Metrics:** Prometheus + prom-client
  - **Tracing:** OpenTelemetry + Jaeger
  - **Logging:** Pino + Nestjs-Pino
- **Auth:** Keycloak (v26) + API Keys (Dual Auth)
- **Validation:** Zod + Nestjs-Zod
- **Infra:** Docker Compose

## 🛠️ เริ่มต้นใช้งาน (Getting Started)

### 1. สิ่งที่ต้องเตรียม (Prerequisites)

- Node.js v24 ขึ้นไป
- [Bun](https://bun.sh/) (แนะนำสำหรับการรันสคริปต์และ Quality Gate ที่รวดเร็ว)
- Docker & Docker Compose

### 2. ตั้งค่า Environment

คัดลอกไฟล์ต้นแบบและตั้งค่าตัวแปรต่างๆ:

```bash
cp .env.example .env
```

### 3. รันระบบ Infrastructure

เริ่มต้นฐานข้อมูล PostgreSQL, Keycloak, Kafka และ Jaeger ด้วย Docker:

```bash
docker compose up -d
```

> [!NOTE]
> **Keycloak Auto-Provisioning:** ระบบถูกตั้งค่าให้นำเข้า (Import) การตั้งค่า Realm, Client, Roles และ Users โดยอัตโนมัติจากโฟลเดอร์ `keycloak-init` เมื่อเริ่มต้นระบบครั้งแรก

### 4. ติดตั้งและเริ่มรันแอปพลิเคชัน

```bash
# 1. ติดตั้ง dependencies
bun install  # หรือ npm install

# 2. Sync database schema และ generate Prisma client
bun run prisma:push
bun run prisma:generate

# 3. สร้าง API Key สำหรับใช้งานครั้งแรก
bun scripts/seed-api-key.mjs

# 4. (ทางเลือก) สร้างข้อมูลทดสอบ 1,000,000 รายการ
bun run seed:million

# 5. เริ่มรันเซิร์ฟเวอร์ในโหมดพัฒนา
bun run start:dev
```

## 📊 การตรวจสอบระบบ (Observability)

ระบบมาพร้อมกับความสามารถในการตรวจสอบแบบ Real-time:

1. **System Pulse Dashboard:** แสดงผล Metrics สำคัญ (CPU, Memory, Traffic) แบบสดๆ ผ่าน WebSocket ในหน้า UI
2. **Prometheus Metrics:** ดูข้อมูลดิบได้ที่ `/v1/observability/metrics-summary`
3. **Jaeger Tracing:** ติดตาม Flow ของ Request และ Kafka Events ได้ที่ [http://localhost:16686](http://localhost:16686)
4. **Audit Trail:** ระบบบันทึกการเปลี่ยนแปลงที่สำคัญทั้งหมดในฐานข้อมูล

## 🔐 ระบบยืนยันตัวตน (Authentication)

ระบบรองรับการยืนยันตัวตน 2 รูปแบบ (**Dual Authentication**):

### 1. Keycloak (JWT Token)

ใช้สำหรับการเข้าใช้งานผ่านหน้าจอ (Browser) โดยมีผู้ใช้เริ่มต้นดังนี้:

- **Admin:** `test` / `12345678`
- **Supplier:** `supplier` / `12345678`

**วิธีขอ Token ผ่าน Terminal:**

```bash
curl --location 'http://localhost:8080/realms/sr-realm/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=sr-be-client' \
--data-urlencode 'username=test' \
--data-urlencode 'password=12345678' \
--data-urlencode 'grant_type=password'
```

### 2. API Keys (Service-to-Service)

ใช้สำหรับระบบอื่นๆ ที่ต้องการเรียกใช้ API โดยตรงผ่าน Header `x-api-key`

## 📖 เอกสารประกอบ API

- **Scalar UI:** [http://localhost:3000/docs](http://localhost:3000/docs)

## 📜 รายการสคริปต์ (Scripts)

| คำสั่ง                  | รายละเอียด                                        |
| :---------------------- | :------------------------------------------------ |
| `bun run start:dev`     | รันแอปพลิเคชันในโหมด Watch                        |
| `bun run check:full`    | รัน Quality Gate ครบชุด (Lint, Format, TSC, Test) |
| `bun run test:cov`      | รัน Unit Test พร้อมสรุป Coverage                  |
| `bun run prisma:studio` | เปิดหน้า UI สำหรับจัดการข้อมูลในฐานข้อมูล         |

## 📐 แผนผังระบบ (Diagrams)

- [🏗️ System Architecture](docs/diagrams/architect.md)
- [🔄 Logic Flow: Idempotency](docs/diagrams/flow-function.md)

---

## ⚖️ สัญญาอนุญาต

UNLICENSED
