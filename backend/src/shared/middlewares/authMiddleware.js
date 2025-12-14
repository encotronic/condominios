// backend/src/shared/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// ⚠️ Recordatorio: Lee la clave secreta desde el .env
const JWT_SECRET = process.env.JWT_SECRET; 

/**
 * Middleware para verificar la validez del token JWT y autenticar al usuario.
 */
const authMiddleware = (req, res, next) => {
  // Permitir bypass en tests si se proporciona `req.body.user` o si SKIP_AUTH está activo
  if (process.env.NODE_ENV === 'test' || process.env.SKIP_AUTH === '1') {
    if (req.body && req.body.user) {
      req.user = req.body.user;
      return next();
    }
    // Si no hay user en body, pero estamos en test, fallar con 401
    const authHeaderTest = req.headers.authorization;
    if (!authHeaderTest) return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

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
    req.user = {
      id: decoded.id,
      role: decoded.role,
      condoId: decoded.condoId 
    };

    console.log('AUTH MIDDLEWARE - User authenticated:', {
      id: req.user.id,
      role: req.user.role,
      condoId: req.user.condoId
    });
    next(); // Continuar a la ruta solicitada

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.', error: error.message });
  }
};

module.exports = authMiddleware;