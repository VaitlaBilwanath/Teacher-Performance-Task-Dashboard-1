const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendMessage } = require('../controllers/messageController');

router.use(protect);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
