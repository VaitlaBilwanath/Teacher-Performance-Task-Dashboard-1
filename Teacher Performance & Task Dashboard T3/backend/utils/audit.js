const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

/**
 * Asynchronously creates an audit log without blocking the main event loop.
 * @param {Object} data 
 * @param {string} data.userId
 * @param {string} data.role
 * @param {string} data.action
 * @param {string} data.module
 * @param {string} data.recordId
 * @param {Object} data.oldValues
 * @param {Object} data.newValues
 * @param {string} data.ipAddress
 */
const logAudit = (data) => {
  // Fire and forget, don't await
  prisma.auditLog.create({ data })
    .catch(err => {
      // If audit logging fails, log it internally via Winston but do not crash the app
      logger.error(`Failed to write audit log: ${err.message}`, { auditData: data });
    });
};

module.exports = { logAudit };
