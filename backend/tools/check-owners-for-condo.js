require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/shared/database/db');

const condoId = process.argv[2];
if (!condoId) {
  console.error('Uso: node check-owners-for-condo.js <condoId>');
  process.exit(2);
}

(async () => {
  try {
    const res = await db.query('SELECT id, full_name, email, created_at FROM owners WHERE condominium_id = $1 ORDER BY created_at DESC LIMIT 10', [condoId]);
    console.log('Owners encontrados:', res.rowCount);
    res.rows.forEach(r => console.log(r));
    process.exit(0);
  } catch (err) {
    console.error('Error checking owners:', err.message);
    process.exit(1);
  }
})();
