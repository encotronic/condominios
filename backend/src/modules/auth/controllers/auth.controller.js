// backend/src/modules/auth/controllers/auth.controller.js
const authService = require('../services/auth.service');

/**
 * Maneja la petición POST /api/auth/register
 * * Recibe: email, password, fullName, condominiumId.
 * Llama al Servicio para ejecutar la lógica de negocio.
 */
const registerController = async (req, res) => {
  const { email, password, fullName, condominiumId } = req.body;

  // 1. Validar la entrada básica (El Servicio valida las reglas de negocio)
  if (!email || !password || !fullName || !condominiumId) {
    return res.status(400).json({ message: 'Todos los campos (email, password, fullName, condominiumId) son requeridos.' });
  }

  try {
    // 2. Llamar al Servicio (EL CEREBRO)
    const newUser = await authService.register({ email, password, fullName, condominiumId });
    
    // 3. Enviar respuesta exitosa
    return res.status(201).json({ 
      message: 'Registro exitoso. Ya puedes iniciar sesión.', 
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        condominiumId: newUser.condominiumId
      }
    });
  } catch (error) {
    // 4. Manejar errores del servicio (ej: email duplicado, condominio inexistente)
    let statusCode = 500;
    if (error.message.includes('ya está registrado')) {
      statusCode = 409; // Conflict
    } else if (error.message.includes('no existe')) {
      statusCode = 400; // Bad Request
    }
    return res.status(statusCode).json({ message: error.message || 'Error interno del servidor al registrar.' });
  }
};

/**
 * Maneja la petición POST /api/auth/login
 * * Recibe: email, password, condominiumId.
 * Llama al Servicio para autenticar y generar el JWT.
 */
const loginController = async (req, res) => {
  const { email, password, condominiumId } = req.body;

  if (!email || !password || !condominiumId) {
    return res.status(400).json({ message: 'Email, contraseña e ID de condominio son requeridos.' });
  }

  try {
    // 2. Llamar al Servicio (EL CEREBRO)
    const loginResult = await authService.login({ email, password, condominiumId });
    
    // 3. Enviar respuesta con el token
    return res.status(200).json({ 
      message: 'Login exitoso.',
      token: loginResult.token,
      role: loginResult.role,
      fullName: loginResult.fullName,
      condominiumId: loginResult.condoId
    });
  } catch (error) {
    // 4. Manejar errores del servicio (ej: credenciales inválidas)
    const statusCode = error.message.includes('Credenciales inválidas') ? 401 : 500;
    return res.status(statusCode).json({ message: 'Credenciales inválidas o datos de condominio incorrectos.' });
  }
};

module.exports = {
  registerController,
  loginController,
};