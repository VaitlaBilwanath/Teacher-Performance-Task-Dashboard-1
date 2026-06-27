const { PrismaClient } = require('@prisma/client');

const basePrisma = new PrismaClient();

const prisma = basePrisma.$extends({
  result: {
    student: {
      milestones: {
        needs: { milestones: true },
        compute(student) {
          try {
            return student.milestones ? (typeof student.milestones === 'string' ? JSON.parse(student.milestones) : student.milestones) : [];
          } catch {
            return [];
          }
        }
      },
      photos: {
        needs: { photos: true },
        compute(student) {
          try {
            return student.photos ? (typeof student.photos === 'string' ? JSON.parse(student.photos) : student.photos) : [];
          } catch {
            return [];
          }
        }
      },
      timeline: {
        needs: { timeline: true },
        compute(student) {
          try {
            return student.timeline ? (typeof student.timeline === 'string' ? JSON.parse(student.timeline) : student.timeline) : [];
          } catch {
            return [];
          }
        }
      },
      notes: {
        needs: { notes: true },
        compute(student) {
          try {
            return student.notes ? (typeof student.notes === 'string' ? JSON.parse(student.notes) : student.notes) : [];
          } catch {
            return [];
          }
        }
      }
    },
    auditLog: {
      oldValues: {
        needs: { oldValues: true },
        compute(log) {
          try {
            return log.oldValues ? (typeof log.oldValues === 'string' ? JSON.parse(log.oldValues) : log.oldValues) : null;
          } catch {
            return null;
          }
        }
      },
      newValues: {
        needs: { newValues: true },
        compute(log) {
          try {
            return log.newValues ? (typeof log.newValues === 'string' ? JSON.parse(log.newValues) : log.newValues) : null;
          } catch {
            return null;
          }
        }
      }
    }
  },
  query: {
    student: {
      async create({ args, query }) {
        if (args.data.milestones !== undefined) args.data.milestones = JSON.stringify(args.data.milestones);
        if (args.data.photos !== undefined) args.data.photos = JSON.stringify(args.data.photos);
        if (args.data.timeline !== undefined) args.data.timeline = JSON.stringify(args.data.timeline);
        if (args.data.notes !== undefined) args.data.notes = JSON.stringify(args.data.notes);
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.milestones !== undefined) args.data.milestones = JSON.stringify(args.data.milestones);
        if (args.data.photos !== undefined) args.data.photos = JSON.stringify(args.data.photos);
        if (args.data.timeline !== undefined) args.data.timeline = JSON.stringify(args.data.timeline);
        if (args.data.notes !== undefined) args.data.notes = JSON.stringify(args.data.notes);
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create.milestones !== undefined) args.create.milestones = JSON.stringify(args.create.milestones);
        if (args.create.photos !== undefined) args.create.photos = JSON.stringify(args.create.photos);
        if (args.create.timeline !== undefined) args.create.timeline = JSON.stringify(args.create.timeline);
        if (args.create.notes !== undefined) args.create.notes = JSON.stringify(args.create.notes);
        
        if (args.update.milestones !== undefined) args.update.milestones = JSON.stringify(args.update.milestones);
        if (args.update.photos !== undefined) args.update.photos = JSON.stringify(args.update.photos);
        if (args.update.timeline !== undefined) args.update.timeline = JSON.stringify(args.update.timeline);
        if (args.update.notes !== undefined) args.update.notes = JSON.stringify(args.update.notes);
        return query(args);
      }
    },
    auditLog: {
      async create({ args, query }) {
        if (args.data.oldValues !== undefined) args.data.oldValues = JSON.stringify(args.data.oldValues);
        if (args.data.newValues !== undefined) args.data.newValues = JSON.stringify(args.data.newValues);
        return query(args);
      }
    }
  }
});

module.exports = prisma;
