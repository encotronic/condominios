// backend/src/shared/middlewares/roleMiddleware.js

/**
 * Middleware para restringir el acceso basado en el rol del usuario.
 * @param {string[]} allowedRoles - Array de roles permitidos (ej: ['ADMIN', 'MANAGER']).
 * @returns {function} El middleware de Express.
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // 1. Verificar si el middleware de autenticación ya se ejecutó
    if (!req.user || !req.user.role) {
      // Esto solo debería pasar si se olvida poner el authMiddleware antes.
      return res.status(500).json({ message: 'Error de configuración: Role check sin autenticación.' });
    }

    const userRole = req.user.role;

    // 2. Verificar si el rol del usuario está incluido en los roles permitidos
    if (allowedRoles.includes(userRole)) {
      next(); // El usuario tiene el rol permitido, continuar
    } else {
      // Acceso denegado
      return res.status(403).json({ 
        message: 'Acceso prohibido. No tienes el rol o permisos necesarios.', 
        required: allowedRoles 
      });
    }
  };
};

module.exports = roleMiddleware;