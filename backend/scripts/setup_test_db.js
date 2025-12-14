// backend/scripts/setup_test_db.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const db = require('../src/shared/database/db');

async function run() {
  try {
    console.log('[setup_test_db] Creating test schema...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        condominium_id UUID,
        author_id UUID,
        title text,
        content text,
        visibility text,
        status text,
        start_at timestamptz,
        expires_at timestamptz,
        pinned boolean DEFAULT false,
        published_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS announcement_targets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
        target jsonb
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
        condominium_id UUID,
        user_id UUID,
        read_at timestamptz DEFAULT now(),
        UNIQUE (announcement_id, user_id)
      );
    `);

    console.log('[setup_test_db] Schema ready');
    process.exit(0);
  } catch (err) {
    console.error('[setup_test_db] Error creating schema', err);
    process.exit(1);
  }
}

run();
