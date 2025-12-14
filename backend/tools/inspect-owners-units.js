require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/shared/database/db');

(async () => {
  try {
    console.log('Columns for table owners:');
    const colsOwners = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'owners'
      ORDER BY ordinal_position
    `);
    colsOwners.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

    console.log('\nColumns for table units:');
    const colsUnits = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'units'
      ORDER BY ordinal_position
    `);
    colsUnits.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

    process.exit(0);
  } catch (err) {
    console.error('Error inspecting owners/units:', err.message);
    process.exit(1);
  }
})();
