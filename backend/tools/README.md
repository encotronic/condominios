# Herramientas de `backend/tools`

Pequeños scripts para facilitar pruebas en desarrollo local.

## seed-owner-unit.js
Crea en una transacción: un `user` (con password `password123`), un `owner` vinculado al `user` y una `unit` asociada.

Uso:

```powershell
# desde la raíz del repo
node backend/tools/seed-owner-unit.js --condoId <CONDOMINIUM_ID>
```

El script lee por defecto `backend/.env`. Asegúrate de que el servidor backend no esté usando otras credenciales diferentes.

Salida: muestra los IDs creados (user, owner, unit).

> Nota: el script es para desarrollo local exclusivamente. No guardes contraseñas en texto plano en repositorios remotos.

## Limpieza
He eliminado scripts de inspección temporales y mantenido `seed-owner-unit.js` como herramienta útil de desarrollo.

Si quieres que los reañada o los convierta en tests automatizados, dime y los preparo.
