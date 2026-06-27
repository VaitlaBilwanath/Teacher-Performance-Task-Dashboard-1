const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

router.get('/', async (req, res) => {
  try {
    // Query DB and get version info (handles SQLite or PostgreSQL)
    let pgVersion = 'Unknown';
    try {
      const versionResult = await prisma.$queryRawUnsafe('SELECT version()');
      const fullVersion = versionResult[0]?.version || '';
      const match = fullVersion.match(/PostgreSQL ([\d\.]+)/i);
      pgVersion = match ? match[1] : (fullVersion || 'Unknown');
    } catch (e) {
      try {
        const versionResult = await prisma.$queryRawUnsafe('SELECT sqlite_version()');
        pgVersion = versionResult[0]?.['sqlite_version()'] || 'SQLite';
      } catch (e2) {
        pgVersion = 'Database Connected';
      }
    }

    res.status(200).json({
      success: true,
      database: 'CONNECTED',
      data: {
        status: 'UP',
        database: 'CONNECTED',
        postgresVersion: pgVersion,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed: ' + error.message,
      data: {
        status: 'DOWN',
        database: 'DISCONNECTED',
        postgresVersion: null,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;
