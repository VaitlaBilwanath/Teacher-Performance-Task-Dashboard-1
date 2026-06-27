const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function backup() {
  console.log('--- Nightly Database Backup ---');
  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `nightly-backup-${timestamp}.sql`);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not defined in .env');

    console.log(`⏳ Executing backup to ${backupFile}...`);
    execSync(`pg_dump "${dbUrl}" > "${backupFile}"`);
    console.log(`✅ Backup successful: ${backupFile}`);

    // Cleanup backups older than 7 days
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stat = fs.statSync(filePath);
      const daysOld = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);
      if (daysOld > 7) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old backup(s).`);
    }

  } catch (e) {
    console.error('❌ Backup failed!');
    console.error(e.message);
    process.exit(1);
  }
}

backup();
