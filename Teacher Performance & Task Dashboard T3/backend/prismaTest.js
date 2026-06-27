const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing prisma connection...');
  try {
    const res = await prisma.$queryRaw`SELECT 1`;
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
