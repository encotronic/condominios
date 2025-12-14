Backend: Draft PR - Multi-condo selector, validation, tests and CI

Resumen:

- Añade helper `getTargetCondoId` que centraliza la resolución del `condominiumId` considerando override seguro para roles `ADMIN`/`MANAGER` y audit logging.
- Añade middleware `validateCondoOverride` para sanitizar valores no-UUID en query/body.
- Refactor sencillo de la app: extraer `app` en `src/app.js` y `server.js` sólo arranca el listener (mejora testabilidad).
- Añade tests unitarios e integración (Jest + supertest) y workflow de GitHub Actions para ejecutar la suite (skipping DB init en CI).

Archivos clave:

- `backend/src/shared/utils/getTargetCondoId.js`
- `backend/src/shared/middlewares/validateCondoOverride.js`
- `backend/src/app.js`, `backend/src/server.js`
- `backend/test/` (unit + integration)
- `backend/package.json` (scripts + devDeps)
- `backend/.github/workflows/ci-tests.yml`

Cómo probar localmente:

1) Desde PowerShell en la carpeta `backend`:

```powershell
npm install
npm test
```

2) Para ejecutar servidor local (no recomendado antes de revisar credenciales DB):

```powershell
node src/server.js
```

Notas:
- CI ejecuta `npm test` con `NODE_ENV=test` y `SKIP_DB_INIT=1`.
- Para integración completa con DB, configurar un servicio de PostgreSQL en CI y eliminar `SKIP_DB_INIT`.

Solicito revisión enfocada en:
- Aprobación de la política de override (solo ADMIN/MANAGER) y formato del audit log.
- Revisión rápida en los controladores que ahora usan `getTargetCondoId` para garantizar compatibilidad con consultas existentes.
