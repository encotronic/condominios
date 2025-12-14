# Plan de trabajo — Enfoque sistema completo

Fecha: 2025-12-14 (actualizado)

## 1. Objetivo general

Diseñar, implementar y poner en producción un sistema de gestión de condominios multi-tenant que incluya: autenticación y autorización, gestión de condominios/unidades/propietarios, facturación y cobros, pagos integrados, reportes, y una Cartelera Digital integrada con selector multi-condominio. El sistema debe ser seguro, testeable, observable y desplegable en CI/CD.

## 2. Alcance funcional (módulos principales)

- Autenticación y autorización (`auth`): login, registro, roles y permisos, refresh tokens, gestión de sesiones.
- Gestión de condominios (`condo`): CRUD condominios, datos de configuración, lista de condominios por usuario.
- Gestión de unidades y propietarios (`units`, `owners`): CRUD unidades, asignación de propietarios, import/seed.
- Facturación y cobranza (`billing`): cargos recurrentes/one-time, generación de facturas, aplicación a unidades.
- Pagos (`payments`): pasarela de pagos, conciliación, webhooks.
- Reportes (`reports`): generación de reportes financieros y operativos, export CSV/PDF.
- Cartelera Digital (`announcements`): CRUD mensajes, visibilidad por targets, publicación y recepción (acknowledge).
- Integración y APIs (`api`): endpoints REST/GraphQL según necesidad; versionado y compatibilidad.
- Observabilidad y auditoría (`logs`, `audit`): audit trail para acciones sensibles (overrides, cambios de facturas, pagos), métricas y tracing.

## 3. Requerimientos no funcionales

- Seguridad: RBAC, validación estricta de inputs, protección contra inyección/CSRF, cifrado de secretos.
- Multi-tenancy: aislamiento lógico por `condominiumId` (token-based default + override controlado para roles autorizados).
- Escalabilidad: diseño de consultas y paginación, índices DB, caché donde sea necesario.
- Testabilidad: tests unitarios, integración y E2E; infraestructura para pruebas reproducibles.
- Operaciones: CI/CD, migraciones versionadas, scripts de seed, monitorización y alertas.

## 4. Artefactos y estructura del repo

- backend/
  - src/modules/{auth,condo,units,owners,billing,payments,reports,announcements}
  - src/shared/{database,utils,middlewares}
  - test/{unit,integration,e2e}
  - scripts/ (seed, e2e helpers)
- frontend/
  - app/, components/, lib/api/
  - provider para condominios, switcher UI, páginas del dashboard
- infra/
  - .github/workflows, docker-compose para local, migraciones SQL
- docs/
  - README, CHANGELOG, RUNBOOK para despliegue y recuperación

## 5. Plan de trabajo (tareas agrupadas por fases)

Fase 0 — Preparación
- Revisar y consolidar el esquema de BD y migraciones.
- Añadir configuración de entorno y secrets vault (local/.env, CI secrets).
- Extraer/asegurar `app` para testabilidad.

Fase 1 — Core Backend (mínimo viable)
- Implementar `auth` (JWT, roles, middleware de auth y role).
- Implementar `condo` y endpoint `GET /api/auth/condominiums`.
- Centralizar resolución de `condominiumId` (`getTargetCondoId`) con validación y auditoría.
- Añadir middleware `validateCondoOverride` y aplicarlo en routers.

Fase 2 — Módulos funcionales
- `units` / `owners`: CRUD + import/seed.
- `billing`: modelado de cargos, endpoints para listar/generar.
- `payments`: endpoints y lógica para registrar y conciliar pagos (webhooks simulados en env de test).
- `announcements`: Cartelera Digital con targets y publicación.

Fase 3 — Frontend mínimo viable
- Provider/context de `currentCondominium`, persistencia en `localStorage`.
- Switcher UI integrado en dashboard layout.
- Páginas básicas: lista de cargos, lista de anuncios, crear anuncio.

Fase 4 — Tests y Calidad
- Tests unitarios para utilidades y servicios críticos.
- Tests de integración (supertest) para endpoints clave (auth, announcements, billing).
- E2E en CI opcional con Postgres de prueba y migraciones.
- Linting, formateo y políticas de PR.

Fase 5 — CI/CD, despliegue y observabilidad
- Workflow de CI: instalar deps, ejecutar tests, reportar cobertura.
- CD: despliegue a staging automatizado con migraciones.
- Observabilidad: logs estructurados, métricas básicas y alertas.

Fase 6 — Hardenings y producción
- Revisiones de seguridad, tests de carga simples, plan de retención de logs.
- Migrar audit logs a tabla DB o sistema centralizado.

## 6. Entregables por hitos

- Hito 1: Core auth + condo + getTargetCondoId + tests unitarios.
- Hito 2: Billing + payments + units CRUD + tests integración.
- Hito 3: Frontend provider + switcher + UI básico de Cartelera.
- Hito 4: CI pipeline y tests E2E en staging.

## 7. Criterios de aceptación (por módulo)

- Auth: login devuelve JWT con claims `{id, role, condoId}`; protected endpoints devuelven 401 cuando corresponde.
- Condo: `GET /api/auth/condominiums` devuelve lista accesible por el usuario.
- Billing/Payments: endpoints devuelven datos paginados y no permiten cross-condo without override.
- Announcements: creación/listado respeta `condominiumId` y targets; overrides auditados.

## 8. Riesgos principales y mitigaciones

- Dependencia de infraestructura (Postgres): usar mocks/local docker-compose para tests.
- Overrides maliciosos o incorrectos: validar UUIDs y auditar; limitar a roles específicos.
- Escalabilidad de logs: plan para mover audit logs a DB o ELK.

## 9. Tareas inmediatas y asignación sugerida

- Hoy: finalizar `getTargetCondoId`, `validateCondoOverride`, y tests unitarios (responsable: backend dev).
- Próximos 3 días: endpoints de `billing` y `announcements` usando helper; frontend implementa provider y switcher (responsable: full-stack).
- En paralelo: configurar CI y workflow de tests (responsable: devops/backend).

## 10. Documentación y PRs

- Cada feature debe tener un PR pequeño con `CHANGELOG` y pasos de prueba en `PR_BODY.md`.
- Mantener `1docs/` con la documentación de alto nivel y runbooks.

---

Este documento reemplaza y amplía la versión anterior para cubrir todo el sistema, sus módulos, fases de trabajo y criterios de aceptación.
