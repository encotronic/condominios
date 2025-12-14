const announcementService = require('../services/announcement.service');
const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');

/** Create announcement */
const createAnnouncement = async (req, res) => {
  const condominiumId = getTargetCondoId(req);
  const { id: userId } = req.user;
  const { title, content, visibility, startAt, endAt, pinned } = req.body;

  if (!title || !content) return res.status(400).json({ message: 'Title and content required' });

  try {
    const announcement = await announcementService.create({
      condominiumId,
      authorId: userId,
      title,
      content,
      visibility,
      startAt,
      endAt,
      pinned: !!pinned,
    });
    return res.status(201).json(announcement);
  } catch (err) {
    console.error('Error creating announcement', err);
    return res.status(500).json({ message: err.message || 'Internal error' });
  }
};

/** List announcements for tenant (residents see only published) */
const listAnnouncements = async (req, res) => {
  const condominiumId = getTargetCondoId(req);
  const { id: userId, role } = req.user;
  const { status, onlyPinned } = req.query;

  try {
    const announcements = await announcementService.list({ condominiumId, userId, role, status, onlyPinned });
    return res.status(200).json(announcements);
  } catch (err) {
    console.error('Error listing announcements', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

/** Get announcement by id */
const getAnnouncement = async (req, res) => {
  const condominiumId = getTargetCondoId(req);
  const { id: userId, role } = req.user;
  const { id } = req.params;

  try {
    const announcement = await announcementService.getById({ condominiumId, id, role, userId });
    if (!announcement) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json(announcement);
  } catch (err) {
    console.error('Error getting announcement', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

/** Acknowledge (mark as read) */
const acknowledgeAnnouncement = async (req, res) => {
  const condominiumId = getTargetCondoId(req);
  const { id: userId } = req.user;
  const { id: announcementId } = req.params;

  try {
    await announcementService.markAsRead({ condominiumId, announcementId, userId });
    return res.status(200).json({ message: 'Acknowledged' });
  } catch (err) {
    console.error('Error acknowledging announcement', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

/** Update announcement */
const updateAnnouncement = async (req, res) => {
  const condominiumId = getTargetCondoId(req);
  const { id } = req.params;
  const { title, content, visibility, startAt, endAt, pinned } = req.body;

  try {
    const updated = await announcementService.update({ id, condominiumId, title, content, visibility, startAt, endAt, pinned });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating announcement', err);
    return res.status(500).json({ message: err.message || 'Internal error' });
  }
};

/** Delete announcement */
const deleteAnnouncement = async (req, res) => {
  const condominiumId = getTargetCondoId(req);
  const { id } = req.params;

  try {
    const removed = await announcementService.remove({ id, condominiumId });
    if (!removed) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting announcement', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = {
  createAnnouncement,
  listAnnouncements,
  getAnnouncement,
  acknowledgeAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
