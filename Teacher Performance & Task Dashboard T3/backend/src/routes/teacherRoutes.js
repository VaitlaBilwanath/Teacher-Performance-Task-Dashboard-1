const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getTeacherDashboard,
  getMyClass,
  logAttendance,
  getTeacherTasks,
  updateTask,
  postStudentNote,
  postDailyRoutine
} = require('../controllers/teacherController');

// All teacher routes protected and restricted to TEACHER role
router.use(protect);
router.use(authorize('TEACHER'));

router.get('/dashboard', getTeacherDashboard);
router.get('/my-class', getMyClass);
router.post('/attendance', logAttendance);
router.get('/tasks', getTeacherTasks);
router.put('/tasks/:id', updateTask);
router.post('/student-notes', postStudentNote);
router.post('/daily-routine', postDailyRoutine);

module.exports = router;
