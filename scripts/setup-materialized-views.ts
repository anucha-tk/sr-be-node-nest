import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL not found');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function setup() {
  console.log('--- SETTING UP MATERIALIZED VIEWS ---');

  await prisma.$executeRawUnsafe(`
    DROP MATERIALIZED VIEW IF EXISTS "mv_admin_revenue_summary";
    CREATE MATERIALIZED VIEW "mv_admin_revenue_summary" AS
    SELECT
      SUM(amount) FILTER (WHERE status = 'PAID') as total_revenue,
      SUM(amount) FILTER (WHERE status = 'PENDING') as total_pending,
      COUNT(DISTINCT "supplierId") as supplier_count,
      NOW() as last_refreshed
    FROM "invoices";
  `);
  console.log('Created mv_admin_revenue_summary');

  await prisma.$executeRawUnsafe(`
    DROP MATERIALIZED VIEW IF EXISTS "mv_revenue_trends_monthly";
    CREATE MATERIALIZED VIEW "mv_revenue_trends_monthly" AS
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM-DD') as period,
      SUM(amount) as total_amount,
      NOW() as last_refreshed
    FROM "invoices"
    WHERE status = 'PAID'
    GROUP BY period;
    
    CREATE UNIQUE INDEX "idx_mv_revenue_trends_monthly_period" ON "mv_revenue_trends_monthly"(period);
  `);
  console.log('Created mv_revenue_trends_monthly');

  await prisma.$disconnect();
  await pool.end();
}

setup().catch(console.error);
