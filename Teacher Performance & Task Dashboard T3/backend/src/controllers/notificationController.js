const prisma = require('../config/prisma');
const { logAudit } = require('../utils/audit');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    logAudit({
      userId: req.user ? req.user.id : null,
      role: req.user ? req.user.role : null,
      action: 'UPDATE_NOTIFICATIONS',
      module: 'Notifications',
      recordId: req.user.id, // Using user ID since multiple notifications are updated
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.userId !== req.user.id) {
      res.status(403);
      throw new Error('Forbidden: Not authorized to read this notification');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    logAudit({
      userId: req.user ? req.user.id : null,
      role: req.user ? req.user.role : null,
      action: 'UPDATE_NOTIFICATION',
      module: 'Notifications',
      recordId: updated.id,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAllAsRead,
  markAsRead
};
