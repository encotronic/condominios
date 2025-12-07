// backend/src/shared/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// ⚠️ Recordatorio: Lee la clave secreta desde el .env
const JWT_SECRET = process.env.JWT_SECRET; 

/**
 * Middleware para verificar la validez del token JWT y autenticar al usuario.
 */
const authMiddleware = (req, res, next) => {
  // 1. Obtener el encabezado de autorización
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  // 2. Extraer el token (quitando 'Bearer ')
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Adjuntar la información de usuario y condominio al objeto de solicitud (req)
    // CRUCIAL para la Multi-Tenancy y para que los servicios sepan QUIÉN y DÓNDE está pidiendo datos.
    req.user = {
      id: decoded.id,
      role: decoded.role,
      condoId: decoded.condoId 
    };

    next(); // Continuar a la ruta solicitada

  } catch (error) {
    // 5. Manejo de errores de JWT (token expirado, inválido, etc.)
    return res.status(401).json({ message: 'Token inválido o expirado.', error: error.message });
  }
};

module.exports = authMiddleware;