const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all announcements (Accessible by all roles)
// @route   GET /api/common/announcements
// @access  Private
router.get('/announcements', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    const announcements = await prisma.announcement.findMany({
      skip: startIndex,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.announcement.count();

    res.status(200).json({
      success: true,
      count: announcements.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: announcements
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
