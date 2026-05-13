const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const totalInvoices = await prisma.invoice.count();
    console.log('--- DATABASE DIAGNOSTICS ---');
    console.log('Total Invoices in DB:', totalInvoices);

    const suppliers = await prisma.invoice.groupBy({
      by: ['supplierId'],
      _count: { _all: true }
    });
    console.log('Invoice counts by supplierId:', suppliers);

    const apiKeys = await prisma.apiKey.findMany();
    console.log('API Keys:', apiKeys.map(k => ({
      id: k.id,
      name: k.name,
      supplierId: k.supplierId,
      isActive: k.isActive
    })));

    const firstInvoices = await prisma.invoice.findMany({ take: 3 });
    console.log('Sample Invoices:', JSON.stringify(firstInvoices, null, 2));

  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
