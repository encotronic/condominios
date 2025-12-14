// backend/src/modules/billing/billing.routes.js
const express = require('express');
const router = express.Router();

// Middlewares de seguridad
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const roleMiddleware = require('../../shared/middlewares/roleMiddleware');
const validateCondoOverride = require('../../shared/middlewares/validateCondoOverride');

// Controlador existente de facturación
const billingController = require('./controllers/billing.controller');

// Nuevo controlador de cargos
const chargeController = require('./controllers/charge.controller');

// ===============================================
// RUTAS DE CARGOS (CHARGES) - CRUD COMPLETO
// ===============================================

// Obtener todos los cargos / Crear nuevo cargo
// Aplicar sanitización de override en este router
router.use(validateCondoOverride);

router.route('/charges')
    .get(
        authMiddleware,
        roleMiddleware(['ADMIN', 'MANAGER']),
        chargeController.getChargesController
    )
    .post(
        authMiddleware,
        roleMiddleware(['ADMIN', 'MANAGER']),
        chargeController.createChargeController
    );

// Obtener, actualizar o eliminar un cargo por ID
router.route('/charges/:id')
    .get(
        authMiddleware,
        roleMiddleware(['ADMIN', 'MANAGER']),
        chargeController.getChargeByIdController
    )
    .put(
        authMiddleware,
        roleMiddleware(['ADMIN', 'MANAGER']),
        chargeController.updateChargeController
    )
    .delete(
        authMiddleware,
        roleMiddleware(['ADMIN', 'MANAGER']),
        chargeController.deleteChargeController
    );

// Ruta adicional: Obtener cargos activos (accesible también para residentes)
router.get('/charges/active',
    authMiddleware,
    chargeController.getChargesController // Usamos el mismo controller por ahora
);

// ===============================================
// RUTAS EXISTENTES DE FACTURACIÓN
// ===============================================

// Generar periodo de facturación
router.post('/generate',
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    billingController.generateBillingController
);

// Listar registros de deuda
router.get('/debts',
    authMiddleware,
    billingController.listDebtRecordsController
);

module.exports = router;