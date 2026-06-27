const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getParentDashboard,
  getMyChild,
  getDailyUpdates,
  getTeacherNotes,
  getParentTeacherMessages
} = require('../controllers/parentController');

// All parent routes protected and restricted to PARENT role
router.use(protect);
router.use(authorize('PARENT'));

router.get('/dashboard', getParentDashboard);
router.get('/my-child', getMyChild);
router.get('/daily-updates', getDailyUpdates);
router.get('/teacher-notes', getTeacherNotes);
router.get('/messages', getParentTeacherMessages);

module.exports = router;
