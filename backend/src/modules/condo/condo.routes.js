// backend/src/modules/condo/condo.routes.js
const express = require('express');
const router = express.Router();

// Middlewares de seguridad
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const roleMiddleware = require('../../shared/middlewares/roleMiddleware');
const validateCondoOverride = require('../../shared/middlewares/validateCondoOverride');

// Sanitizar overrides en condo routes
router.use(validateCondoOverride);

// Controladores de Unidades (CRUD completo)
const { 
    createUnitController, 
    getUnitsController,
    getUnitByIdController, 
    updateUnitController, 
    deleteUnitController   
} = require('./controllers/unit.controller'); 

// Controladores de Propietarios (CRUD completo)
const {
    createOwnerController,
    getOwnersController,
    getOwnerByIdController,  // NUEVO: Obtener por ID
    updateOwnerController,   // NUEVO: Actualizar
    deleteOwnerController    // NUEVO: Eliminar
} = require('./controllers/owner.controller');


// ===============================================
// RUTAS DE UNIDADES (CRUD COMPLETO)
// ===============================================

// 1. OBTENER TODAS LAS UNIDADES
router.get('/units', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER', 'UNIT_OWNER']), 
    getUnitsController 
);

// 2. CREAR UNA NUEVA UNIDAD
router.post('/units', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    createUnitController 
);

// 3. OBTENER UNIDAD POR ID
router.get('/units/:id', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER', 'UNIT_OWNER']), 
    getUnitByIdController 
);

// 4. ACTUALIZAR UNIDAD
router.put('/units/:id', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    updateUnitController 
);

// 5. ELIMINAR UNIDAD
router.delete('/units/:id', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    deleteUnitController 
);


// ===============================================
// RUTAS DE PROPIETARIOS (CRUD COMPLETO)
// ===============================================

// 6. OBTENER LISTA DE PROPIETARIOS
router.get('/owners', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    getOwnersController
);

// 7. CREAR UN NUEVO PROPIETARIO
router.post('/owners', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    createOwnerController
);

// 8. OBTENER PROPIETARIO POR ID
router.get('/owners/:id', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    getOwnerByIdController
);

// 9. ACTUALIZAR PROPIETARIO
router.put('/owners/:id', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    updateOwnerController
);

// 10. ELIMINAR PROPIETARIO
router.delete('/owners/:id', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    deleteOwnerController
);


// ===============================================
// RUTAS DE PRUEBA Y LEGADO
// ===============================================

// Ruta pública (ya existente)
router.get('/info', authMiddleware, (req, res) => {
    return res.status(200).json({
        message: `Acceso público (solo requiere token). ID de usuario: ${req.user.id}`
    });
});

// RUTA RESTRINGIDA: Solo para ADMINS y GESTORES (ya existente)
router.get('/admin-settings', 
    authMiddleware, 
    roleMiddleware(['ADMIN', 'MANAGER']), 
    (req, res) => {
        return res.status(200).json({
            message: `Bienvenido Admin ${req.user.id}`,
            data: 'Acceso a ajustes financieros críticos.'
        });
    }
);

module.exports = router;