# Ejecutar migraciones localmente

Sigue estos pasos en PowerShell para ejecutar las migraciones contra tu base de datos local (por ejemplo gestionada con pgAdmin). Reemplaza las variables por tus valores reales.

```powershell
cd "C:\Users\Netelcom\Documents\App movil\condominios\backend"
npm install
$env:DATABASE_URL = 'postgres://<DB_USER>:<DB_PASS>@<DB_HOST>:<DB_PORT>/<DB_NAME>'
# Crear la extensión necesaria (pgcrypto) si aún no existe
psql $env:DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
# Ejecutar migraciones
npx node-pg-migrate up
```

Notas:
- Si tu `psql` no está en PATH, usa la instalación de pgAdmin o el cliente `psql` incluido en PostgreSQL.
- Si las migraciones fallan por permisos, verifica las credenciales y que el usuario tenga privilegios para crear extensiones y tablas.
