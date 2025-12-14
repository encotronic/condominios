const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../src/shared/database/db');

(async () => {
  try {
    const condominiumId = 'b2faeeae-d38d-478e-a409-1a483c27bfc9';
    const authorId = '7f2bf6b1-646c-4e73-bfae-a5c07c54730d';

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const insertSql = `INSERT INTO announcements (title, content, condominium_id, published_at, start_at, pinned, visibility, author_id)
        VALUES ($1,$2,$3,now(),now(),$4,$5,$6) RETURNING id, created_at`;
      const vals = [
        'PRUEBA: Anuncio de integración (DB)',
        'Anuncio insertado por script para pruebas e2e.',
        condominiumId,
        true,
        'BUILDING',
        authorId,
      ];

      const res = await client.query(insertSql, vals);
      const announcementId = res.rows[0].id;

      const target = { type: 'ALL' };
      await client.query(
        'INSERT INTO announcement_targets (announcement_id, target, condominium_id) VALUES ($1, $2, $3)',
        [announcementId, JSON.stringify(target), condominiumId]
      );

      await client.query('COMMIT');
      console.log('OK: announcement inserted', announcementId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    process.exit(0);
  } catch (err) {
    console.error('ERROR inserting announcement:', err.message || err);
    process.exit(1);
  }
})();
