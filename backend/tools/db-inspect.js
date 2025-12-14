require('dotenv').config();
const db = require('../src/shared/database/db');

(async () => {
  try {
    console.log('Listing public tables...');
    const tablesRes = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Tables:', tables.join(', '));

    if (tables.includes('condominiums')) {
      console.log('\nColumns for table condominiums:');
      const colsRes = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'condominiums'
        ORDER BY ordinal_position
      `);
      colsRes.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));
    } else {
      console.log('\nTable `condominiums` not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error inspecting DB:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
