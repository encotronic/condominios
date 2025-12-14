const db = require('../../../shared/database/db');

const insert = async ({ condominiumId, authorId, title, content, visibility, status, startAt, expiresAt, pinned, publishedAt }) => {
  const result = await db.query(
    `INSERT INTO announcements (condominium_id, author_id, title, content, visibility, status, start_at, expires_at, pinned, published_at, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now()) RETURNING *`,
    [condominiumId, authorId, title, content, visibility, status, startAt, expiresAt, pinned, publishedAt]
  );
  return result.rows[0];
};

// DEBUG: helper para loguear antes de ejecutar (útil en desarrollo)

// (debugInsert will be exported at the end with other functions)

const findAll = async ({ condominiumId, userId = null, status = null, onlyPinned = false }) => {
  // Build base query: aggregate targets per announcement and compute read_by_user via EXISTS
  let params = [condominiumId, userId];
  let sql = `
    SELECT a.*, COALESCE(t.targets, '[]') AS targets,
      (EXISTS (SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.user_id = $2)) AS read_by_user
    FROM announcements a
    LEFT JOIN (
      SELECT announcement_id, jsonb_agg(target) AS targets
      FROM announcement_targets
      GROUP BY announcement_id
    ) t ON t.announcement_id = a.id
    WHERE a.condominium_id = $1
  `;

  if (status) {
    params.push(status);
    sql += ` AND a.status = $${params.length}`;
  }
  if (onlyPinned) {
    params.push(true);
    sql += ` AND a.pinned = $${params.length}`;
  }

  sql += ` ORDER BY a.pinned DESC, a.published_at DESC, a.created_at DESC`;

  const res = await db.query(sql, params);
  return res.rows;
};

const findById = async ({ id, condominiumId, userId = null }) => {
  const params = [id, condominiumId, userId];
  const sql = `
    SELECT a.*, COALESCE(t.targets, '[]') AS targets,
      (EXISTS (SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.user_id = $3)) AS read_by_user
    FROM announcements a
    LEFT JOIN (
      SELECT announcement_id, jsonb_agg(target) AS targets
      FROM announcement_targets
      GROUP BY announcement_id
    ) t ON t.announcement_id = a.id
    WHERE a.id = $1 AND a.condominium_id = $2
    LIMIT 1
  `;
  const res = await db.query(sql, params);
  return res.rows[0];
};

const insertReadReceipt = async ({ condominiumId, announcementId, userId }) => {
  // Upsert pattern: avoid duplicates
  await db.query(
    `INSERT INTO announcement_reads (announcement_id, condominium_id, user_id, read_at)
     VALUES ($1,$2,$3, now())
     ON CONFLICT (announcement_id, user_id) DO UPDATE SET read_at = now()`,
    [announcementId, condominiumId, userId]
  );
  return true;
};

const update = async ({ id, condominiumId, title, content, visibility, status, startAt, expiresAt, pinned, publishedAt }) => {
  const result = await db.query(
    `UPDATE announcements SET title = $1, content = $2, visibility = $3, status = $4, start_at = $5, expires_at = $6, pinned = $7, published_at = $8, updated_at = now()
     WHERE id = $9 AND condominium_id = $10 RETURNING *`,
    [title, content, visibility, status, startAt, expiresAt, pinned, publishedAt, id, condominiumId]
  );
  return result.rows[0];
};

const remove = async ({ id, condominiumId }) => {
  const result = await db.query(
    `DELETE FROM announcements WHERE id = $1 AND condominium_id = $2 RETURNING *`,
    [id, condominiumId]
  );
  return result.rows[0];
};

module.exports = {
  insert,
  findAll,
  findById,
  insertReadReceipt,
  update,
  remove,
};
