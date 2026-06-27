/* src/data/mockData.js */

// Default Static Accounts for authentication check
const staticAccounts = [
  // Admin
  { email: 'vaitlabinnu@gmail.com', password: 'Binnu2007', role: 'admin', name: 'Admin Deshmukh' },
  // Teachers
  { email: 'prithika@gmail.com', password: 'Prithika123', role: 'teacher', name: 'Prithika Sharma' },
  { email: 'varun@gmail.com', password: 'Varun123', role: 'teacher', name: 'Varun Mehta' },
  { email: 'raju@gmail.com', password: 'Raju123', role: 'teacher', name: 'Raju Sen' },
  // Parents
  { email: 'neha@gmail.com', password: 'neha@1213', role: 'parent', name: 'Neha Patel' },
  { email: 'Nani@gmail.com', password: 'Nani123', role: 'parent', name: 'Nani Sen' }
];

export const mockAccounts = [...staticAccounts];

// Default Static Teachers
const staticTeachers = [
  {
    id: 't1',
    name: 'Prithika Sharma',
    avatar: 'PS',
    teacherRegNo: '26EMP1001',
    employeeId: '26EMP0001',
    assignedClass: 'Playgroup A',
    shiftTime: '08:00 AM - 02:00 PM',
    roomNumber: 'Room 102',
    email: 'prithika@gmail.com',
    performance: 92,
    attendance: 96,
    tasksCompleted: 45,
    complianceScore: 95
  },
  {
    id: 't2',
    name: 'Varun Mehta',
    avatar: 'VM',
    teacherRegNo: '26EMP1002',
    employeeId: '26EMP0002',
    assignedClass: 'Nursery B',
    shiftTime: '09:00 AM - 03:00 PM',
    roomNumber: 'Room 105',
    email: 'varun@gmail.com',
    performance: 88,
    attendance: 94,
    tasksCompleted: 38,
    complianceScore: 90
  },
  {
    id: 't3',
    name: 'Raju Sen',
    avatar: 'RS',
    teacherRegNo: '26EMP1003',
    employeeId: '26EMP0003',
    assignedClass: 'Kindergarten 1',
    shiftTime: '08:30 AM - 02:30 PM',
    roomNumber: 'Room 201',
    email: 'raju@gmail.com',
    performance: 95,
    attendance: 98,
    tasksCompleted: 52,
    complianceScore: 98
  },
  {
    id: 't4',
    name: 'Neha Gupta',
    avatar: 'NG',
    teacherRegNo: '26EMP1004',
    employeeId: '26EMP0004',
    assignedClass: 'Kindergarten 2',
    shiftTime: '09:30 AM - 03:30 PM',
    roomNumber: 'Room 204',
    email: 'neha.gupta@intellitots.com',
    performance: 85,
    attendance: 90,
    tasksCompleted: 30,
    complianceScore: 88
  },
  {
    id: 't5',
    name: 'Vikram Malhotra',
    avatar: 'VM',
    teacherRegNo: '26EMP1005',
    employeeId: '26EMP0005',
    assignedClass: 'Toddlers C',
    shiftTime: '08:00 AM - 02:00 PM',
    roomNumber: 'Room 101',
    email: 'vikram.m@intellitots.com',
    performance: 90,
    attendance: 92,
    tasksCompleted: 41,
    complianceScore: 92
  }
];

export const mockTeachers = [...staticTeachers];

