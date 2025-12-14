// backend/src/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./controllers/auth.controller');
const authMiddleware = require('../../shared/middlewares/authMiddleware');

// Definición de endpoints
router.post('/register', authController.registerController);
router.post('/login', authController.loginController);
router.get('/condominiums', authMiddleware, authController.getCondominiumsController);

module.exports = router;