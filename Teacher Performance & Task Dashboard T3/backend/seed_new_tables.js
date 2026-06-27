const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding new tables...');
  const teachers = await prisma.teacher.findMany({ include: { classroom: true } });
  
  for (const teacher of teachers) {
    const isPresent = Math.random() > 0.1;
    await prisma.teacherAttendance.create({
      data: {
        teacherId: teacher.id,
        date: new Date(new Date().setHours(0,0,0,0)),
        status: isPresent ? 'PRESENT' : 'ABSENT'
      }
    }).catch(() => {});

    if (isPresent) {
      await prisma.dutyRoster.create({
        data: {
          teacherId: teacher.id,
          date: new Date(new Date().setHours(0,0,0,0)),
          room: `Room ${Math.floor(Math.random() * (205 - 101 + 1)) + 101}`,
          shift: teacher.shiftTime || '09:00 AM - 03:00 PM',
          className: teacher.classroom ? teacher.classroom.name : 'Playgroup A'
        }
      }).catch(() => {});
    }
  }
  console.log('Done seeding new tables');
}

main().finally(() => prisma.$disconnect());
