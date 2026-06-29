const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the detailed error internally
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Prisma Errors
  if (err.code && err.code.startsWith('P')) {
    // Unique constraint failed
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with that information already exists. Please check for duplicates (e.g., email, admission no).'
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested record could not be found.'
      });
    }
  }

  // If in development mode, send detailed error stack, else send generic message
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
};

module.exports = errorHandler;
