import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';

const SEARCH_INDEX_NAME = 'showcase-search-v1';

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Fetching top 1000 invoices from database...');
    // @ts-ignore
    const invoices = await prisma.invoice.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' }
    });

    let bulkData = '';
    for (const invoice of invoices) {
      bulkData += JSON.stringify({ index: { _index: SEARCH_INDEX_NAME, _id: `inv_${invoice.id}` } }) + '\n';
      bulkData += JSON.stringify({
        id: invoice.id,
        type: 'invoice',
        invoiceNumber: invoice.invoiceNumber,
        supplierName: invoice.supplierId,
        amount: Number(invoice.amount),
        status: invoice.status,
        createdAt: invoice.createdAt,
      }) + '\n';
    }

    fs.writeFileSync('bulk-data.jsonl', bulkData);
    console.log('Generated bulk-data.jsonl. Run this command to sync:');
    console.log(`curl -X POST "http://localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary @bulk-data.jsonl`);

    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
