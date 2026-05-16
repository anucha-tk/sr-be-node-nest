# 📄 Product Brief: Elasticsearch Interactive Showcase
**Status:** 🏗️ Draft | **Target:** Interview Portfolio & Personal Learning

## 1. Executive Summary
โปรเจกต์นี้เป็นการยกระดับระบบ **Service Registry** เดิม ด้วยการนำ **Elasticsearch** เข้ามาเป็นหัวใจหลักในการจัดการข้อมูล (Data Engine) โดยแบ่งการเรียนรู้ออกเป็น 3 ขั้นตอน (Phase) เพื่อสร้าง Feature ที่ผู้ใช้สามารถใช้งานได้จริง (User-Facing) และเน้นความสวยงามด้วยเทคโนโลยี **Framer Motion + Tailwind CSS 4** เพื่อแสดงศักยภาพในระดับ Full-stack Senior Engineer

## 2. Strategic Objectives
*   **Learning:** เพื่อให้ผู้พัฒนเข้าใจกลไกของ Elasticsearch (Indexing, Searching, Aggregating) จากศูนย์จนถึงระดับสูง
*   **Showcase:** เพื่อเป็นผลงาน (Portfolio) ที่แสดงถึงการแก้ปัญหาเรื่อง Scalability, Search Performance และ Real-time Analytics
*   **UX Excellence:** สร้าง Interface ที่ลื่นไหลและตอบสนองไว (High-performance UI)

## 3. Core Features Roadmap

### 🏁 Phase 1: The "Search Master" (Command Palette)
*   **What:** แถบค้นหาอัจฉริยะ (Cmd+K) ค้นหา ApiKey และ Invoice ข้ามระบบ
*   **Elastic Skills:** Index Creation, Custom Mappings, Fuzzy Search, Multi-match Queries.
*   **UI Focus:** Framer Motion animations สำหรับ Modal และ Instant Result list.

### 🌊 Phase 2: The "Activity Stream" (Personal Feed)
*   **What:** หน้า Dashboard แสดงความเคลื่อนไหวของข้อมูล (Logs) ที่เกี่ยวข้องกับ User แบบ Real-time
*   **Elastic Skills:** Date Histograms, Term Queries, Scrolling/Pagination for Big Data.
*   **UI Focus:** Smooth scrolling feed และ Badge indicators สำหรับประเภทเหตุการณ์ต่างๆ

### 📊 Phase 3: The "Insight Explorer" (Live Analytics)
*   **What:** ระบบกรองข้อมูลขั้นสูงและแสดงผลกราฟสถิติ (Revenue/Usage) ทันทีที่เปลี่ยน Filter
*   **Elastic Skills:** Nested Aggregations, Sum/Avg Metrics, Filter Context.
*   **UI Focus:** Recharts Integration และ Interactive filters (Facets).

## 4. Technical Architecture
*   **Infrastructure:** Elasticsearch 8.x + Kibana (Dockerized)
*   **Backend:** NestJS + `@nestjs/elasticsearch` + Prisma (as Source of Truth)
*   **Frontend:** React 19 + Vite + Tailwind 4 + Framer Motion
*   **Integration:** ใช้ **Prisma Middleware** หรือ **Service Events** เพื่อ Sync ข้อมูลจาก PostgreSQL ไปยัง Elasticsearch (CDC Pattern)
