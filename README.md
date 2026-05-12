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
- [Bun](https://bun.sh/) (Recommended)

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

## 🔐 Authentication & Authorization

This project uses **Keycloak** (OIDC) for user identity and **API Keys** for service-to-service communication.

### 1. Keycloak Setup

1. **Access Admin UI**: [http://localhost:8080/admin](http://localhost:8080/admin) (Default: `admin`/`admin`)
2. **Realm**: Ensure a realm named `sr-realm` exists.
3. **Client**: Create a client `sr-be-client`.
   - **Capability config**: Enable `Client authentication: Off`, `Authorization: Off`, `Authentication flow: Standard flow, Direct access grants`.
   - **Valid Redirect URIs**: `*` (for development).
4. **Roles**: Create roles `admin` and `supplier`.
5. **Users**: Create a test user and assign a role in "Role mapping".

### 2. How to Login (Get JWT Token)

Obtain a token via `curl` using the test credentials:

```bash
curl --location 'http://localhost:8080/realms/sr-realm/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=sr-be-client' \
--data-urlencode 'username=test' \
--data-urlencode 'password=12345678' \
--data-urlencode 'grant_type=password'
```

Copy the `access_token` from the response.

### 3. Using the Token in Documentation

1. Open **Scalar UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
2. Find the **Security** or **Authorize** section.
3. Paste the token into the **bearer** field.
4. Test endpoints in the **Test** tag (e.g., `GET /auth-test/protected`).

### 4. Common Auth Issues (Troubleshooting)

- **401 Unauthorized:** If you get this even with a valid token, ensure `verifyTokenAudience: false` is set in `AuthModule` (required if Keycloak doesn't map the client to the audience).
- **Public Client:** This project is configured for a Public Client (`sr-be-client`). Ensure "Client authentication" is **Off** in Keycloak.
- **Offline Validation:** We use `TokenValidation.OFFLINE` for better performance and stability in local development.

## 📜 Scripts

| Action        | Command             |
| :------------ | :------------------ |
| **Dev**       | `npm run start:dev` |
| **Build**     | `npm run build`     |
| **Lint**      | `npm run lint`      |
| **Test**      | `npm run test`      |
| **E2E**       | `npm run test:e2e`  |
| **Prisma UI** | `npx prisma studio` |

## 📊 System Diagrams

Detailed visualizations of the system's core engines:

- [🏗️ System Architecture](docs/diagrams/architect.md): High-level overview of event ingestion and data persistence.
- [🔄 Logic Flow: Idempotency](docs/diagrams/flow-function.md): Sequence diagram of the exactly-once processing engine.

## 🏗️ Development Status

Managed via BMad. See `_bmad-output/implementation-artifacts/sprint-status.yaml`.

- **Epic 1: Secure Access & Documentation (Done)**
  - [x] 1.1 Project Foundation & Infra Setup
  - [x] 1.2 Keycloak Identity & RBAC
  - [x] 1.3 API Key Security for Services
  - [x] 1.4 Interactive Scalar API Docs
- **Epic 2: Real-time Revenue Tracking (In Progress)**
  - [x] 2.1 Kafka Consumer & Event Mapping
  - [ ] 2.2 Idempotent Revenue Engine (Backlog)
  - [ ] 2.3 Immutable Audit Trail (Backlog)
  - [ ] 2.4 Fast Balance Visibility API (Backlog)
- **Epic 3: Invoice History & Search (Backlog)**
- **Epic 4: Enterprise Performance Analytics (Backlog)**

## 🛡️ Security

- JWT via Keycloak
- API Key for internal services
- RBAC enforcement
- Input validation (Zod)

## ⚖️ License

UNLICENSED
