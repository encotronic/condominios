// backend/src/modules/reports/reports.routes.js
const express = require('express');
const router = express.Router();

// Importar Middlewares
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const roleMiddleware = require('../../shared/middlewares/roleMiddleware');
const validateCondoOverride = require('../../shared/middlewares/validateCondoOverride');

// Sanitizar overrides en las rutas de reports
router.use(validateCondoOverride);

// Importar Controladores
const reportsController = require('./controllers/reports.controller');

// ===============================================
// RUTAS DE REPORTES (REPORTS)
// ===============================================

// 1. ESTADO DE CUENTA PARA UNIT_OWNER (su propia unidad)
// UNIT_OWNER accede sin unitId, se detecta automáticamente
router.get(
    '/unit-statement',
    authMiddleware,
    reportsController.getUnitStatementController
);

// 2. ESTADO DE CUENTA PARA UNIDAD ESPECÍFICA (ADMIN/MANAGER)
router.get(
    '/unit-statement/:unitId',
    authMiddleware,
    reportsController.getUnitStatementByIdController
);

// 3. REPORTE DE MOROSIDAD
// Permisos: Solo ADMIN/MANAGER
router.get(
    '/delinquency',
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    reportsController.getDelinquencyReportController
);

// 4. RESUMEN FINANCIERO DEL CONDOMINIO
// Permisos: Solo ADMIN/MANAGER
router.get(
    '/financial-summary',
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    reportsController.getFinancialSummaryController
);

// 5. HISTORIAL COMPLETO DE PAGOS
// Permisos: ADMIN/MANAGER ven todos, UNIT_OWNER solo los suyos
router.get(
    '/payment-history',
    authMiddleware,
    reportsController.getPaymentHistoryController
);

// 6. REPORTE DE UNIDADES (listado con resumen)
// Permisos: Solo ADMIN/MANAGER
router.get(
    '/units-summary',
    authMiddleware,
    roleMiddleware(['ADMIN', 'MANAGER']),
    reportsController.getUnitsSummaryController
);

module.exports = router;