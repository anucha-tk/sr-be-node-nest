import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);
const { Pool } = pg;

function generatePlainKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function hashKey(plainKey, salt) {
  return crypto
    .createHash('sha256')
    .update(plainKey + salt)
    .digest('hex');
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL env var required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 1 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const name = 'frontend-demo-key';
  const plainKey = generatePlainKey();
  const salt = crypto.randomBytes(16).toString('hex');
  const keyHash = hashKey(plainKey, salt);

  const keyRecord = await prisma.apiKey.upsert({
    where: { name },
    update: { keyHash, salt, scopes: ['supplier', 'admin'], isActive: true },
    create: { name, keyHash, salt, scopes: ['supplier', 'admin'], isActive: true },
  });

  const fullKey = `${keyRecord.id}.${plainKey}`;
  console.log(`\n=== API KEY ===`);
  console.log(fullKey);
  console.log(`\nAdd to frontend/.env:`);
  console.log(`VITE_API_KEY=${fullKey}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
