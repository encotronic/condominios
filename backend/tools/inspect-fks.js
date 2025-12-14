require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/shared/database/db');

(async () => {
  try {
    const q = `
      SELECT
        tc.constraint_name, tc.table_name, kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'units';
    `;
    const res = await db.query(q);
    console.log('FK constraints for table "units":');
    res.rows.forEach(r => console.log(r));
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting FKs:', err.message);
    process.exit(1);
  }
})();
