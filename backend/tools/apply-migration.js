#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const db = require('../src/shared/database/db');

(async () => {
  try {
    const sqlPath = path.resolve(__dirname, '..', 'migrations', '002_announcements_consolidated.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('Migration file not found:', sqlPath);
      process.exit(2);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration 002_announcements_consolidated.sql...');
    // Use a client to execute the SQL file
    const client = await db.getClient();
    try {
      await client.query(sql);
      console.log('Migration applied successfully.');
    } catch (err) {
      console.error('Error applying migration:', err.message || err);
      console.error(err.stack || '');
      process.exitCode = 1;
    } finally {
      client.release();
    }
    process.exit(process.exitCode || 0);
  } catch (err) {
    console.error('Fatal error:', err.message || err);
    console.error(err.stack || '');
    process.exit(1);
  }
})();
