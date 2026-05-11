# Supplier Revenue Dashboard (SR-BE-NODE-NEST)

High-performance, audit-ready backend for financial data processing.

## 🚀 Tech Stack

- **Framework:** NestJS (v11)
- **Runtime:** Node.js (v24)
- **Database:** PostgreSQL (v17) via Prisma (v7.8.0)
- **Validation:** Zod + Nestjs-Zod
- **Logging:** Pino + Nestjs-Pino
- **Auth:** Keycloak (v26) + API Keys
- **Messaging:** Kafka (v4)
- **Infra:** Docker Compose

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js v24+
- Docker & Docker Compose

### 2. Environment Setup

Copy template and fill values:

```bash
cp .env.example .env
```

### 3. Infrastructure

Spin up database, Keycloak, and Kafka:

```bash
docker compose up -d
```

### 4. Application

```bash
npm install
npx prisma generate
npm run start:dev
```

## 📜 Scripts

| Action        | Command             |
| :------------ | :------------------ |
| **Dev**       | `npm run start:dev` |
| **Build**     | `npm run build`     |
| **Lint**      | `npm run lint`      |
| **Test**      | `npm run test`      |
| **E2E**       | `npm run test:e2e`  |
| **Prisma UI** | `npx prisma studio` |

## 🏗️ Development Status

Managed via BMad. See `_bmad-output/implementation-artifacts/sprint-status.yaml`.

- **Epic 1:** Foundation & Security (In Progress)
  - [x] 1.1 Project Foundation & Infra Setup
  - [ ] 1.2 Keycloak Identity & RBAC (Ready)
- **Epic 2:** Event-Driven Core (Backlog)
- **Epic 3:** Supplier API Layer (Backlog)
- **Epic 4:** Admin & Analytics (Backlog)

## 🛡️ Security

- JWT via Keycloak
- API Key for internal services
- RBAC enforcement
- Input validation (Zod)

## ⚖️ License

UNLICENSED
