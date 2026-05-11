# Edge Case Hunter Prompt (Path Analysis)

You are a pure path tracer. Your goal is to walk every branching path and boundary condition in the provided diff and report ONLY unhandled edge cases.

## Your Goal
Mechanically walk every branch (conditionals, loops, error handlers, early returns) and domain boundary (value/state transitions) reachable from the changed lines. Report only paths that lack an explicit guard.

## Input Diff
```diff
# (Excluded package-lock.json for brevity)
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
new file mode 100644
index 0000000..f35639f
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -0,0 +1,69 @@
+# generated: 2026-05-11
+# last_updated: 2026-05-11
+# project: sr-be-node-nest
+# project_key: NOKEY
+# tracking_system: file-system
+# story_location: {project-root}/_bmad-output/implementation-artifacts
+
+development_status:
+  epic-1: in-progress
+  1-1-project-foundation-infra-setup: review
+  1-2-keycloak-identity-rbac: backlog
+  1-3-api-key-security-for-services: backlog
+  1-4-interactive-scalar-api-docs: backlog
+  epic-1-retrospective: optional
+  epic-2: backlog
+  2-1-kafka-consumer-event-mapping: backlog
+  2-2-idempotent-revenue-engine: backlog
+  2-3-immutable-audit-trail: backlog
+  2-4-fast-balance-visibility-api: backlog
+  epic-2-retrospective: optional
+  epic-3: backlog
+  3-1-filterable-invoice-history-api: backlog
+  3-2-api-rate-limiting: backlog
+  3-3-standardized-json-export: backlog
+  3-4-consumer-ready-rest-api: backlog
+  epic-3-retrospective: optional
+  epic-4: backlog
+  4-1-million-record-seeding-engine: backlog
+  4-2-real-time-admin-summary-api: backlog
+  4-3-time-series-trend-analysis: backlog
+  4-4-advanced-sql-index-optimization: backlog
+  epic-4-retrospective: optional
+diff --git a/docker-compose.yml b/docker-compose.yml
+new file mode 100644
+index 0000000..35afce8
+--- /dev/null
++++ b/docker-compose.yml
+@@ -0,0 +1,73 @@
++services:
++  postgres:
++    image: postgres:17
++    container_name: sr-postgres
++    environment:
++      POSTGRES_USER: ${DB_USER:-postgres}
++      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
++      POSTGRES_DB: ${DB_NAME:-sr_be_db}
++    ports:
++      - "${DB_PORT:-5432}:5432"
++    volumes:
++      - postgres_data:/var/lib/postgresql/data
++    healthcheck:
++      test:
++        [
++          "CMD-SHELL",
++          "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-sr_be_db}",
++        ]
++      interval: 10s
++      timeout: 5s
++      retries: 5
++
++  keycloak:
++    image: quay.io/keycloak/keycloak:26.2
++    container_name: sr-keycloak
++    environment:
++      KC_BOOTSTRAP_ADMIN_USERNAME: ${KEYCLOAK_ADMIN:-admin}
++      KC_BOOTSTRAP_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}
++      KC_DB: dev-mem
++    command: start-dev
++    ports:
++      - "${KEYCLOAK_PORT:-8080}:8080"
++    healthcheck:
++      test:
++        ["CMD-SHELL", "curl -sf http://localhost:8080/health/ready || exit 1"]
++      interval: 20s
++      timeout: 10s
++      retries: 10
++      start_period: 40s
++
++  kafka:
++    image: apache/kafka:4.0.0
++    container_name: sr-kafka
++    environment:
++      # KRaft mode — no Zookeeper required
++      KAFKA_NODE_ID: 1
++      KAFKA_PROCESS_ROLES: broker,controller
++      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
++      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
++      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
++      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
++      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
++      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
++      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
++      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
++    ports:
++      - "${KAFKA_PORT:-9092}:9092"
++    volumes:
++      - kafka_data:/var/lib/kafka/data
++    healthcheck:
++      test:
++        [
++          "CMD-SHELL",
++          "/opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092 || exit 1",
++        ]
++      interval: 15s
++      timeout: 10s
++      retries: 8
++      start_period: 30s
++
++volumes:
++  postgres_data:
++  kafka_data:
+diff --git a/lefthook.yml b/lefthook.yml
+new file mode 100644
+index 0000000..f0d51d0
+--- /dev/null
++++ b/lefthook.yml
+@@ -0,0 +1,9 @@
++pre-commit:
++  parallel: true
++  commands:
++    linter:
++      glob: "*.{js,ts}"
++      run: npm run lint
++    formatter:
++      glob: "*.{js,ts,json}"
++      run: npm run format
+diff --git a/package.json b/package.json
+index 056c42d..b8c9e2f 100644
+--- a/package.json
++++ b/package.json
+@@ -21,14 +21,22 @@
+   },
+   "dependencies": {
+     "@nestjs/common": "^11.0.1",
++    "@nestjs/config": "^4.0.4",
+     "@nestjs/core": "^11.0.1",
+     "@nestjs/platform-express": "^11.0.1",
++    "@prisma/client": "^7.8.0",
++    "nestjs-pino": "^4.6.1",
++    "nestjs-zod": "^5.3.0",
++    "pino": "^10.3.1",
++    "pino-http": "^11.0.0",
+     "reflect-metadata": "^0.2.2",
+-    "rxjs": "^7.8.1"
++    "rxjs": "^7.8.1",
++    "zod": "^4.4.3"
+   },
+   "devDependencies": {
+     "@eslint/eslintrc": "^3.2.0",
+     "@eslint/js": "^9.18.0",
++    "@evilmartians/lefthook": "^2.1.6",
+     "@nestjs/cli": "^11.0.0",
+     "@nestjs/schematics": "^11.0.0",
+     "@nestjs/testing": "^11.0.1",
+@@ -41,7 +49,9 @@
+     "eslint-plugin-prettier": "^5.2.2",
+     "globals": "^17.0.0",
+     "jest": "^30.0.0",
++    "pino-pretty": "^13.1.3",
+     "prettier": "^3.4.2",
++    "prisma": "^7.8.0",
+     "source-map-support": "^0.5.21",
+     "supertest": "^7.0.0",
+     "ts-jest": "^29.2.5",
+diff --git a/prisma.config.ts b/prisma.config.ts
+new file mode 100644
+index 0000000..20471ec
+--- /dev/null
++++ b/prisma.config.ts
+@@ -0,0 +1,14 @@
++// This file was generated by Prisma, and assumes you have installed the following:
++// npm install --save-dev prisma dotenv
++import 'dotenv/config';
++import { defineConfig } from 'prisma/config';
++
++export default defineConfig({
++  schema: 'prisma/schema.prisma',
++  migrations: {
++    path: 'prisma/migrations',
++  },
++  datasource: {
++    url: process.env['DATABASE_URL'],
++  },
++});
+diff --git a/prisma/schema.prisma b/prisma/schema.prisma
+new file mode 100644
+index 0000000..74c81ab
+--- /dev/null
++++ b/prisma/schema.prisma
+@@ -0,0 +1,10 @@
++// Prisma Schema — sr-be-node-nest
++// Naming convention: PascalCase tables, camelCase columns
++
++generator client {
++  provider = "prisma-client-js"
++}
++
++datasource db {
++  provider = "postgresql"
++}
+diff --git a/src/app.module.ts b/src/app.module.ts
+index 8662803..bd9be89 100644
+--- a/src/app.module.ts
++++ b/src/app.module.ts
+@@ -1,9 +1,26 @@
+ import { Module } from '@nestjs/common';
++import { ConfigModule } from '@nestjs/config';
++import { LoggerModule } from 'nestjs-pino';
+ import { AppController } from './app.controller';
+ import { AppService } from './app.service';
++import { validateEnv } from './config/env.validation';
+ 
+ @Module({
+-  imports: [],
++  imports: [
++    ConfigModule.forRoot({
++      validate: validateEnv,
++      isGlobal: true,
++    }),
++    LoggerModule.forRoot({
++      pinoHttp: {
++        transport:
++          process.env.NODE_ENV !== 'production'
++            ? { target: 'pino-pretty' }
++            : undefined,
++        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
++      },
++    }),
++  ],
+   controllers: [AppController],
+   providers: [AppService],
+ })
+diff --git a/src/config/env.validation.ts b/src/config/env.validation.ts
+new file mode 100644
+index 0000000..fff4eff
+--- /dev/null
++++ b/src/config/env.validation.ts
+@@ -0,0 +1,35 @@
++import { z } from 'zod';
++
++export const envSchema = z.object({
++  NODE_ENV: z
++    .enum(['development', 'production', 'test'])
++    .default('development'),
++  PORT: z.coerce.number().default(3000),
++
++  // Database
++  DATABASE_URL: z.url(),
++
++  // Keycloak
++  KEYCLOAK_PORT: z.coerce.number().default(8080),
++  KEYCLOAK_ISSUER_URL: z.url(),
++  KEYCLOAK_CLIENT_ID: z.string(),
++
++  // Kafka
++  KAFKA_BROKERS: z.string(),
++  KAFKA_CONSUMER_GROUP_ID: z.string(),
++});
++
++export type EnvConfig = z.infer<typeof envSchema>;
++
++export function validateEnv(config: Record<string, unknown>) {
++  const validatedConfig = envSchema.safeParse(config);
++
++  if (!validatedConfig.success) {
++    console.error(
++      '❌ Invalid environment variables:',
++      z.treeifyError(validatedConfig.error),
++    );
++    process.exit(1);
++  }
++  return validatedConfig.data;
++}
+diff --git a/src/main.ts b/src/main.ts
+index f76bc8d..ff7d2ee 100644
+--- a/src/main.ts
++++ b/src/main.ts
+@@ -5,4 +5,4 @@ async function bootstrap() {
+   const app = await NestFactory.create(AppModule);
+   await app.listen(process.env.PORT ?? 3000);
+ }
+-bootstrap();
++void bootstrap();
+```

## Output Format
Return ONLY a valid JSON array of objects. Each object must contain exactly these four fields and nothing else:

```json
[{
  "location": "file:start-end (or file:line when single line, or file:hunk when exact line unavailable)",
  "trigger_condition": "one-line description (max 15 words)",
  "guard_snippet": "minimal code sketch that closes the gap (single-line escaped string, no raw newlines or unescaped quotes)",
  "potential_consequence": "what could actually go wrong (max 15 words)"
}]
```

No extra text, no explanations, no markdown wrapping. An empty array `[]` is valid when no unhandled paths are found.
