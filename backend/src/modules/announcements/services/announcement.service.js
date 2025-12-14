const announcementModel = require('../models/announcement.model');

const create = async ({ condominiumId, authorId, title, content, visibility = 'BUILDING', startAt = null, endAt = null, pinned = false }) => {
  const now = new Date();
  const status = startAt && new Date(startAt) > now ? 'SCHEDULED' : 'PUBLISHED';
  const publishedAt = status === 'PUBLISHED' ? now : null;

  // Nota: la columna en la BD se llama `expires_at` (migration consolidated),
  // por eso mapeamos `endAt` a `expiresAt` al insertar.
  const created = await announcementModel.insert({ condominiumId, authorId, title, content, visibility, status, startAt, expiresAt: endAt, pinned, publishedAt });
  return created;
};

const matchesTargets = (targets = [], { role, userId }) => {
  if (!targets || targets.length === 0) return true; // no targets -> visible to all by default
  for (const t of targets) {
    try {
      const ty = t.type && String(t.type).toLowerCase();
      if (ty === 'all') return true;
      if (ty === 'role' && t.role && String(t.role).toUpperCase() === String(role).toUpperCase()) return true;
      if (ty === 'user' && t.user_id && t.user_id === userId) return true;
    } catch (err) {
      // ignore malformed target entries
      continue;
    }
  }
  return false;
};

const list = async ({ condominiumId, userId, role, status, onlyPinned }) => {
  // Residents see only PUBLISHED by default
  const effectiveStatus = role === 'RESIDENT' ? 'PUBLISHED' : status || null;
  const rows = await announcementModel.findAll({ condominiumId, userId, status: effectiveStatus, onlyPinned });
  // Filter by announcement_targets per announcement
  const filtered = rows.filter(r => matchesTargets(r.targets, { role, userId }));
  return filtered;
};

const getById = async ({ condominiumId, id, role, userId }) => {
  const announcement = await announcementModel.findById({ id, condominiumId, userId });
  if (!announcement) return null;
  // if role is resident, only allow published
  if (role === 'RESIDENT' && announcement.status !== 'PUBLISHED') return null;
  if (!matchesTargets(announcement.targets, { role, userId })) return null;
  return announcement;
};

const markAsRead = async ({ condominiumId, announcementId, userId }) => {
  return announcementModel.insertReadReceipt({ condominiumId, announcementId, userId });
};

const update = async ({ id, condominiumId, title, content, visibility = 'BUILDING', startAt = null, endAt = null, pinned = false }) => {
  const now = new Date();
  const status = startAt && new Date(startAt) > now ? 'SCHEDULED' : 'PUBLISHED';
  const publishedAt = status === 'PUBLISHED' ? now : null;

  const updated = await announcementModel.update({ id, condominiumId, title, content, visibility, status, startAt, expiresAt: endAt, pinned, publishedAt });
  return updated;
};

const remove = async ({ id, condominiumId }) => {
  const removed = await announcementModel.remove({ id, condominiumId });
  return removed;
};
module.exports = {
  create,
  list,
  getById,
  markAsRead,
  update,
  remove,
};