// Default Static Children/Parents
const staticChildren = [
  {
    id: 'c1',
    name: 'Aarav Patel',
    avatar: 'AP',
    age: '3 Years, 2 Months',
    studentRegNo: 'FCI260001001',
    admissionNo: '261FC10001',
    assignedClass: 'Playgroup A',
    parentName: 'Neha Patel',
    parentContact: '+91 98765 43210',
    mood: 'Happy',
    photoUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200&h=200&fit=crop',
    milestones: [
      { name: 'Language & Speech', progress: 85 },
      { name: 'Fine Motor Skills', progress: 70 },
      { name: 'Social Interaction', progress: 90 },
      { name: 'Cognitive Ability', progress: 80 }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&fit=crop', caption: 'Art Class - Finger Painting' },
      { url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&fit=crop', caption: 'Storytime Circle' },
      { url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&fit=crop', caption: 'Outdoor Playground Fun' }
    ],
    timeline: [
      { time: '08:00 AM', event: 'Arrival', desc: 'Checked in by father. Aarav was happy and waved goodbye enthusiastically.' },
      { time: '09:00 AM', event: 'Breakfast', desc: 'Ate 1 bowl of vegetable oats and drank half cup of warm milk.' },
      { time: '10:00 AM', event: 'Learning Activity', desc: 'Shape matching game. Identified circle and triangle successfully.' },
      { time: '11:30 AM', event: 'Snacks', desc: 'Ate sliced apples and bananas. Shared fruits with classmate Kiara.' },
      { time: '01:00 PM', event: 'Nap Time', desc: 'Slept soundly for 1.5 hours. No disturbance.' },
      { time: '03:00 PM', event: 'Play Time', desc: 'Built a giant block tower with Kabir. Demonstrated great cooperation.' },
      { time: '04:00 PM', event: 'Departure', desc: 'Picked up by mother. Smiled and showed his block tower drawing.' }
    ]
  },
  {
    id: 'c2',
    name: 'Kiara Sen',
    avatar: 'KS',
    age: '2 Years, 11 Months',
    studentRegNo: 'FCI260001002',
    admissionNo: '261FC10002',
    assignedClass: 'Playgroup A',
    parentName: 'Nani Sen',
    parentContact: '+91 98123 45678',
    mood: 'Energetic',
    photoUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=200&h=200&fit=crop',
    milestones: [
      { name: 'Language & Speech', progress: 90 },
      { name: 'Fine Motor Skills', progress: 85 },
      { name: 'Social Interaction', progress: 75 },
      { name: 'Cognitive Ability', progress: 85 }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&fit=crop', caption: 'Building Block Castle' },
      { url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&fit=crop', caption: 'Clay Sculpting time' }
    ],
    timeline: [
      { time: '08:15 AM', event: 'Arrival', desc: 'Checked in by mother. Kiara was slightly clingy but settled down within 5 minutes.' },
      { time: '09:00 AM', event: 'Breakfast', desc: 'Finished her whole fruit bowl and half bowl of semolina porridge.' },
      { time: '10:00 AM', event: 'Learning Activity', desc: 'Tracing alphabets. Kiara showed excellent fine motor grip.' },
      { time: '11:30 AM', event: 'Snacks', desc: 'Ate wheat crackers and strawberries.' },
      { time: '01:15 PM', event: 'Nap Time', desc: 'Slept for 1 hour. Woke up active and refreshed.' },
      { time: '03:00 PM', event: 'Play Time', desc: 'Played slide and swings. Enthusiastically led her friends.' },
      { time: '04:00 PM', event: 'Departure', desc: 'Checked out by grandmother. Kiara was excited to explain her clay shapes.' }
    ]
  },
  {
    id: 'c3',
    name: 'Kabir Malhotra',
    avatar: 'KM',
    age: '4 Years, 1 Month',
    studentRegNo: 'FCI260001003',
    admissionNo: '261FC10003',
    assignedClass: 'Nursery B',
    parentName: 'Rahul Malhotra',
    parentContact: '+91 91234 56789',
    mood: 'Curious',
    photoUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200&h=200&fit=crop',
    milestones: [
      { name: 'Language & Speech', progress: 80 },
      { name: 'Fine Motor Skills', progress: 95 },
      { name: 'Social Interaction', progress: 85 },
      { name: 'Cognitive Ability', progress: 90 }
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&fit=crop', caption: 'Math Puzzle session' },
      { url: 'https://images.unsplash.com/photo-1587554801471-37976a256db0?w=400&fit=crop', caption: 'Science Floating Egg Experiment' }
    ],
    timeline: [
      { time: '08:30 AM', event: 'Arrival', desc: 'Checked in by father. Kabir was energetic and ran to the puzzle desk.' },
      { time: '09:00 AM', event: 'Breakfast', desc: 'Finished paneer stuffed paratha and orange juice.' },
      { time: '10:00 AM', event: 'Learning Activity', desc: 'Sorting objects by colors and sizes. Got 100% correct!' },
      { time: '11:30 AM', event: 'Snacks', desc: 'Ate roasted almonds and grapes.' },
      { time: '01:00 PM', event: 'Nap Time', desc: 'Rested quietly. Did not fall fully asleep but stayed relaxed.' },
      { time: '03:00 PM', event: 'Play Time', desc: 'Sandpit building. Created a giant sand castle with a moat.' },
      { time: '04:00 PM', event: 'Departure', desc: 'Picked up by mother. Talked about the floating egg science experiment.' }
    ]
  }
];

export const mockChildren = [...staticChildren];

export const mockTasks = [
  {
    id: 'tsk-1',
    title: 'Curriculum Planning T1',
    desc: 'Complete the Montessori playgroup lesson outline for the upcoming July sessions.',
    status: 'to-do',
    priority: 'high',
    dueDate: '2026-06-20',
    assignee: 't1'
  },
  {
    id: 'tsk-2',
    title: 'Monthly Progress Reports',
    desc: 'Compile child behavior and growth assessments for Playgroup A parents.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-06-18',
    assignee: 't1'
  },
  {
    id: 'tsk-3',
    title: 'Health & Sanitization Audit',
    desc: 'Verify safety checklists and room sanitization standards for Rooms 101 to 105.',
    status: 'review',
    priority: 'medium',
    dueDate: '2026-06-16',
    assignee: 't3'
  },
  {
    id: 'tsk-4',
    title: 'Parent-Teacher Meet Invites',
    desc: 'Send out digital calendars and agenda plans for upcoming parent sync meet.',
    status: 'completed',
    priority: 'low',
    dueDate: '2026-06-14',
    assignee: 't2'
  },
  {
    id: 'tsk-5',
    title: 'Phonics Activity Setup',
    desc: 'Assemble cardboard letter charts and interactive audio speakers in room 201.',
    status: 'to-do',
    priority: 'medium',
    dueDate: '2026-06-22',
    assignee: 't3'
  },
  {
    id: 'tsk-6',
    title: 'Nutrition Chart Revision',
    desc: 'Consult standard pediatric menu guides and draft replacement snacks plan.',
    status: 'in-progress',
    priority: 'low',
    dueDate: '2026-06-25',
    assignee: 't4'
  }
];

export const mockAnnouncements = [
  {
    id: 'ann-1',
    title: 'School Sanitization Drive',
    content: 'The entire school premises will undergo advanced medical-grade sanitization this Saturday from 9 AM to 5 PM. Staff entry will be restricted.',
    priority: 'high',
    createdByName: 'Principal Meera Deshmukh',
    date: '2026-06-14',
    scheduledTime: 'Immediate'
  },
  {
    id: 'ann-2',
    title: 'International Yoga Day Prep',
    content: 'Teachers are requested to practice basic kids yoga moves for the special assembly next Monday. Kids will need to bring soft mats.',
    priority: 'medium',
    createdByName: 'Admin Coordinator Sunil Ray',
    date: '2026-06-12',
    scheduledTime: 'Immediate'
  },
  {
    id: 'ann-3',
    title: 'FirstCry Orange Day Celebration',
    content: 'Our flagship FirstCry Orange Day is scheduled on June 25th. All classrooms must be decorated with orange paper crafts by June 24th evening.',
    priority: 'high',
    createdByName: 'Principal Meera Deshmukh',
    date: '2026-06-10',
    scheduledTime: 'Scheduled for 2026-06-22'
  }
];

// Recharts Compliance and trends data
export const attendanceTrendData = [
  { name: 'Mon', Admin: 92, Teachers: 95, Students: 88 },
  { name: 'Tue', Admin: 95, Teachers: 98, Students: 90 },
  { name: 'Wed', Admin: 98, Teachers: 96, Students: 92 },
  { name: 'Thu', Admin: 96, Teachers: 94, Students: 91 },
  { name: 'Fri', Admin: 95, Teachers: 98, Students: 89 },
  { name: 'Sat', Admin: 80, Teachers: 85, Students: 40 }
];

export const taskCompletionData = [
  { name: 'Week 1', Completed: 12, Pending: 5, Overdue: 2 },
  { name: 'Week 2', Completed: 18, Pending: 4, Overdue: 1 },
  { name: 'Week 3', Completed: 25, Pending: 6, Overdue: 0 },
  { name: 'Week 4', Completed: 32, Pending: 3, Overdue: 0 }
];

export const complianceOverviewData = [
  { name: 'Sanitization', value: 98 },
  { name: 'Child Safety', value: 100 },
  { name: 'Staff Training', value: 92 },
  { name: 'Parent Comm.', value: 90 },
  { name: 'Curriculum Coverage', value: 95 }
];

export const performanceDistributionData = [
  { score: '80-85%', count: 4 },
  { score: '85-90%', count: 12 },
  { score: '90-95%', count: 18 },
  { score: '95-100%', count: 8 }
];

export const teacherRadarPerformance = [
  { subject: 'Attendance', A: 96, B: 90, fullMark: 100 },
  { subject: 'Task Speed', A: 88, B: 95, fullMark: 100 },
  { subject: 'Compliance', A: 95, B: 92, fullMark: 100 },
  { subject: 'Parent Ratings', A: 98, B: 85, fullMark: 100 },
  { subject: 'Class Safety', A: 100, B: 96, fullMark: 100 },
  { subject: 'Activity Planning', A: 92, B: 90, fullMark: 100 }
];

export const staffAttendanceHeatmap = [
  { day: 'Mon', week1: 3, week2: 3, week3: 3, week4: 2 },
  { day: 'Tue', week1: 3, week2: 2, week3: 3, week4: 3 },
  { day: 'Wed', week1: 2, week2: 3, week3: 3, week4: 3 },
  { day: 'Thu', week1: 3, week2: 3, week3: 2, week4: 3 },
  { day: 'Fri', week1: 3, week2: 3, week3: 3, week4: 2 },
  { day: 'Sat', week1: 1, week2: 1, week3: 0, week4: 1 },
  { day: 'Sun', week1: 0, week2: 0, week3: 0, week4: 0 }
];

// Dynamically refresh and synchronize exported mock data arrays with localStorage modifications
export const refreshMockData = () => {
  // 1. Resolve Accounts List
  const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
  const deletedAccountEmails = JSON.parse(localStorage.getItem('deletedAccountEmails') || '[]');
  const editedAccounts = JSON.parse(localStorage.getItem('editedAccounts') || '[]');

  let accountsList = [...staticAccounts];
  accountsList = accountsList.filter(a => !deletedAccountEmails.includes(a.email.toLowerCase()));
  accountsList = accountsList.map(a => {
    const edit = editedAccounts.find(ea => ea.email.toLowerCase() === a.email.toLowerCase());
    return edit ? { ...a, ...edit } : a;
  });
  accountsList = [...accountsList, ...localUsers];

  mockAccounts.splice(0, mockAccounts.length, ...accountsList);

  // 2. Resolve Teachers List
  const localTeachers = JSON.parse(localStorage.getItem('localTeachers') || '[]');
  const deletedTeacherIds = JSON.parse(localStorage.getItem('deletedTeacherIds') || '[]');
  const editedTeachers = JSON.parse(localStorage.getItem('editedTeachers') || '[]');

  let teachersList = [...staticTeachers];
  teachersList = teachersList.filter(t => !deletedTeacherIds.includes(t.id));
  teachersList = teachersList.map(t => {
    const edit = editedTeachers.find(et => et.id === t.id);
    return edit ? { ...t, ...edit } : t;
  });
  teachersList = [...teachersList, ...localTeachers];
  teachersList = teachersList.map(t => ({ ...t, qrCodeUrl: t.qrCodeUrl !== undefined ? t.qrCodeUrl : null }));

  mockTeachers.splice(0, mockTeachers.length, ...teachersList);

  // 3. Resolve Children List
  const localChildren = JSON.parse(localStorage.getItem('localChildren') || '[]');
  const deletedChildIds = JSON.parse(localStorage.getItem('deletedChildIds') || '[]');
  const editedChildren = JSON.parse(localStorage.getItem('editedChildren') || '[]');

  let childrenList = [...staticChildren];
  childrenList = childrenList.filter(c => !deletedChildIds.includes(c.id));
  childrenList = childrenList.map(c => {
    const edit = editedChildren.find(ec => ec.id === c.id);
    return edit ? { ...c, ...edit } : c;
  });
  childrenList = [...childrenList, ...localChildren];
  childrenList = childrenList.map(c => ({ ...c, qrCodeUrl: c.qrCodeUrl !== undefined ? c.qrCodeUrl : null }));

  mockChildren.splice(0, mockChildren.length, ...childrenList);
};

// Initial invocation on module load
refreshMockData();
