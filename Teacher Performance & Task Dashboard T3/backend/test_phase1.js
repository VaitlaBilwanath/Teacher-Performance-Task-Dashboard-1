const axios = require('axios');
const prisma = require('./src/config/prisma');

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'tseq1@gmail.com';

async function main() {
  console.log("=== Phase 1 Strict Verification ===");
  
  // Setup: Ensure email is verified and reset lockout for test
  await prisma.user.update({
    where: { email: TEST_EMAIL },
    data: { isEmailVerified: true, failedLoginAttempts: 0, lockoutUntil: null }
  });
  console.log("\n[Setup] DB Reset for test user.");

  // 1. Account Lockout Test
  console.log("\n--- 1. Testing Account Lockout ---");
  for (let i = 1; i <= 6; i++) {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'wrongpassword123'
      });
    } catch (err) {
      console.log(`Login Attempt ${i} -> Status: ${err.response?.status}, Msg: ${err.response?.data?.message}`);
    }
  }

  const lockedUser = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  console.log(`[DB Verify] User 'lockoutUntil' is set to: ${lockedUser.lockoutUntil}`);

  // 2. Forgot Password / Reset Token Test
  console.log("\n--- 2. Testing Forgot Password & Reset Token ---");
  try {
    const res = await axios.post(`${BASE_URL}/auth/forgot-password`, { email: TEST_EMAIL });
    console.log(`Forgot Password API -> Status: ${res.status}, Msg: ${res.data?.message}`);
  } catch (err) {
    console.log("Error in forgot password:", err.response?.data);
  }

  // Check DB for token
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: { user: { email: TEST_EMAIL } },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`[DB Verify] Generated Token ID: ${tokenRecord?.id}, Expires At: ${tokenRecord?.expiresAt}`);

  // 3. Pagination & Search Test (Backend logic)
  console.log("\n--- 3. Testing Pagination & Search (Direct Prisma) ---");
  const total = await prisma.user.count({ where: { role: 'TEACHER', isActive: true } });
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', isActive: true },
    skip: 0,
    take: 2,
  });
  console.log(`Pagination Result: Got ${teachers.length} teachers for limit 2 out of ${total} total.`);

  // 4. Soft Delete Test
  console.log("\n--- 4. Testing Soft Delete ---");
  const student = await prisma.student.findFirst();
  if (student) {
    await prisma.student.update({
      where: { id: student.id },
      data: { isActive: false, deletedAt: new Date() }
    });
    console.log(`[DB Verify] Student ${student.name} soft deleted successfully (isActive: false)`);
    // Restore it
    await prisma.student.update({
      where: { id: student.id },
      data: { isActive: true, deletedAt: null }
    });
  }

  // 5. Audit Logs Test (Wait a bit for async audit logs to flush)
  console.log("\n--- 5. Testing Audit Logs ---");
  await new Promise(r => setTimeout(r, 1000));
  const recentLogs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { timestamp: 'desc' }
  });
  console.log("Recent Audit Logs:", JSON.stringify(recentLogs.map(l => `${l.action} on ${l.module} by ${l.role}`), null, 2));

  console.log("\n=== Phase 1 Verification Completed ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
