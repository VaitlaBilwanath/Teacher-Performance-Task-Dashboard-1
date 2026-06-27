const prisma = require('./src/config/prisma');

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  console.log("Users:", JSON.stringify(users, null, 2));

  const admins = await prisma.admin.findMany({ include: { user: true }, take: 1 });
  console.log("Admin:", JSON.stringify(admins, null, 2));

  const auditLogs = await prisma.auditLog.findMany({ take: 5 });
  console.log("Audit Logs:", JSON.stringify(auditLogs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
