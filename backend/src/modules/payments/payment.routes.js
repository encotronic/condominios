// backend/src/modules/payments/payment.routes.js
const express = require('express');
const router = express.Router();

// Importar Middlewares de Seguridad
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const roleMiddleware = require('../../shared/middlewares/roleMiddleware');

// Importar los Controladores
const paymentController = require('./controllers/payment.controller');

// ===============================================
// RUTAS DE PAGOS (PAYMENTS) - CRUD COMPLETO
// ===============================================

// 1. REGISTRAR UN PAGO (cualquier usuario autenticado)
router.post(
    '/register/:recordId',
    authMiddleware,
    paymentController.registerPaymentController
);

// 2. OBTENER TODOS LOS PAGOS
// ADMIN/MANAGER: ve todos, UNIT_OWNER: solo los suyos
router.get(
    '/',
    authMiddleware,
    paymentController.getAllPaymentsController
);

// 3. OBTENER PAGOS POR UNIDAD
router.get(
    '/unit/:unitId',
    authMiddleware,
    paymentController.getPaymentsByUnitController
);

// 4. OBTENER UN PAGO ESPECÍFICO
router.get(
    '/:id',
    authMiddleware,
    paymentController.getPaymentByIdController
);

// 5. RESUMEN DE PAGOS (solo ADMIN/MANAGER)
router.get(
    '/summary',
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    paymentController.getPaymentsSummaryController
);

module.exports = router;