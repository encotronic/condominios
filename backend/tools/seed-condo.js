require('dotenv').config();
const db = require('../src/shared/database/db');
const { randomUUID } = require('crypto');

(async () => {
  try {
    const id = randomUUID();
    const name = 'Condominio Prueba';
    const query = `
      INSERT INTO condominiums (id, name)
      VALUES ($1, $2)
      RETURNING id, name
    `;
    const { rows } = await db.query(query, [id, name]);
    console.log('Inserted condominium:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding condominium:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
