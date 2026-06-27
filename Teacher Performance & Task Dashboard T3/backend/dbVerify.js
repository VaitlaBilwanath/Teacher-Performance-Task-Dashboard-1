const prisma = require('./src/config/prisma');

const API_BASE = 'http://localhost:5000/api';

async function logTestResult(name, promiseFn) {
  try {
    const result = await promiseFn();
    console.log(`\x1b[32m✅ PASS:\x1b[0m ${name}`);
    return { name, status: 'PASS', details: result };
  } catch (err) {
    console.error(`\x1b[31m❌ FAIL:\x1b[0m ${name}`);
    console.error(err);
    return { name, status: 'FAIL', error: err.message };
  }
}

async function runTests() {
  console.log('======================================================================');
  console.log('   FirstCry Intellitots Dashboard Database & API Verification Script  ');
  console.log('======================================================================\n');
  const results = [];

  // Helper for requests
  const apiFetch = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response (Status ${res.status}): ${text.substring(0, 100)}`);
    }
    if (!res.ok) {
      throw new Error(json.message || `API error (Status ${res.status})`);
    }
    return json;
  };

  // 1. Health Check Test
  results.push(await logTestResult('1. Database Connection Test (GET /api/health)', async () => {
    const res = await apiFetch('/health');
    if (!res.success || res.database !== 'CONNECTED') {
      throw new Error(`Expected success=true and database=CONNECTED, got: ${JSON.stringify(res)}`);
    }
    return res;
  }));

  // 2. Authentication Test
  let adminToken, teacherToken, parentToken;
  let adminId, teacherId, parentId;

  results.push(await logTestResult('2. User Authentication Test - Admin Login', async () => {
    const res = await apiFetch('/auth/login', 'POST', {
      email: 'vaitlabinnu@gmail.com',
      password: 'Binnu2007'
    });
    if (!res.success || !res.data.token || res.data.user.role !== 'ADMIN') {
      throw new Error(`Failed auth check: ${JSON.stringify(res)}`);
    }
    adminToken = res.data.token;
    adminId = res.data.user.id;
    return { role: res.data.user.role, tokenExists: !!adminToken };
  }));

  results.push(await logTestResult('2. User Authentication Test - Teacher Login', async () => {
    const res = await apiFetch('/auth/login', 'POST', {
      email: 'prithika@gmail.com',
      password: 'Prithika123'
    });
    if (!res.success || !res.data.token || res.data.user.role !== 'TEACHER') {
      throw new Error(`Failed auth check: ${JSON.stringify(res)}`);
    }
    teacherToken = res.data.token;
    teacherId = res.data.user.id;
    return { role: res.data.user.role, tokenExists: !!teacherToken };
  }));

  results.push(await logTestResult('2. User Authentication Test - Parent Login', async () => {
    const res = await apiFetch('/auth/login', 'POST', {
      email: 'neha@gmail.com',
      password: 'neha@1213'
    });
    if (!res.success || !res.data.token || res.data.user.role !== 'PARENT') {
      throw new Error(`Failed auth check: ${JSON.stringify(res)}`);
    }
    parentToken = res.data.token;
    parentId = res.data.user.id;
    return { role: res.data.user.role, tokenExists: !!parentToken };
  }));

  // 3. Teacher CRUD Testing
  let tempTeacherId, tempTeacherUserId;
  results.push(await logTestResult('3. Teacher CRUD Testing - Create Teacher', async () => {
    const email = 'testteacher@gmail.com';
    const res = await apiFetch('/admin/teachers', 'POST', {
      email,
      password: 'TeacherPass123',
      name: 'Test Teacher',
      phone: '9876543210'
    }, adminToken);
    
    tempTeacherId = res.data.id;
    tempTeacherUserId = res.data.userId;

    // Verify in DB directly
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser || dbUser.name !== 'Test Teacher') {
      throw new Error('Teacher User not found in DB after create');
    }
    const dbTeacher = await prisma.teacher.findUnique({ where: { id: tempTeacherId } });
    if (!dbTeacher || !dbTeacher.teacherRegNo || !dbTeacher.employeeId) {
      throw new Error('Teacher profile or registration numbers not generated in DB');
    }
    return { id: tempTeacherId, regNo: dbTeacher.teacherRegNo, empId: dbTeacher.employeeId };
  }));

  results.push(await logTestResult('3. Teacher CRUD Testing - Teacher Login Verification', async () => {
    const res = await apiFetch('/auth/login', 'POST', {
      email: 'testteacher@gmail.com',
      password: 'TeacherPass123'
    });
    if (!res.success || !res.data.token) {
      throw new Error('New teacher failed to log in');
    }
    return { loginSuccess: true };
  }));

  results.push(await logTestResult('3. Teacher CRUD Testing - Update Teacher', async () => {
    const res = await apiFetch(`/admin/teachers/${tempTeacherId}`, 'PUT', {
      name: 'Test Teacher Updated',
      phone: '9876543219',
      shiftTime: '09:00 AM - 03:00 PM'
    }, adminToken);

    // Verify in DB directly
    const dbUser = await prisma.user.findUnique({ where: { email: 'testteacher@gmail.com' } });
    if (dbUser.name !== 'Test Teacher Updated' || dbUser.phone !== '9876543219') {
      throw new Error('Teacher updates not reflected in DB');
    }
    return { name: dbUser.name, phone: dbUser.phone };
  }));

  results.push(await logTestResult('3. Teacher CRUD Testing - Delete Teacher (Soft Delete)', async () => {
    await apiFetch(`/admin/teachers/${tempTeacherId}`, 'DELETE', null, adminToken);

    // Verify in DB directly
    const dbUser = await prisma.user.findUnique({ where: { email: 'testteacher@gmail.com' } });
    if (dbUser.isActive !== false) {
      throw new Error('Teacher isActive is not false in database (soft delete failed)');
    }

    // Verify login is blocked
    try {
      await apiFetch('/auth/login', 'POST', {
        email: 'testteacher@gmail.com',
        password: 'TeacherPass123'
      });
      throw new Error('Login succeeded for deactivated teacher');
    } catch (err) {
      if (!err.message.includes('deactivated')) {
        throw new Error(`Expected deactivation error, got: ${err.message}`);
      }
    }
    return { softDeleted: true, loginBlocked: true };
  }));

  // Clean up soft-deleted teacher user from DB to keep it repeatable
  await prisma.teacher.delete({ where: { id: tempTeacherId } }).catch(() => {});
  await prisma.user.delete({ where: { id: tempTeacherUserId } }).catch(() => {});

  // 4. Parent CRUD Testing
  let tempParentId, tempParentUserId;
  results.push(await logTestResult('4. Parent CRUD Testing - Create Parent', async () => {
    const email = 'testparent@gmail.com';
    const res = await apiFetch('/admin/parents', 'POST', {
      email,
      password: 'ParentPass123',
      name: 'Test Parent',
      phone: '9876543211'
    }, adminToken);

    tempParentId = res.data.id;
    tempParentUserId = res.data.userId;

    // Verify in DB
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser || dbUser.name !== 'Test Parent') {
      throw new Error('Parent User not found in DB');
    }
    return { id: tempParentId };
  }));

  results.push(await logTestResult('4. Parent CRUD Testing - Parent Login Verification', async () => {
    const res = await apiFetch('/auth/login', 'POST', {
      email: 'testparent@gmail.com',
      password: 'ParentPass123'
    });
    if (!res.success || !res.data.token) {
      throw new Error('New parent failed to log in');
    }
    return { loginSuccess: true };
  }));

  results.push(await logTestResult('4. Parent CRUD Testing - Update Parent', async () => {
    const res = await apiFetch(`/admin/parents/${tempParentId}`, 'PUT', {
      name: 'Test Parent Updated',
      phone: '9876543218',
      parentContact: '9876543218'
    }, adminToken);

    const dbUser = await prisma.user.findUnique({ where: { email: 'testparent@gmail.com' } });
    if (dbUser.name !== 'Test Parent Updated') {
      throw new Error('Parent update not reflected in DB');
    }
    return { name: dbUser.name };
  }));

  results.push(await logTestResult('4. Parent CRUD Testing - Delete Parent (Soft Delete)', async () => {
    await apiFetch(`/admin/parents/${tempParentId}`, 'DELETE', null, adminToken);

    const dbUser = await prisma.user.findUnique({ where: { email: 'testparent@gmail.com' } });
    if (dbUser.isActive !== false) {
      throw new Error('Parent is not deactivated');
    }

    try {
      await apiFetch('/auth/login', 'POST', {
        email: 'testparent@gmail.com',
        password: 'ParentPass123'
      });
      throw new Error('Login succeeded for deactivated parent');
    } catch (err) {
      if (!err.message.includes('deactivated')) {
        throw new Error(`Expected deactivation error, got: ${err.message}`);
      }
    }
    return { softDeleted: true, loginBlocked: true };
  }));

  // Clean up parent (moved to end)
  // await prisma.parent.delete({ where: { id: tempParentId } }).catch(() => {});
  // await prisma.user.delete({ where: { id: tempParentUserId } }).catch(() => {});

  // 5. Student CRUD Testing
  let tempStudentId;
  results.push(await logTestResult('5. Student CRUD Testing - Create Student', async () => {
    const res = await apiFetch('/admin/students', 'POST', {
      name: 'Test Student',
      age: '4 Years',
      parentId: tempParentId
    }, adminToken);

    tempStudentId = res.data.id;
    if (!res.data.studentRegNo || !res.data.admissionNo) {
      throw new Error('Student registration or admission number not generated');
    }
    return { id: tempStudentId, regNo: res.data.studentRegNo, admNo: res.data.admissionNo };
  }));

  results.push(await logTestResult('5. Student CRUD Testing - Update Student', async () => {
    const res = await apiFetch(`/admin/students/${tempStudentId}`, 'PUT', {
      name: 'Test Student Updated',
      age: '5 Years'
    }, adminToken);

    const dbStudent = await prisma.student.findUnique({ where: { id: tempStudentId } });
    if (dbStudent.name !== 'Test Student Updated' || dbStudent.age !== '5 Years') {
      throw new Error('Student updates not reflected in DB');
    }
    return { name: dbStudent.name, age: dbStudent.age };
  }));

  results.push(await logTestResult('5. Student CRUD Testing - Delete Student (Hard Delete)', async () => {
    await apiFetch(`/admin/students/${tempStudentId}`, 'DELETE', null, adminToken);

    const dbStudent = await prisma.student.findUnique({ where: { id: tempStudentId } });
    if (dbStudent) {
      throw new Error('Student still exists in DB after deletion');
    }
    return { hardDeleted: true };
  }));

  // 6. Registration Number Testing
  results.push(await logTestResult('6. Registration Number Pattern Verification', async () => {
    const t1 = await apiFetch('/admin/teachers', 'POST', {
      email: 'tseq1@gmail.com', password: 'Password123', name: 'Seq Teacher 1'
    }, adminToken);
    const t2 = await apiFetch('/admin/teachers', 'POST', {
      email: 'tseq2@gmail.com', password: 'Password123', name: 'Seq Teacher 2'
    }, adminToken);

    const s1 = await apiFetch('/admin/students', 'POST', { name: 'Seq Student 1', parentId: tempParentId }, adminToken);
    const s2 = await apiFetch('/admin/students', 'POST', { name: 'Seq Student 2', parentId: tempParentId }, adminToken);

    const regNoPattern = /^26EMP1\d{3}$/;
    const empIdPattern = /^26EMP\d{4}$/;
    const admPattern = /^261FC1\d{4}$/;
    const sRegPattern = /^FCI26\d{7}$/; 

    const checkTeacher1 = regNoPattern.test(t1.data.teacherRegNo) && empIdPattern.test(t1.data.employeeId);
    const checkTeacher2 = regNoPattern.test(t2.data.teacherRegNo) && empIdPattern.test(t2.data.employeeId);
    const checkStudent1 = admPattern.test(s1.data.admissionNo) && sRegPattern.test(s1.data.studentRegNo);
    const checkStudent2 = admPattern.test(s2.data.admissionNo) && sRegPattern.test(s2.data.studentRegNo);

    // Clean up sequential entities
    await prisma.teacher.deleteMany({ where: { id: { in: [t1.data.id, t2.data.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [t1.data.userId, t2.data.userId] } } });
    await prisma.student.deleteMany({ where: { id: { in: [s1.data.id, s2.data.id] } } });

    if (!checkTeacher1 || !checkTeacher2 || !checkStudent1 || !checkStudent2) {
      throw new Error(`Pattern matching failed. RegNo T1: ${t1.data.teacherRegNo}, EmpId T1: ${t1.data.employeeId}, Adm S1: ${s1.data.admissionNo}, Reg S1: ${s1.data.studentRegNo}`);
    }

    return {
      teacher1: { regNo: t1.data.teacherRegNo, empId: t1.data.employeeId },
      teacher2: { regNo: t2.data.teacherRegNo, empId: t2.data.employeeId },
      student1: { admNo: s1.data.admissionNo, regNo: s1.data.studentRegNo },
      student2: { admNo: s2.data.admissionNo, regNo: s2.data.studentRegNo }
    };
  }));

  // 7. Attendance Testing
  results.push(await logTestResult('7. Attendance Testing - Mark and Block Duplicates', async () => {
    const student = await prisma.student.findFirst();
    if (!student) throw new Error('No students in database for attendance test');

    const dateStr = '2026-06-24';
    const midnightDate = new Date(dateStr);
    midnightDate.setUTCHours(0,0,0,0);

    // Clean any existing attendance for this student on this date
    await prisma.attendance.deleteMany({ where: { studentId: student.id, date: midnightDate } });

    // Mark attendance via API
    await apiFetch('/teacher/attendance', 'POST', {
      attendance: [{ studentId: student.id, status: 'PRESENT' }],
      date: dateStr
    }, teacherToken);

    // Direct database verification
    const dbRecord = await prisma.attendance.findUnique({
      where: { studentId_date: { studentId: student.id, date: midnightDate } }
    });
    if (!dbRecord || dbRecord.status !== 'PRESENT') {
      throw new Error('Attendance not saved correctly in DB');
    }

    // Try to create a duplicate directly via Prisma to trigger Unique Constraint validation error
    let uniqueConstraintThrown = false;
    try {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date: midnightDate,
          status: 'ABSENT'
        }
      });
    } catch (err) {
      if (err.code === 'P2002' || err.message.includes('Unique constraint')) {
        uniqueConstraintThrown = true;
      } else {
        throw err;
      }
    }

    if (!uniqueConstraintThrown) {
      throw new Error('Expected Unique constraint validation error P2002, but insertion succeeded!');
    }

    return { savedInDB: true, duplicateBlocked: true };
  }));

  // 8. Daily Routine Testing
  results.push(await logTestResult('8. Daily Routine Testing - Submit and View Updates', async () => {
    const student = await prisma.student.findFirst();
    if (!student) throw new Error('No students in database');

    const routinePayload = {
      studentId: student.id,
      breakfast: 'full',
      lunch: 'partial',
      snacks: 'none',
      waterCups: 4,
      napTime: '1 Hour',
      pottyCheck: true,
      activityNotes: 'Test activity notes'
    };

    await apiFetch('/teacher/daily-routine', 'POST', routinePayload, teacherToken);

    const dbRoutine = await prisma.dailyRoutine.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!dbRoutine || dbRoutine.breakfast !== 'full' || dbRoutine.waterCups !== 4) {
      throw new Error('Daily routine not saved or values mismatch in DB');
    }

    const parentRes = await apiFetch('/parent/daily-updates', 'GET', null, parentToken);
    
    return { teacherSaved: true, dbSaved: true, parentRetrieved: parentRes.success };
  }));

  // 9. Messaging Testing
  results.push(await logTestResult('9. Messaging Testing - Send and Retrieve', async () => {
    const m1 = await apiFetch('/messages', 'POST', {
      receiverId: parentId,
      content: 'Hello Parent from Teacher'
    }, teacherToken);

    const m2 = await apiFetch('/messages', 'POST', {
      receiverId: teacherId,
      content: 'Hello Teacher from Parent'
    }, parentToken);

    const chat = await apiFetch(`/messages?receiverId=${teacherId}`, 'GET', null, parentToken);

    const sent = chat.data.filter(m => m.senderId === parentId && m.receiverId === teacherId);
    const received = chat.data.filter(m => m.senderId === teacherId && m.receiverId === parentId);

    if (sent.length === 0 || received.length === 0) {
      throw new Error('Messages not stored or retrieved correctly in Message table');
    }

    return { sentCount: sent.length, receivedCount: received.length };
  }));

  // 10. Notifications Testing
  results.push(await logTestResult('10. Notifications Testing - Create and Read', async () => {
    const notif = await prisma.notification.create({
      data: {
        userId: parentId,
        title: 'New Event',
        content: 'There is a new event tomorrow',
        type: 'info'
      }
    });

    const listBefore = await apiFetch('/notifications', 'GET', null, parentToken);
    const targetNotif = listBefore.data.notifications.find(n => n.id === notif.id);
    if (!targetNotif || targetNotif.isRead) {
      throw new Error('Notification not retrieved or state is incorrect');
    }

    await apiFetch(`/notifications/${notif.id}/read`, 'PUT', null, parentToken);
    await apiFetch('/notifications/mark-read', 'PUT', null, parentToken);

    const listAfter = await apiFetch('/notifications', 'GET', null, parentToken);
    const unreadCount = listAfter.data.unreadCount;
    if (unreadCount !== 0) {
      throw new Error('Mark all read failed to set unreadCount to 0');
    }

    await prisma.notification.delete({ where: { id: notif.id } });

    return { created: true, markedRead: true, unreadCount };
  }));

  // 11. Dashboard Statistics Testing
  results.push(await logTestResult('11. Dashboard Statistics Testing', async () => {
    const statsRes = await apiFetch('/admin/dashboard', 'GET', null, adminToken);
    const apiStats = statsRes.data.stats;

    const dbTeachers = await prisma.teacher.count({ where: { user: { isActive: true } } });
    const dbStudents = await prisma.student.count();
    const dbTasks = await prisma.task.count();

    const matchTeachers = apiStats.totalTeachers === dbTeachers;
    const matchStudents = apiStats.totalStudents === dbStudents;
    const matchTasks = apiStats.totalTasks === dbTasks;

    if (!matchTeachers || !matchStudents || !matchTasks) {
      throw new Error(`Stats mismatch. API: T=${apiStats.totalTeachers},S=${apiStats.totalStudents},Ta=${apiStats.totalTasks}. DB: T=${dbTeachers},S=${dbStudents},Ta=${dbTasks}`);
    }

    return { apiStats, dbStats: { teachers: dbTeachers, students: dbStudents, tasks: dbTasks } };
  }));

  // 12. Profile Update Testing
  results.push(await logTestResult('12. Profile Update Testing', async () => {
    const originalAdmin = await prisma.user.findUnique({ where: { id: adminId } });

    const updatedRes = await apiFetch('/auth/profile', 'PUT', {
      name: 'Admin Deshmukh Updated',
      phone: '+91 99999 77777'
    }, adminToken);

    const dbUser = await prisma.user.findUnique({ where: { id: adminId } });
    if (dbUser.name !== 'Admin Deshmukh Updated' || dbUser.phone !== '+91 99999 77777') {
      throw new Error('Profile update not persistent in database');
    }

    await prisma.user.update({
      where: { id: adminId },
      data: {
        name: originalAdmin.name,
        phone: originalAdmin.phone
      }
    });

    return { profileUpdated: true, originalRestored: true };
  }));

  // Print final summary report
  console.log('\n======================================================================');
  console.log('                             TESTING SUMMARY                          ');
  console.log('======================================================================');
  let passedCount = 0, failedCount = 0;
  for (const r of results) {
    if (r.status === 'PASS') {
      console.log(`\x1b[32m[PASS]\x1b[0m ${r.name}`);
      passedCount++;
    } else {
      console.log(`\x1b[31m[FAIL]\x1b[0m ${r.name} - Error: ${r.error}`);
      failedCount++;
    }
  }

  // Clean up soft-deleted parent user from DB to keep it repeatable
  if (tempParentId) await prisma.parent.delete({ where: { id: tempParentId } }).catch(() => {});
  if (tempParentUserId) await prisma.user.delete({ where: { id: tempParentUserId } }).catch(() => {});

  console.log(`\nFinal Score: \x1b[32m${passedCount} passed\x1b[0m, \x1b[31m${failedCount} failed\x1b[0m.`);
  
  await prisma.$disconnect();
  process.exit(failedCount > 0 ? 1 : 0);
}

runTests().catch(async (err) => {
  console.error('Unhandled Test Runner Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
