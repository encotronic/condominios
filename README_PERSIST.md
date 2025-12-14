Instrucciones rápidas para mantener frontend/backend activos en Windows usando PM2

1) Instalar PM2 globalmente (ejecutar en PowerShell como administrador):

   npm install -g pm2

2) Construir el frontend y arrancar los procesos (modo recomendado):

   cd "C:\Users\Netelcom\Documents\App movil\condominios"
   # Construir frontend
   cd frontend; npm install; npm run build; cd ..
   # Iniciar con PM2 (ejecutar desde la raíz)
   pm2 start ecosystem.config.js --update-env

3) Guardar el estado y configurar reinicio automático al iniciar sesión:

   pm2 save
   pm2 startup

Nota sobre Windows: `pm2 startup` imprimirá instrucciones específicas. Ejecuta la línea sugerida como administrador.

Alternativa (si no quieres PM2): usar `Start-Process -FilePath 'npm' -ArgumentList 'run','dev' -WorkingDirectory 'frontend'` para lanzar en segundo plano,
pero no sobrevivirá a reinicios ni fallos como lo hace PM2.
