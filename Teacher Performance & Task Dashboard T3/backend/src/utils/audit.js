const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAudit = async ({ action, module, role, ipAddress, recordId, details }) => {
  try {
    // Fire and forget
    prisma.auditLog.create({
      data: {
        action,
        module,
        role: role || 'SYSTEM',
        ipAddress: ipAddress || '127.0.0.1',
        recordId: recordId || null,
        newValues: details ? JSON.stringify(details) : null
      }
    }).catch(err => {
      console.error("Failed to write audit log:", err);
    });
  } catch (err) {
    console.error("Failed to initiate audit log:", err);
  }
};

module.exports = { logAudit };
