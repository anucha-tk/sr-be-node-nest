import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Database State ---');

  const invoiceCount = await prisma.invoice.count();
  console.log(`Total Invoices: ${invoiceCount}`);

  if (invoiceCount > 0) {
    const sampleInvoice = await prisma.invoice.findFirst();
    console.log('Sample Invoice Supplier ID:', sampleInvoice?.supplierId);
    
    const uniqueSuppliers = await prisma.invoice.groupBy({
      by: ['supplierId'],
      _count: { _all: true }
    });
    console.log('Unique Suppliers in Invoices:', uniqueSuppliers);
  }

  const apiKeyId = '6b8ec198-cff0-45f4-90c2-d3ec6d2975b2';
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: apiKeyId }
  });
  
  if (apiKey) {
    console.log('API Key Found:');
    console.log('  ID:', apiKey.id);
    console.log('  Name:', apiKey.name);
    console.log('  Supplier ID:', apiKey.supplierId);
    console.log('  Scopes:', apiKey.scopes);
  } else {
    console.log(`API Key with ID ${apiKeyId} not found.`);
    const allKeys = await prisma.apiKey.findMany();
    console.log('All API Keys in DB:', allKeys.map(k => ({ id: k.id, supplierId: k.supplierId })));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
