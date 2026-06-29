const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = require('../src/config/prisma');

// Configuration
const CLASSROOMS = ['Playgroup A', 'Nursery A', 'Nursery B', 'Kindergarten 1', 'Kindergarten 2', 'Toddlers C'];
const SHIFTS = ['08:00 AM - 02:00 PM', '08:30 AM - 02:30 PM', '09:00 AM - 03:00 PM', '09:30 AM - 03:30 PM'];

const TEACHER_NAMES = [
  'Prithika Sharma', 'Varun Mehta', 'Raju Sen', 'Neha Gupta', 'Vikram Malhotra',
  'Priya Patel', 'Anjali Desai', 'Amit Kumar', 'Sneha Singh', 'Rohan Das'
];

const PARENT_NAMES = [
  'Aarti Sharma', 'Karan Mehta', 'Simran Sen', 'Rajiv Gupta', 'Kavita Malhotra',
  'Suresh Patel', 'Pooja Desai', 'Anil Kumar', 'Meera Singh', 'Manoj Das',
  'Riya Joshi', 'Sunil Reddy', 'Swati Verma', 'Nitin Jain', 'Kiran Rao',
  'Deepak Nair', 'Anita Bose', 'Tarun kapoor', 'Preeti Menon', 'Gaurav Bhatia'
];

const STUDENT_NAMES = [
  'Aarav Sharma', 'Kiara Mehta', 'Kabir Sen', 'Diya Gupta', 'Reyansh Malhotra',
  'Myra Patel', 'Vivaan Desai', 'Shanaya Kumar', 'Aditya Singh', 'Ananya Das',
  'Arjun Joshi', 'Risha Reddy', 'Sai Verma', 'Avni Jain', 'Dev Rao',
  'Mira Nair', 'Rudra Bose', 'Ishaan Kapoor', 'Zara Menon', 'Dhruv Bhatia',
  'Nisha Sharma', 'Rohan Mehta', 'Sia Sen', 'Krish Gupta', 'Tara Malhotra',
  'Ayaan Patel', 'Neha Desai', 'Samar Kumar', 'Piya Singh', 'Aryan Das'
];

const MOODS = ['Happy', 'Energetic', 'Curious', 'Calm', 'Fussy', 'Sleepy'];

// Helper for random items
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (num, size) => num.toString().padStart(size, '0');

