const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getDashboardStats,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getParents,
  createParent,
  updateParent,
  deleteParent,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getReports,
  getAuditLogs,
  getStaffAttendance,
  getTasks,
  getDutyRoster,
  getAnnouncements,
  getClassrooms
} = require('../controllers/adminController');

// All admin routes are protected and restricted to ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);

router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

router.get('/parents', getParents);
router.post('/parents', createParent);
router.put('/parents/:id', updateParent);
router.delete('/parents/:id', deleteParent);

router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

router.get('/reports', getReports);

router.get('/audit-logs', getAuditLogs);

router.get('/staff-attendance', getStaffAttendance);
router.get('/tasks', getTasks);
router.get('/duty-roster', getDutyRoster);
router.get('/announcements', getAnnouncements);
router.get('/classrooms', getClassrooms);

module.exports = router;
