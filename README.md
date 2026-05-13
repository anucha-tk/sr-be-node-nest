# Supplier Revenue Dashboard (SR-BE-NODE-NEST)

ระบบหลังบ้านประสิทธิภาพสูง สำหรับประมวลผลข้อมูลรายได้และจัดการใบแจ้งหนี้ (Invoices) พร้อมระบบตรวจสอบ (Audit Trail) และความปลอดภัยระดับองค์กร

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** NestJS (v11)
- **Runtime:** Node.js (v24)
- **Database:** PostgreSQL (v17) ผ่าน Prisma (v7.8.0)
- **Validation:** Zod + Nestjs-Zod
- **Logging:** Pino + Nestjs-Pino
- **Auth:** Keycloak (v26) + API Keys (Dual Auth)
- **Messaging:** Kafka (v4)
- **Infra:** Docker Compose

## 🛠️ เริ่มต้นใช้งาน (Getting Started)

### 1. สิ่งที่ต้องเตรียม (Prerequisites)

- Node.js v24 ขึ้นไป
- Docker & Docker Compose
- [Bun](https://bun.sh/) (แนะนำสำหรับการรันสคริปต์ที่รวดเร็ว)

### 2. ตั้งค่า Environment

คัดลอกไฟล์ต้นแบบและตั้งค่าตัวแปรต่างๆ:

```bash
cp .env.example .env
```

### 3. รันระบบ Infrastructure

เริ่มต้นฐานข้อมูล PostgreSQL, Keycloak และ Kafka ด้วย Docker:

```bash
docker compose up -d
```

> [!NOTE]
> **Keycloak Auto-Provisioning:** ระบบถูกตั้งค่าให้นำเข้า (Import) การตั้งค่า Realm, Client, Roles และ Users โดยอัตโนมัติจากโฟลเดอร์ `keycloak-init` เมื่อเริ่มต้นระบบครั้งแรก ไม่ต้องตั้งค่าเองในหน้า UI

### 4. ติดตั้งและเริ่มรันแอปพลิเคชัน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. Sync database schema และ generate Prisma client
npm run prisma:push
npm run prisma:generate

# 3. สร้าง API Key สำหรับใช้งานครั้งแรก (เลือกใช้ x-api-key แทน JWT ได้)
# สคริปต์นี้จะสร้าง key และอัปเดตไฟล์ .env ในโฟลเดอร์ frontend ให้โดยอัตโนมัติ
node scripts/seed-api-key.mjs

# 4. (ทางเลือก) สร้างข้อมูลทดสอบ 1,000,000 รายการ เพื่อทดสอบประสิทธิภาพ
npm run seed:million

# 5. เริ่มรันเซิร์ฟเวอร์ในโหมดพัฒนา
npm run start:dev
```

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

- สร้าง Key ใหม่ได้ด้วยคำสั่ง: `node scripts/seed-api-key.mjs`

## 📖 เอกสารประกอบ API (Swagger/Scalar)

เมื่อรันระบบแล้ว สามารถเข้าดูเอกสารประกอบ API และทดสอบเรียกใช้งานได้ที่:

- **Scalar UI:** [http://localhost:3000/docs](http://localhost:3000/docs)

## 📜 รายรายการสคริปต์ (Scripts)

| คำสั่ง                  | รายละเอียด                                            |
| :---------------------- | :---------------------------------------------------- |
| `npm run start:dev`     | รันแอปพลิเคชันในโหมด Watch (Development)              |
| `npm run check:full`    | รัน Lint, Format, TSC และ Test ครบชุด (Quality Gate)  |
| `npm run test:e2e`      | รันการทดสอบ End-to-End                                |
| `npm run prisma:studio` | เปิดหน้า UI สำหรับจัดการข้อมูลในฐานข้อมูล             |
| `npm run seed:million`  | รันตัวประมวลผลสร้างข้อมูล 1 ล้านรายการ (Bulk Seeding) |

## 📊 แผนผังระบบ (Diagrams)

- [🏗️ System Architecture](docs/diagrams/architect.md): ภาพรวมการรับเหตุการณ์ (Event Ingestion) และการจัดเก็บข้อมูล
- [🔄 Logic Flow: Idempotency](docs/diagrams/flow-function.md): ลำดับขั้นตอนการประมวลผลข้อมูลแบบ Exactly-once

---

## 🛡️ มาตรฐานความปลอดภัย

- การยืนยันตัวตนด้วย JWT ผ่าน Keycloak
- รองรับ API Key สำหรับบริการภายใน
- การควบคุมการเข้าถึงตามบทบาท (RBAC)
- ตรวจสอบความถูกต้องของข้อมูลด้วย Zod ทุกเลเยอร์

## ⚖️ สัญญาอนุญาต

UNLICENSED
