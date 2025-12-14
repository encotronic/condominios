// backend/src/shared/database/db.js
const { Pool } = require('pg');

// ⚙️ CREDENCIALES CONFIGURADAS
const pool = new Pool({
  user: process.env.DB_USER,      
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prueba de conexión al iniciar (omitir en tests o si SKIP_DB_INIT está activado)
if (process.env.NODE_ENV !== 'test' && !process.env.SKIP_DB_INIT) {
  pool.connect()
    .then(client => {
      console.log('✅ Conexión a PostgreSQL establecida con éxito.');
      client.release();
    })
    .catch(err => {
      // En entornos no-test, reportar pero no hacer crash automático si se desea
      console.error('❌ Error CRÍTICO de conexión a PostgreSQL:', err.stack);
      // Mantener comportamiento previo: salir con error para entornos reales
      process.exit(1);
    });
} else {
  // No intentar conexión cuando estamos en test o se solicita explícitamente
  if (process.env.NODE_ENV === 'test') console.log('[db] Inicialización de DB omitida en modo test');
}

module.exports = {
  /** Función estándar para ejecutar consultas SQL */
  query: (text, params) => pool.query(text, params),
  
  /** Para transacciones (BEGIN/COMMIT) */
  getClient: () => pool.connect(),
  
  pool: pool
};