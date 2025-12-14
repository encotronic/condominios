# Accesos y credenciales (registro central)

Este archivo sirve como índice de ubicaciones y cuentas conocidas relacionadas con el proyecto. NO guardar secretos en texto plano aquí si el repositorio es público; usar un vault o GitHub Secrets.

---

## Notas generales
- Mantener las credenciales en un gestor seguro (Vault, 1Password, Bitwarden, GitHub Secrets).  
- Si algún secreto fue commiteado por error, rotarlo inmediatamente y eliminarlo del repositorio.

## Ubicaciones de credenciales / accesos detectados

- `backend/.env` — contiene variables de conexión a la base de datos (`DB_USER`, `DB_PASS`, `DB_HOST`, `DB_NAME`, `DB_PORT`) y `JWT_SECRET`. Revisar y mover a un secret manager.
- `backend/.github/workflows/ci-tests.yml` — variables temporales de CI usadas en los jobs de prueba (`POSTGRES_USER`, `POSTGRES_PASSWORD`) — sólo para CI de prueba.
- `backend/scripts` y `backend/tools` — scripts que pueden leer `backend/.env` (ej.: `seed-owner-unit.js` usa dotenv). Revisar antes de ejecutar en entornos públicos.
- `1docs/1token_git.md` (si existe localmente) — token personal para interacciones con la API de GitHub (no subirlo al repo).
- Comandos de ejemplo/documentación en `README` y `scripts/` pueden contener referencias a credenciales de ejemplo.

## Cuentas y servicios (recomendado registrar aquí con control de acceso)
- Base de datos PostgreSQL (entorno local/test): host, puerto, usuario, contraseña, nombre BD — **NO** pegar contraseñas en este fichero si el repo es compartido.
- Panel de administración (pgAdmin): usuario/contraseña (mantener en vault).
- GitHub: owner/organización y usuarios con permisos para crear secrets/Actions.
- Proveedores de pago (si están integrados): credenciales API (mantener en secret manager y no en repo).

## Acciones recomendadas ahora
1. Mover `backend/.env` fuera del repositorio y añadir `backend/.env` a `.gitignore` si no está ya.  
   - Comando sugerido: `git rm --cached backend/.env && git commit -m "chore: remove backend .env from repo"`
2. Rotar las contraseñas que aparecen en `backend/.env` si el fichero fue público.  
3. Crear un secreto en GitHub Actions para producción (`PROD_DATABASE_URL`) y usarlo en workflows en vez de poner valores en archivos.  
4. Centralizar credenciales en un vault y documentar en este fichero sólo la ubicación (no los secretos).


Uso para crear PR automáticamente
--------------------------------
Si tienes un PAT guardado en `1docs/1token_git.md` puedes ejecutar localmente este script para crear el PR usado por las tareas anteriores:

PowerShell (ejecutar desde la raíz del repo):

```powershell
cd "C:\Users\Netelcom\Documents\App movil\condominios"
.\scripts\create_pr_from_token.ps1
```

Notas de seguridad:
- El script sólo lee `1docs/1token_git.md` localmente y llama a la API de GitHub.
- No pegues el token en chats; rota/revoca el PAT cuando termine su uso.
Archivo creado: `1docs/accesos.md` — actualizar aquí los accesos conocidos y marcar quién tuvo permiso para acceder/rotar.
