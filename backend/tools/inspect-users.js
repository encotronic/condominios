require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/shared/database/db');

(async () => {
  try {
    const cols = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('Columns for table users:');
    cols.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting users:', err.message);
    process.exit(1);
  }
})();
