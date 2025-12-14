#!/usr/bin/env node
const { randomUUID } = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../src/shared/database/db');

async function main() {
  try {
    const args = process.argv.slice(2);
    const argMap = {};
    args.forEach((a, i) => {
      if (a.startsWith('--')) {
        const key = a.replace(/^--/, '');
        const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
        argMap[key] = val;
      }
    });

    const condoId = argMap.condoId || process.env.CONDO_ID;
    if (!condoId) {
      console.error('Usa: node backend/tools/seed-owner-unit.js --condoId <CONDO_ID>');
      process.exit(2);
    }

    // Verificar que el condominio existe
    const condoRes = await db.query('SELECT id, name FROM condominiums WHERE id = $1', [condoId]);
    if (condoRes.rowCount === 0) {
      console.error('El condominiumId especificado no existe:', condoId);
      process.exit(3);
    }

    const ownerId = randomUUID();
    const unitId = randomUUID();
    const userId = randomUUID();

    // Hashear una contraseña de ejemplo (password: "password123")
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Usar transacción para insertar user -> owner -> unit (consistencia con FKs)
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const insertUserText = `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, condominium_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, email, role`;
      const userRes = await client.query(insertUserText, [userId, `user.owner+${userId.slice(0,6)}@example.com`, passwordHash, 'Owner Prueba Usuario', '+000000000', 'UNIT_OWNER', true, condoId]);

      const insertOwnerText = `INSERT INTO owners (id, user_id, full_name, email, phone, condominium_id)
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, user_id, full_name`;
      const ownerRes = await client.query(insertOwnerText, [ownerId, userId, 'Owner Prueba', `owner.prueba+${ownerId.slice(0,6)}@example.com`, '+000000000', condoId]);

      const insertUnitText = `INSERT INTO units (id, code, condominium_id, owner_id, aliquot_percentage)
        VALUES ($1,$2,$3,$4,$5) RETURNING id, code`;
      const unitRes = await client.query(insertUnitText, [unitId, `U-${Date.now() % 100000}`, condoId, userId, 1.0]);

      await client.query('COMMIT');
      console.log('✅ User insertado:', userRes.rows[0]);
      console.log('✅ Owner insertado:', ownerRes.rows[0]);
      console.log('✅ Unit insertada:', unitRes.rows[0]);
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    process.exit(0);
  } catch (err) {
    console.error('Error al seedear owner+unit:', err && err.message ? err.message : err);
    process.exit(4);
  }
}

main();
