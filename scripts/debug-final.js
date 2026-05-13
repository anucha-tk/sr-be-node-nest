const { PrismaClient } = require('@prisma/client');
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

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    const total = await prisma.invoice.count();
    console.log('TOTAL_INVOICES:', total);

    const suppliers = await prisma.invoice.groupBy({
      by: ['supplierId'],
      _count: { _all: true }
    });
    console.log('SUPPLIERS:', JSON.stringify(suppliers));

    const keys = await prisma.apiKey.findMany();
    console.log('API_KEYS:', JSON.stringify(keys.map(k => ({ id: k.id, supplierId: k.supplierId }))));

    const sample = await prisma.invoice.findFirst();
    console.log('SAMPLE_INVOICE:', JSON.stringify(sample));

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
