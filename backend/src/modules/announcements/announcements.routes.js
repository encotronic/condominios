const express = require('express');
const router = express.Router();

const authMiddleware = require('../../shared/middlewares/authMiddleware');
const roleMiddleware = require('../../shared/middlewares/roleMiddleware');
const validateCondoOverride = require('../../shared/middlewares/validateCondoOverride');

// Sanitizar overrides en announcements
router.use(validateCondoOverride);

const announcementController = require('./controllers/announcement.controller');

console.log('[announcements.routes] loaded');

// Create announcement (ADMIN/MANAGER)
router.post('/', authMiddleware, roleMiddleware(['ADMIN','MANAGER']), announcementController.createAnnouncement);

// List announcements (tenant scoped)
router.get('/', authMiddleware, announcementController.listAnnouncements);

// Get announcement detail
router.get('/:id', authMiddleware, announcementController.getAnnouncement);

// Acknowledge (mark as read)
router.post('/:id/ack', authMiddleware, announcementController.acknowledgeAnnouncement);

// Update announcement (ADMIN/MANAGER)
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN','MANAGER']), announcementController.updateAnnouncement);

// Delete announcement (ADMIN/MANAGER)
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN','MANAGER']), announcementController.deleteAnnouncement);
module.exports = router;
