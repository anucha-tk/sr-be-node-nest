const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.invoice.count();
    console.log('Total Invoices:', count);

    const invoices = await prisma.invoice.findMany({
      take: 10,
      select: { id: true, supplierId: true }
    });
    console.log('Sample Invoices:', invoices);

    const key = await prisma.apiKey.findFirst();
    console.log('Sample API Key:', key ? { id: key.id, supplierId: key.supplierId } : 'No API Key found');

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
