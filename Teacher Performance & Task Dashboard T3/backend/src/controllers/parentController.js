const prisma = require('../config/prisma');
const { logAudit } = require('../utils/audit');

// Helper to get parent profile from req.user
const getParentProfile = async (userId) => {
  return await prisma.parent.findUnique({
    where: { userId },
    include: {
      students: {
        include: {
          classroom: {
            include: {
              teachers: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};

// @desc    Get Parent Dashboard details
// @route   GET /api/parent/dashboard
// @access  Private (Parent)
const getParentDashboard = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.id);

    if (!parent || parent.students.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registered student profiles found for this parent account',
        data: {
          child: null,
          announcements: [],
          latestRoutine: null,
          latestNotes: []
        }
      });
    }

    const firstChild = parent.students[0];

    // 1. Get classroom teacher details
    const teacher = firstChild.classroom && firstChild.classroom.teachers.length > 0
      ? firstChild.classroom.teachers[0]
      : null;

    // 2. Fetch latest daily routine log
    const latestRoutine = await prisma.dailyRoutine.findFirst({
      where: { studentId: firstChild.id },
      orderBy: { date: 'desc' }
    });

    // 3. Fetch announcements
    const announcements = await prisma.announcement.findMany({
      orderBy: { date: 'desc' },
      take: 3
    });

    // 4. Retrieve child's latest attendance status
    const latestAttendance = await prisma.attendance.findFirst({
      where: { studentId: firstChild.id },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Parent dashboard details loaded successfully',
      data: {
        child: {
          id: firstChild.id,
          name: firstChild.name,
          avatar: firstChild.avatar,
          age: firstChild.age,
          mood: firstChild.mood,
          assignedClass: firstChild.classroom ? firstChild.classroom.name : 'Not Assigned',
          classroomTeacher: teacher ? {
            name: teacher.user.name,
            avatar: teacher.avatar,
            shiftTime: teacher.shiftTime,
            email: teacher.user.email
          } : null
        },
        latestAttendance: latestAttendance ? latestAttendance.status : 'NO_RECORDS',
        latestRoutine,
        announcements,
        latestNotes: Array.isArray(firstChild.notes) ? firstChild.notes.slice(0, 3) : []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parent's child profile details
// @route   GET /api/parent/my-child
// @access  Private (Parent)
const getMyChild = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.id);

    if (!parent || parent.students.length === 0) {
      res.status(404);
      throw new Error('No registered student profiles found for this parent account');
    }

    // Default to the first child or filter by query studentId
    const { studentId } = req.query;
    const child = studentId 
      ? parent.students.find(s => s.id === studentId) 
      : parent.students[0];

    if (!child) {
      res.status(404);
      throw new Error('Child student profile not found');
    }

    res.status(200).json({
      success: true,
      message: 'Child details fetched successfully',
      data: child
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child daily routine history logs
// @route   GET /api/parent/daily-updates
// @access  Private (Parent)
const getDailyUpdates = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.id);

    if (!parent || parent.students.length === 0) {
      res.status(404);
      throw new Error('Child student profile not found');
    }

    const firstChild = parent.students[0];

    const routines = await prisma.dailyRoutine.findMany({
      where: { studentId: firstChild.id },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Daily routine records fetched successfully',
      data: routines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notes and observations logged by the teacher
// @route   GET /api/parent/teacher-notes
// @access  Private (Parent)
const getTeacherNotes = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.id);

    if (!parent || parent.students.length === 0) {
      res.status(404);
      throw new Error('Child student profile not found');
    }

    const firstChild = parent.students[0];

    // Return the observations array from student profile notes
    res.status(200).json({
      success: true,
      message: 'Teacher observations fetched successfully',
      data: Array.isArray(firstChild.notes) ? firstChild.notes : []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages between parent and child's class teacher
// @route   GET /api/parent/messages
// @access  Private (Parent)
const getParentTeacherMessages = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.id);

    if (!parent || parent.students.length === 0) {
      res.status(404);
      throw new Error('Student profile details missing');
    }

    const firstChild = parent.students[0];
    const teachers = firstChild.classroom ? firstChild.classroom.teachers : [];

    if (teachers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No classroom teacher assigned to chat with',
        data: []
      });
    }

    const teacherUserId = teachers[0].userId;

    // Retrieve all messages between this parent user and the teacher user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: teacherUserId },
          { senderId: teacherUserId, receiverId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      message: 'Chat history fetched successfully',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParentDashboard,
  getMyChild,
  getDailyUpdates,
  getTeacherNotes,
  getParentTeacherMessages
};
