// backend/src/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./controllers/auth.controller');

// Definición de endpoints
router.post('/register', authController.registerController);
router.post('/login', authController.loginController);

module.exports = router;