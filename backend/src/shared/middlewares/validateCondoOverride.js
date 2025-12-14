/**
 * Middleware para validar/sanitizar el parámetro `condominiumId` en query o body.
 * Si existe y NO es un UUID válido, lo elimina para evitar errores en la capa de servicio/DB.
 */
module.exports = function validateCondoOverride(req, res, next) {
  try {
    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

    if (req.query && req.query.condominiumId) {
      if (!isUuid(req.query.condominiumId)) {
        // eliminar override inválido
        delete req.query.condominiumId;
        console.warn('[validateCondoOverride] Removed invalid query.condominiumId');
      }
    }

    if (req.body && req.body.condominiumId) {
      if (!isUuid(req.body.condominiumId)) {
        delete req.body.condominiumId;
        console.warn('[validateCondoOverride] Removed invalid body.condominiumId');
      }
    }

    return next();
  } catch (err) {
    // No bloquear la petición por un fallo de sanitización
    return next();
  }
};
