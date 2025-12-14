# CHANGELOG

## 2025-12-14 - Nuevo enfoque / Multi-condo selector & Tests

### Añadidos
- Endpoint `GET /api/auth/condominiums` (backend).
- Helper central `getTargetCondoId` para resolver `condominiumId` con validación y auditoría (`backend/src/shared/utils/getTargetCondoId.js`).
- Middleware `validateCondoOverride` para sanitizar overrides no válidos (`backend/src/shared/middlewares/validateCondoOverride.js`).
- Frontend: `CondominiumProvider` y `CondominiumSwitcher` (persistencia en `localStorage`).
- Tests unitarios para `getTargetCondoId` y `validateCondoOverride` (`backend/test/*`).
- Tests de integración con `supertest` (ruta de test `/__test/resolve-condo`).
- CI workflow: `backend/.github/workflows/ci-tests.yml` ejecuta tests con `NODE_ENV=test` y `SKIP_DB_INIT=1`.

### Cambios
- Refactor: separar `app` y `server` para facilitar pruebas (`backend/src/app.js`, `backend/src/server.js`).
- DB init modificado para no abortar tests (`SKIP_DB_INIT` / `NODE_ENV=test`).
- `package.json` actualizado con `jest`, `supertest` y script de tests.

### Notas de seguridad
- Override de `condominiumId` sólo aceptado para roles `ADMIN` y `MANAGER`.
- Overrides válidos auditados en `logs/condo_override_audit.log`.

### Próximos pasos (recomendado)
- Añadir tests end-to-end en CI que ejecuten rutas reales contra DB de pruebas.
- Mover auditoría a tabla en la DB o a sistema de logs central para retención y consultas.
