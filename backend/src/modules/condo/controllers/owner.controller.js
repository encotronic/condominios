// backend/src/modules/condo/controllers/owner.controller.js

const ownerService = require('../services/owner.service');

/**
 * [POST] Crea un nuevo propietario.
 * Roles: ADMIN, MANAGER
 */
const createOwnerController = async (req, res) => {
    console.log('CREATE OWNER REQUEST:', req.body, 'USER:', req.user);
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { fullName, email, phone, userId } = req.body; 

    if (!fullName || !email) {
        return res.status(400).json({ message: 'Nombre completo y correo electrónico son requeridos.' });
    }

    try {
         const newOwner = await ownerService.createOwner({
            fullName, 
            email, 
            phone, 
            userId: userId || null,  
            condominiumId            
        });
        return res.status(201).json({ message: 'Propietario creado exitosamente.', owner: newOwner });
    } catch (error) {
        if (error.message.includes('validación')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error al crear el propietario:', error);
        return res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud.' });
    }
};

/**
 * [GET] Obtiene todos los propietarios del condominio.
 * Roles: ADMIN, MANAGER
 */
const getOwnersController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);

    try {
        const owners = await ownerService.getOwnersByCondoId(condominiumId);
        return res.status(200).json(owners);
    } catch (error) {
        console.error('Error al obtener los propietarios:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener la lista de propietarios.' });
    }
};

/**
 * [GET] Obtiene un propietario por su ID.
 * Roles: ADMIN, MANAGER
 */
const getOwnerByIdController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { id } = req.params;

    try {
        const owner = await ownerService.getOwnerById(id, condominiumId);
        
        if (!owner) {
            return res.status(404).json({ message: 'Propietario no encontrado o no pertenece a este condominio.' });
        }
        
        return res.status(200).json(owner);
    } catch (error) {
        console.error('Error al obtener el propietario por ID:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * [PUT] Actualiza un propietario específico.
 * Roles: ADMIN, MANAGER
 */
const updateOwnerController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { id } = req.params;
    const { fullName, email, phone } = req.body;

    if (!fullName && !email && !phone) {
        return res.status(400).json({ message: 'Se requiere al menos un campo para actualizar (fullName, email o phone).' });
    }
    
    try {
        const updatedOwner = await ownerService.updateOwner(id, condominiumId, {
            fullName,
            email,
            phone
        });

        return res.status(200).json({ message: 'Propietario actualizado exitosamente.', owner: updatedOwner });
    } catch (error) {
        if (error.message.includes('no encontrado') || error.message.includes('no pertenece')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('validación') || error.message.includes('campos válidos')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error al actualizar el propietario:', error);
        return res.status(500).json({ message: 'Error interno al actualizar el propietario.' });
    }
};

/**
 * [DELETE] Elimina un propietario específico.
 * Roles: ADMIN, MANAGER
 */
const deleteOwnerController = async (req, res) => {
    const getTargetCondoId = require('../../../shared/utils/getTargetCondoId');
    const condominiumId = getTargetCondoId(req);
    const { id } = req.params;

    try {
        await ownerService.deleteOwner(id, condominiumId);
        return res.status(204).send(); 
    } catch (error) {
        if (error.message.includes('no encontrado') || error.message.includes('no pertenece')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('asociadas')) { 
            return res.status(409).json({ message: error.message });
        }
        console.error('Error al eliminar el propietario:', error);
        return res.status(500).json({ message: 'Error interno al eliminar el propietario.' });
    }
};


module.exports = {
    createOwnerController,
    getOwnersController,
    getOwnerByIdController,
    updateOwnerController,
    deleteOwnerController
};