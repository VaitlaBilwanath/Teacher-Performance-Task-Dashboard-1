const prisma = require('../config/prisma');
const { logAudit } = require('../utils/audit');

// @desc    Get messages between logged in user and another user
// @route   GET /api/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { receiverId } = req.query;

    if (!receiverId) {
      res.status(400);
      throw new Error('Receiver ID is required');
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId },
          { senderId: receiverId, receiverId: req.user.id }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Messages fetched successfully',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      res.status(400);
      throw new Error('Receiver ID and message content are required');
    }

    // Check if receiver user exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      res.status(404);
      throw new Error('Receiver user not found');
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        content
      }
    });

    logAudit({
      userId: req.user ? req.user.id : null,
      role: req.user ? req.user.role : null,
      action: 'CREATE_MESSAGE',
      module: 'Messages',
      recordId: message.id,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage
};