async function main(options = {}) {
  console.log('--- FirstCry Intellitots Seed Script ---');

  // 1. Safety Lock
  if (process.env.NODE_ENV === 'production' && !options.force && process.env.ALLOW_PROD_SEED !== 'true') {
    const errorMsg = 'Production database detected. Seeding aborted to protect production information.';
    console.error('❌ ' + errorMsg);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw new Error(errorMsg);
    }
  }

  const mode = options.mode || (process.argv.includes('--mode') ? process.argv[process.argv.indexOf('--mode') + 1] : 'demo');
  const confirm = options.confirm || process.argv.includes('--confirm');

  if (mode === 'demo') {
    if (!confirm) {
      const errorMsg = 'Destructive action detected! You must provide the confirm option to proceed.';
      console.error('❌ ' + errorMsg);
      if (require.main === module) {
        process.exit(1);
      } else {
        throw new Error(errorMsg);
      }
    }

    console.log('🔄 Mode: demo. Preparing to clear existing data...');
    
    // Backup before deleting
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      const errorMsg = 'DATABASE_URL is not defined in env';
      console.error('❌ ' + errorMsg);
      if (require.main === module) {
        process.exit(1);
      } else {
        throw new Error(errorMsg);
      }
    }

    if (dbUrl.includes('postgresql') || dbUrl.includes('postgres')) {
      console.log('⏳ Checking for pg_dump and creating backup...');
      try {
        execSync('pg_dump --version', { stdio: 'ignore' });
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
        
        console.log(`⏳ Executing backup to ${backupFile}...`);
        execSync(`pg_dump "${dbUrl}" > "${backupFile}"`);
        console.log(`✅ Backup successful: ${backupFile}`);
      } catch (e) {
        console.warn('⚠️ Backup skipped: pg_dump not found in PATH or backup failed.');
        console.warn('Proceeding with seeding without a backup...');
      }
    } else if (dbUrl.startsWith('file:')) {
      console.log('⏳ Creating SQLite backup of existing database file...');
      try {
        const dbPath = dbUrl.replace('file:', '');
        const resolvedDbPath = path.resolve(__dirname, dbPath.startsWith('.') ? dbPath : path.join('..', dbPath));
        if (fs.existsSync(resolvedDbPath)) {
          const backupDir = path.join(__dirname, '../backups');
          if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupFile = path.join(backupDir, `backup-${timestamp}.db`);
          
          fs.copyFileSync(resolvedDbPath, backupFile);
          console.log(`✅ SQLite Backup successful: ${backupFile}`);
        } else {
          console.log('ℹ️ No SQLite database file found to backup, skipping backup.');
        }
      } catch (e) {
        console.error('⚠️ SQLite Backup failed:', e.message);
      }
    } else {
      console.log('ℹ️ Unknown database URL pattern, skipping backup.');
    }

    console.log('⏳ Deleting existing records...');
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.task.deleteMany();
    await prisma.dailyRoutine.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.classroom.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.user.deleteMany();
  } else if (mode === 'add-sample') {
    console.log('➕ Mode: add-sample. Appending sample data without deleting existing records.');
  } else {
    const errorMsg = `Unknown mode: ${mode}. Use 'demo' or 'add-sample'.`;
    console.error('❌ ' + errorMsg);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw new Error(errorMsg);
    }
  }

  const defaultPassword = await bcrypt.hash('Password123', 10);

  // 2. Classrooms
  const classRecords = [];
  for (let i = 0; i < CLASSROOMS.length; i++) {
    const existing = await prisma.classroom.findFirst({ where: { name: CLASSROOMS[i] }});
    if (existing) {
      classRecords.push(existing);
    } else {
      classRecords.push(await prisma.classroom.create({
        data: { name: CLASSROOMS[i], roomNumber: `Room 10${i + 1}` }
      }));
    }
  }
  console.log('✅ Classrooms ready.');

  // 3. Admin
  let admin = await prisma.user.findFirst({ where: { email: 'admin@intellitots.com' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@intellitots.com',
        password: defaultPassword,
        role: 'ADMIN',
        name: 'Head Administrator',
        phone: '+91 99999 99999'
      }
    });
    console.log('✅ Admin account created.');
  }

  // 4. Teachers (10)
  const teacherRecords = [];
  for (let i = 0; i < TEACHER_NAMES.length; i++) {
    const name = TEACHER_NAMES[i];
    const email = `${name.split(' ')[0].toLowerCase()}@intellitots.com`;
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, password: defaultPassword, role: 'TEACHER', name, phone: `+91 98765 100${pad(i, 2)}` }
      });
    }

    let teacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          avatar: name.split(' ').map(n => n[0]).join(''),
          teacherRegNo: `26EMP10${pad(i, 2)}`,
          employeeId: `26EMP00${pad(i, 2)}`,
          shiftTime: randItem(SHIFTS),
          classroomId: classRecords[i % classRecords.length].id,
          performance: randInt(85, 100),
          attendance: randInt(90, 100),
          tasksCompleted: randInt(20, 100),
          complianceScore: randInt(88, 100)
        }
      });
    }
    teacherRecords.push(teacher);
  }
  console.log('✅ 10 Professional Teachers ready.');

  // 5. Parents (20)
  const parentRecords = [];
  for (let i = 0; i < PARENT_NAMES.length; i++) {
    const name = PARENT_NAMES[i];
    const email = `parent${i+1}@example.com`;
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, password: defaultPassword, role: 'PARENT', name, phone: `+91 91234 200${pad(i, 2)}` }
      });
    }

    let parent = await prisma.parent.findFirst({ where: { userId: user.id } });
    if (!parent) {
      parent = await prisma.parent.create({
        data: { userId: user.id, parentContact: `+91 91234 200${pad(i, 2)}` }
      });
    }
    parentRecords.push({ parent, user });
  }
  console.log('✅ 20 Parent accounts ready.');

  // 6. Students (30)
  const studentRecords = [];
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const name = STUDENT_NAMES[i];
    const admNo = `261FC100${pad(i + 1, 2)}`;
    let student = await prisma.student.findFirst({ where: { admissionNo: admNo } });
    
    if (!student) {
      const p = parentRecords[i % parentRecords.length].parent;
      const c = classRecords[i % classRecords.length];
      
      student = await prisma.student.create({
        data: {
          name,
          avatar: name.split(' ').map(n => n[0]).join(''),
          age: `${randInt(2, 5)} Years, ${randInt(1, 11)} Months`,
          studentRegNo: `FCI2600010${pad(i + 1, 2)}`,
          admissionNo: admNo,
          classroomId: c.id,
          parentId: p.id,
          mood: randItem(MOODS),
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          milestones: [
            { name: 'Language & Speech', progress: randInt(60, 100) },
            { name: 'Fine Motor Skills', progress: randInt(60, 100) },
            { name: 'Social Interaction', progress: randInt(60, 100) },
            { name: 'Cognitive Ability', progress: randInt(60, 100) }
          ],
          timeline: [
            { time: '08:00 AM', event: 'Arrival', desc: `Checked in. Mood: ${randItem(MOODS)}.` },
            { time: '10:00 AM', event: 'Activity', desc: 'Participated in group activity.' },
            { time: '12:00 PM', event: 'Lunch', desc: 'Ate well.' }
          ],
          notes: [
            { date: new Date().toISOString().split('T')[0], author: 'System', content: 'Medical Notes: N/A, Allergies: None reported.', mood: 'Calm' }
          ]
        }
      });
    }
    studentRecords.push(student);
  }
  console.log('✅ 30 Students ready.');

  // 7. Daily Routine, Attendance, Tasks, Messages, Announcements
  console.log('⏳ Generating interactions (Routines, Tasks, Announcements, etc)...');
  
  // Attendance & Routines
  for (const student of studentRecords) {
    // Generate routine for today
    await prisma.dailyRoutine.create({
      data: {
        studentId: student.id,
        date: new Date(),
        breakfast: randItem(['full', 'partial', 'none']),
        lunch: randItem(['full', 'partial', 'none']),
        snacks: randItem(['full', 'partial', 'none']),
        waterCups: randInt(2, 8),
        napTime: `${randInt(30, 90)} Mins`,
        pottyCheck: true,
        activityNotes: 'Regular day activities completed successfully.'
      }
    });

    // Generate Attendance
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        date: new Date(new Date().setHours(0,0,0,0)), // normalize to midnight
        status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT'
      }
    }).catch(() => {}); // ignore unique constraint if running add-sample repeatedly on same day
  }

  // Tasks for Teachers
  const taskTitles = ['Lesson Planning', 'Parent Feedback', 'Student Observation', 'Activity Preparation', 'Weekly Assessment', 'Classroom Sanitization', 'Curriculum Planning'];
  for (const teacher of teacherRecords) {
    await prisma.task.create({
      data: {
        title: randItem(taskTitles),
        desc: 'Standard assigned task generated by ERP.',
        status: randItem(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
        priority: randItem(['high', 'medium', 'low']),
        dueDate: new Date(Date.now() + 86400000 * randInt(1, 7)).toISOString().split('T')[0], // 1-7 days from now
        assigneeId: teacher.id
      }
    });
  }

  // Announcements
  await prisma.announcement.createMany({
    data: [
      { title: 'Holiday Notice', content: 'School will remain closed for National Holiday.', priority: 'high', createdByName: 'Admin', date: new Date().toISOString().split('T')[0] },
      { title: 'Sports Day', content: 'Annual sports day is scheduled for next month.', priority: 'medium', createdByName: 'Admin', date: new Date().toISOString().split('T')[0] },
      { title: 'Health Check Camp', content: 'Routine pediatrician visit next week.', priority: 'low', createdByName: 'Admin', date: new Date().toISOString().split('T')[0] },
      { title: 'Parent Teacher Meeting', content: 'PTM scheduled for this Saturday.', priority: 'high', createdByName: 'Admin', date: new Date().toISOString().split('T')[0] }
    ]
  });

  // Teacher Attendance & Duty Roster
  console.log('⏳ Generating Teacher Attendance and Duty Roster...');
  for (const teacher of teacherRecords) {
    const isPresent = Math.random() > 0.1;
    await prisma.teacherAttendance.create({
      data: {
        teacherId: teacher.id,
        date: new Date(new Date().setHours(0,0,0,0)), // normalize to midnight
        status: isPresent ? 'PRESENT' : 'ABSENT'
      }
    }).catch(() => {}); // ignore unique constraint if running add-sample repeatedly

    if (isPresent) {
      await prisma.dutyRoster.create({
        data: {
          teacherId: teacher.id,
          date: new Date(new Date().setHours(0,0,0,0)), // normalize to midnight
          room: `Room ${randInt(101, 205)}`,
          shift: teacher.shiftTime || '09:00 AM - 03:00 PM',
          className: classRecords[randInt(0, classRecords.length - 1)].name
        }
      }).catch(() => {}); // ignore unique constraint
    }
  }

  // Messages between Teachers and Parents
  for (let i = 0; i < 15; i++) {
    const tUser = teacherRecords[randInt(0, teacherRecords.length - 1)].userId;
    const pUser = parentRecords[randInt(0, parentRecords.length - 1)].user.id;
    await prisma.message.create({ data: { content: 'Hello, how is my child doing?', senderId: pUser, receiverId: tUser }});
    await prisma.message.create({ data: { content: 'Doing great! Very active today.', senderId: tUser, receiverId: pUser }});
  }

  // Notifications
  for (let i = 0; i < 5; i++) {
    await prisma.notification.create({
      data: {
        title: 'System Update', content: 'New features added to dashboard.', type: 'info', userId: admin.id
      }
    });
  }

  // --- Create specific test users required by dbVerify.js and mockData ---
  console.log('⏳ Generating specific test users and mock dataset...');

  const adminHash = await bcrypt.hash('Binnu2007', 10);
  const teacherHashPrithika = await bcrypt.hash('Prithika123', 10);
  const teacherHashVarun = await bcrypt.hash('Varun123', 10);
  const teacherHashRaju = await bcrypt.hash('Raju123', 10);
  const parentHashNeha = await bcrypt.hash('neha@1213', 10);
  const parentHashNani = await bcrypt.hash('Nani123', 10);
  const parentHashRahul = await bcrypt.hash('Rahul123', 10);

  // 1. Admin
  let verifyAdmin = await prisma.user.findFirst({ where: { email: 'vaitlabinnu@gmail.com' } });
  if (!verifyAdmin) {
    verifyAdmin = await prisma.user.create({
      data: {
        email: 'vaitlabinnu@gmail.com',
        password: adminHash,
        role: 'ADMIN',
        name: 'Admin Deshmukh',
        phone: '+91 99999 88888',
        isEmailVerified: true
      }
    });
  }

  // Find or create specific classrooms
  const getOrCreateClass = async (name, room) => {
    let cls = await prisma.classroom.findUnique({ where: { name } });
    if (!cls) {
      cls = await prisma.classroom.create({ data: { name, roomNumber: room } });
    }
    return cls;
  };

  const playgroupA = await getOrCreateClass('Playgroup A', 'Room 102');
  const nurseryB = await getOrCreateClass('Nursery B', 'Room 105');
  const kindergarten1 = await getOrCreateClass('Kindergarten 1', 'Room 201');

  // 2. Teachers
  const createTeacherUser = async (email, password, name, avatar, regNo, empNo, shift, classId) => {
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password,
          role: 'TEACHER',
          name,
          phone: '+91 99999 77777',
          isEmailVerified: true
        }
      });
    }
    let teacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          avatar,
          teacherRegNo: regNo,
          employeeId: empNo,
          shiftTime: shift,
          classroomId: classId,
          performance: 92.0,
          attendance: 96.0,
          tasksCompleted: 45,
          complianceScore: 95.0
        }
      });
    }
    return teacher;
  };

  const tPrithika = await createTeacherUser('prithika@gmail.com', teacherHashPrithika, 'Prithika Sharma', 'PS', '26EMP1001', '26EMP0001', '08:00 AM - 02:00 PM', playgroupA.id);
  const tVarun = await createTeacherUser('varun@gmail.com', teacherHashVarun, 'Varun Mehta', 'VM', '26EMP1002', '26EMP0002', '09:00 AM - 03:00 PM', nurseryB.id);
  const tRaju = await createTeacherUser('raju@gmail.com', teacherHashRaju, 'Raju Sen', 'RS', '26EMP1003', '26EMP0003', '08:30 AM - 02:30 PM', kindergarten1.id);

  // 3. Parents
  const createParentUser = async (email, password, name, contact) => {
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password,
          role: 'PARENT',
          name,
          phone: contact,
          isEmailVerified: true
        }
      });
    }
    let parent = await prisma.parent.findFirst({ where: { userId: user.id } });
    if (!parent) {
      parent = await prisma.parent.create({
        data: {
          userId: user.id,
          parentContact: contact
        }
      });
    }
    return parent;
  };

  const pNeha = await createParentUser('neha@gmail.com', parentHashNeha, 'Neha Patel', '+91 98765 43210');
  const pNani = await createParentUser('Nani@gmail.com', parentHashNani, 'Nani Sen', '+91 98123 45678');
  const pRahul = await createParentUser('rahul@gmail.com', parentHashRahul, 'Rahul Malhotra', '+91 91234 56789');

  // 4. Students
  const createStudentUser = async (name, avatar, age, regNo, admNo, classId, parentId) => {
    let student = await prisma.student.findFirst({ where: { admissionNo: admNo } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          name,
          avatar,
          age,
          studentRegNo: regNo,
          admissionNo: admNo,
          classroomId: classId,
          parentId: parentId,
          mood: 'Happy',
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          milestones: [
            { name: 'Language & Speech', progress: 85 },
            { name: 'Fine Motor Skills', progress: 70 },
            { name: 'Social Interaction', progress: 90 },
            { name: 'Cognitive Ability', progress: 80 }
          ],
          timeline: [
            { time: '08:00 AM', event: 'Arrival', desc: 'Checked in by parent. Waved goodbye.' },
            { time: '09:00 AM', event: 'Breakfast', desc: 'Ate 1 bowl of vegetable oats.' }
          ],
          notes: [
            { date: new Date().toISOString().split('T')[0], author: 'System', content: 'Routine initial note.', mood: 'Calm' }
          ]
        }
      });
    }
    return student;
  };

  // Aarav Patel, Kiara Sen, Kabir Malhotra
  const sAarav = await createStudentUser('Aarav Patel', 'AP', '3 Years, 2 Months', 'FCI260001001', '261FC10001', playgroupA.id, pNeha.id);
  const sKiara = await createStudentUser('Kiara Sen', 'KS', '2 Years, 11 Months', 'FCI260001002', '261FC10002', playgroupA.id, pNani.id);
  const sKabir = await createStudentUser('Kabir Malhotra', 'KM', '4 Years, 1 Month', 'FCI260001003', '261FC10003', nurseryB.id, pRahul.id);

  // 5. Tasks
  const createMockTask = async (title, desc, status, priority, dueDate, assigneeId) => {
    const existing = await prisma.task.findFirst({ where: { title, assigneeId } });
    if (!existing) {
      await prisma.task.create({
        data: { title, desc, status, priority, dueDate, assigneeId }
      });
    }
  };

  await createMockTask('Curriculum Planning T1', 'Complete Montessori outline.', 'TODO', 'high', '2026-07-20', tPrithika.id);
  await createMockTask('Monthly Progress Reports', 'Compile progress reports.', 'IN_PROGRESS', 'high', '2026-07-18', tPrithika.id);
  await createMockTask('Phonics Activity Setup', 'Assemble cardboard letters.', 'TODO', 'medium', '2026-07-22', tRaju.id);
  await createMockTask('Health & Sanitization Audit', 'Sanitization checks.', 'REVIEW', 'medium', '2026-07-16', tRaju.id);
  await createMockTask('Parent-Teacher Meet Invites', 'PTM Digital calendars.', 'COMPLETED', 'low', '2026-07-14', tVarun.id);

  console.log('✅ Specific mock accounts and dataset created successfully!');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = main;
