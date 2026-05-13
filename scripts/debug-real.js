const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env parser
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
    return acc;
  }, {});

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const total = await prisma.invoice.count();
    console.log('TOTAL_INVOICES:', total);

    const suppliers = await prisma.invoice.groupBy({
      by: ['supplierId'],
      _count: { _all: true }
    });
    console.log('SUPPLIERS:', JSON.stringify(suppliers));

    const apiKeyId = '6b8ec198-cff0-45f4-90c2-d3ec6d2975b2';
    const key = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
    console.log('TARGET_API_KEY:', JSON.stringify(key ? { id: key.id, supplierId: key.supplierId } : null));

    if (total > 0) {
      const sample = await prisma.invoice.findFirst();
      console.log('SAMPLE_INVOICE_SUPPLIER:', sample.supplierId);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
