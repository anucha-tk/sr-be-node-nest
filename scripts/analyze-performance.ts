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

async function analyze() {
  console.log('--- ANALYZING SUMMARY VIEW QUERY ---');
  const summaryExplain = await prisma.$queryRawUnsafe(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT * FROM "mv_admin_revenue_summary";
  `);
  console.log(summaryExplain);

  console.log('\n--- ANALYZING TRENDS VIEW QUERY ---');
  const trendsExplain = await prisma.$queryRawUnsafe(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT * FROM "mv_revenue_trends_monthly" ORDER BY period ASC LIMIT 12;
  `);
  console.log(trendsExplain);

  await prisma.$disconnect();
  await pool.end();
}

analyze().catch(console.error);
