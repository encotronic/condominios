/**
 * Devuelve el condominiumId objetivo para la operación.
 * Prioriza el override pasado por query/body solo si el usuario tiene role ADMIN o MANAGER.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
module.exports = function getTargetCondoId(req) {
  try {
    const override = (req.query && req.query.condominiumId) || (req.body && req.body.condominiumId);
    const user = req.user || {};
    // UUID v4 (general UUID) validation
    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

    if (override && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      if (isUuid(override)) {
        try {
          // Audit the override action to a file (JSON lines)
          const fs = require('fs');
          const path = require('path');
          const logsDir = path.resolve(__dirname, '..', '..', '..', 'logs');
          try { fs.mkdirSync(logsDir, { recursive: true }); } catch (e) {}
          const auditEntry = {
            timestamp: new Date().toISOString(),
            userId: user.id || null,
            userRole: user.role || null,
            action: 'condominium_override',
            overrideValue: String(override),
            route: (req.originalUrl || req.url || null),
            method: req.method || null
          };
          const outFile = path.join(logsDir, 'condo_override_audit.log');
          fs.appendFile(outFile, JSON.stringify(auditEntry) + '\n', (err) => {
            if (err) console.error('[getTargetCondoId] Failed to write audit log:', err && err.message ? err.message : err);
          });
        } catch (e) {
          console.warn('[getTargetCondoId] Audit logging failed:', e && e.message ? e.message : e);
        }
        return String(override);
      } else {
        // Ignorar override inválido (evitar errores en consultas a DB)
        console.warn('[getTargetCondoId] Ignoring invalid condominiumId override:', override, 'User:', user.id);
      }
    }

    return user.condoId || null;
  } catch (e) {
    return (req.user && req.user.condoId) || null;
  }
};
