// backend/src/modules/units/unit.routes.js
const express = require('express');
const router = express.Router();

// Importar Middlewares de Seguridad
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const roleMiddleware = require('../../shared/middlewares/roleMiddleware');

// Importar el Controlador
const unitController = require('./controllers/unit.controller');

// ⚠️ RUTA PRIVADA RESTRINGIDA (Solo ADMIN/MANAGER puede crear unidades)
router.post(
    '/', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), // Solo el personal administrativo puede crear
    unitController.createUnitController
);

// ⚠️ RUTA PRIVADA (Cualquier usuario logueado puede ver las unidades de su condominio)
router.get(
    '/', 
    authMiddleware, 
    unitController.getUnitsController
);

module.exports = router;