require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../src/shared/database/db');
(async () => {
  try {
    const res = await db.query("SELECT id::text, title, created_at FROM announcements WHERE title ILIKE 'PRUEBA%';");
    console.log(res.rows);
    process.exit(0);
  } catch (e) {
    console.error('ERROR', e.message || e);
    process.exit(1);
  }
})();
