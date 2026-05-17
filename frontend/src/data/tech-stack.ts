export const TECH_STACK = [
  {
    id: 'nestjs',
    name: 'NestJS',
    description: 'A progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
    version: 'v11.0.1',
    category: 'Framework',
    link: 'https://nestjs.com/'
  },
  {
    id: 'prisma',
    name: 'Prisma v7.8.0',
    description: 'Next-generation ORM for Node.js and TypeScript. Used for ACID transactions and type-safe database access.',
    version: 'v7.8.0',
    category: 'ORM',
    link: 'https://www.prisma.io/'
  },
  {
    id: 'kafka',
    name: 'Apache Kafka',
    description: 'Distributed event streaming platform. Handles "Invoice Paid" events with guaranteed idempotency.',
    version: 'v3.x',
    category: 'Messaging',
    link: 'https://kafka.apache.org/'
  },
  {
    id: 'keycloak',
    name: 'Keycloak OIDC',
    description: 'Open source identity and access management. Handles JWT authentication and RBAC.',
    version: 'v26.x',
    category: 'Security',
    link: 'https://www.keycloak.org/'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL 17',
    description: 'The world\'s most advanced open source relational database. Optimized for high-scale financial analytics.',
    version: 'v17.0',
    category: 'Database',
    link: 'https://www.postgresql.org/'
  },
  {
    id: 'elastic',
    name: 'Elasticsearch 9',
    description: 'High-performance analytical search engine. Indexes supplier invoice records for warp-speed fuzzy queries (<1ms) and instant lookups.',
    version: 'v9.4.0',
    category: 'Search Engine',
    link: 'https://www.elastic.co/'
  },
  {
    id: 'socket',
    name: 'Socket.io WebSockets',
    description: 'Real-time bidirectional event pipeline. Pushes transaction metrics and pipeline events directly to dashboards with zero latency.',
    version: 'v4.8.3',
    category: 'Real-Time Sync',
    link: 'https://socket.io/'
  },
  {
    id: 'swagger',
    name: 'Swagger & Scalar API',
    description: 'Interactive API playground and Scalar reference docs. Implements strict OpenAPI schemas for instant endpoint sandbox testing.',
    version: 'v11.4.2',
    category: 'API Docs',
    link: 'https://swagger.io/'
  },
  {
    id: 'testcov',
    name: 'Jest Coverage Gate >=80%',
    description: 'Strict testing quality gates enforcing high-discipline branch, statement, and line coverage constraints to ensure enterprise-grade safety.',
    version: 'Jest v30.0',
    category: 'Quality Gate',
    link: 'https://jestjs.io/'
  }
]
